const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");

// Define your connection string and container name
const AZURE_STORAGE_CONNECTION_STRING =
  "BlobEndpoint=https://pinnaclemep-microsoftrouting.blob.core.windows.net/;QueueEndpoint=https://pinnaclemep-microsoftrouting.queue.core.windows.net/;FileEndpoint=https://pinnaclemep-microsoftrouting.file.core.windows.net/;TableEndpoint=https://pinnaclemep-microsoftrouting.table.core.windows.net/;SharedAccessSignature=sv=2022-11-02&ss=bf&srt=co&sp=rwdlaciytfx&se=2024-07-10T14:27:27Z&st=2024-07-10T06:27:27Z&spr=https,http&sig=AvAfCa1CrQJ4o25lCxKI1TYoqOclzAzzTicnicZexfY%3D";
const containerName = "pinnacle-mep-sandbox";

async function listAndDownloadBlobs() {
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

  // List the blobs in the container
  for await (const blob of containerClient.listBlobsFlat()) {
    if (blob.name.endsWith(".csv")) {
      console.log(`Downloading blob ${blob.name}...`);
      const blobClient = containerClient.getBlobClient(blob.name);
      const downloadBlockBlobResponse = await blobClient.download(0);
      const filePath = path.join(targetDir, blob.name);

      // Save the file to the local file system
      const writableStream = fs.createWriteStream(filePath);
      downloadBlockBlobResponse.readableStreamBody.pipe(writableStream);

      writableStream.on("finish", () => {
        console.log(`Downloaded ${blob.name} to ${filePath}`);
      });
    }
  }
}

listAndDownloadBlobs().catch((error) => {
  console.error("Error running sample:", error.message);
});
