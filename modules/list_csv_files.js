const fs = require("fs");
const path = require("path");

async function listCsvFiles(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Filter .csv files
      const csvFiles = files.filter((file) => path.extname(file) === ".csv");
      resolve(csvFiles);
    });
  });
}

module.exports = listCsvFiles;
