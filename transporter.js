const fs = require("fs");
const path = require("path");
const listAndDownloadBlobs = require("./modules/downloadBlobs");
const readCSV = require("./modules/read_blob_files");
const listCsvFiles = require("./modules/list_csv_files");
const clearDirectory = require("./modules/clearDirectory");
const create_sql_connection = require("./modules/create_sql_connection");
const sage_data_insertion = require("./modules/sage_data_insertion");

async function transporter() {
  const blobFilesFolderPath = path.join(__dirname, "blob_files");
  let error_status = "downloading blobs";

  try {
    let dataLake = {};

    // clear existing files
    await clearDirectory(blobFilesFolderPath);

    // download csv files from pinnacle-mep-sandbox container
    await listAndDownloadBlobs();

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

    // for (let i = 0; i < csv_files.length; i++) {
    //   console.log(`processing file: ${csv_files[i]}...`);
    //   try {
    //     const csvFileName = csv_files[i];
    //     const completePath = path.join(blobFilesFolderPath, csvFileName);
    //     const data = await readCSV(completePath);

    //     const tableName = csvFileName.split(".")[0];

    //     console.log(`${csvFileName}: `, data.length);

    //     const headerData = data[0];

    //     let data_insertion_status = false;
    //     do {
    //       data_insertion_status = await sage_data_insertion(
    //         sql_request,
    //         data,
    //         headerData,
    //         tableName
    //       );
    //     } while (!data_insertion_status);
    //   } catch (err) {
    //     console.log(`Error while reading data from ${csvFileName}`, err);
    //   }
    // }
  } catch (error) {
    console.log(`Error while ${error_status}: `, error);
  }
}

transporter();
