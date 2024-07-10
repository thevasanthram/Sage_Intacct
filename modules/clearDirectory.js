const fs = require("fs");
const path = require("path");

async function clearDirectory(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error("Error reading directory:", err);
      }

      if (files.length === 0) {
        return console.log("No files to delete.");
      }

      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            return console.error("Error deleting file:", err);
          }
          console.log(`${file} deleted`);
        });
      });
    });
  }
}

module.exports = clearDirectory;
