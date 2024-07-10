const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const csvFilePath = path.join(
  __dirname,
  "../blob_files/PROJECT.change.35.2024-07-09_13.23.18_UTC_cr_00000.csv"
); // Update with your actual CSV file path

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

readCSV(csvFilePath)
  .then((data) => {
    console.log("CSV Data:", data);
    return data;
  })
  .catch((error) => {
    console.error("Error reading CSV file:", error);
  });
