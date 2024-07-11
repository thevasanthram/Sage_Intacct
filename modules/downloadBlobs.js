const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");

// Define your connection string and container name
const AZURE_STORAGE_CONNECTION_STRING =
  "BlobEndpoint=https://pinnaclemep-microsoftrouting.blob.core.windows.net/;QueueEndpoint=https://pinnaclemep-microsoftrouting.queue.core.windows.net/;FileEndpoint=https://pinnaclemep-microsoftrouting.file.core.windows.net/;TableEndpoint=https://pinnaclemep-microsoftrouting.table.core.windows.net/;SharedAccessSignature=sv=2022-11-02&ss=bf&srt=co&sp=rwlactfx&se=2024-08-09T19:42:10Z&st=2024-07-10T11:42:10Z&spr=https,http&sig=9RsClCqeQNyOwtxKrElRpssuqb3mZgwmf3W6dB1XWPE%3D";
const containerName = "pinnacle-mep-sandbox";

async function listAndDownloadBlobs(currentBatchDate) {
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);

  console.log(`Listing blobs in container ${containerName}...`);

  // Define the directory one level up from the current script directory
  const targetDir = path.join(__dirname, "..", "blob_files");

  // Create the directory if it does not exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }

  // Collect download promises
  const downloadPromises = [];

  // List the blobs in the container
  for await (const blob of containerClient.listBlobsFlat()) {
    if (blob.name.includes(currentBatchDate) && blob.name.endsWith(".csv")) {
      console.log(`Downloading blob ${blob.name}...`);
      const blobClient = containerClient.getBlobClient(blob.name);
      const downloadBlockBlobResponse = await blobClient.download(0);
      const filePath = path.join(targetDir, blob.name);

      const downloadPromise = new Promise((resolve, reject) => {
        const writableStream = fs.createWriteStream(filePath);
        downloadBlockBlobResponse.readableStreamBody.pipe(writableStream);

        writableStream.on("finish", () => {
          console.log(`Downloaded ${blob.name} to ${filePath}`);
          resolve();
        });

        writableStream.on("error", reject);
      });

      downloadPromises.push(downloadPromise);
    }
  }

  // Wait for all downloads to complete
  await Promise.all(downloadPromises);
}

module.exports = listAndDownloadBlobs;
