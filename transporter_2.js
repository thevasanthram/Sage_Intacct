const fs = require("fs");
const path = require("path");
const listAndDownloadBlobs = require("./modules/downloadBlobs");
const readCSV = require("./modules/read_blob_files");
const listCsvFiles = require("./modules/list_csv_files");
const clearDirectory = require("./modules/clearDirectory");
const create_sql_connection = require("./modules/create_sql_connection");
const sage_data_insertion = require("./modules/sage_data_insertion");

let currentBatchDate = new Date();
currentBatchDate.setHours(7, 0, 0, 0);

console.log("currentBatchDate: ", currentBatchDate);

async function transporter() {
  const blobFilesFolderPath = path.join(__dirname, "blob_files");
  let error_status = "downloading blobs";

  try {
    // clear existing files
    await clearDirectory(blobFilesFolderPath);

    // download csv files from pinnacle-mep-sandbox container (only today)
    await listAndDownloadBlobs(currentBatchDate.toISOString().slice(0, 10));

    error_status = "reading blob_files directory";

    const csv_files = await listCsvFiles(blobFilesFolderPath);

    console.log(
      csv_files.length,
      `csv ${csv_files.length > 1 ? "files" : "file"} to be processed...`
    );

    // creating a client for azure sql database operations
    let sql_request = "";
    do {
      sql_request = await create_sql_connection();
    } while (!sql_request);

    for (let i = 0; i < csv_files.length; i++) {
      console.log(`processing file: ${csv_files[i]}...`);
      try {
        const csvFileName = csv_files[i];
        const completePath = path.join(blobFilesFolderPath, csvFileName);
        const data = await readCSV(completePath);

        const tableName = csvFileName.split(".")[0];

        console.log(`${csvFileName}: `, data.length);

        const headerData = data[0];

        let data_insertion_status = false;
        do {
          data_insertion_status = await sage_data_insertion(
            sql_request,
            data,
            headerData,
            tableName
          );
        } while (!data_insertion_status);
      } catch (err) {
        console.log(`Error while reading data from ${csvFileName}`, err);
      }
    }
  } catch (error) {
    console.log(`Error while ${error_status}: `, error);
  }
}

// transporter();

async function orchestrate() {
  let should_auto_update = true;

  // Step 1: Call start_pipeline
  await transporter();

  do {
    const next_batch_time = new Date(currentBatchDate);

    // adjust the next_batch_time setting as required
    next_batch_time.setDate(next_batch_time.getDate() + 1);
    next_batch_time.setUTCHours(7, 0, 0, 0);

    console.log("Finished batch: ", currentBatchDate);
    console.log("Next batch: ", next_batch_time);

    const now = new Date();

    if (now < next_batch_time) {
      // Schedule the next call after the time until the next batch
      const timeUntilNextBatch = next_batch_time - now; // Calculate milliseconds until the next batch
      console.log("Timer function entering", timeUntilNextBatch);

      await new Promise((resolve) => setTimeout(resolve, timeUntilNextBatch));
    } else {
      console.log("Next batch initiated");

      // now.setHours(7, 0, 0, 0);
      currentBatchDate = next_batch_time;

      // Step 1: Call start_pipeline
      await transporter();
    }

    should_auto_update = true;
  } while (should_auto_update);
}

orchestrate();
