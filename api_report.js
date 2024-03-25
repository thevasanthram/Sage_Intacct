const fs = require("fs");
const path = require("path");

// Function to recursively read directory and collect file names with parent folder names
function readDirectory(directoryPath, parentFolderName, fileList) {
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively read subdirectory
      readDirectory(filePath, file, fileList);
    } else {
      // Split the filename using underscore as the delimiter
      const parts = file.split("_");
      const firstColumn = parts[0];
      const secondColumn = parts[1];

      // Add file to list with parent folder name
      fileList.push({ firstColumn, secondColumn, parentFolderName });
    }
  });
}

// Function to write data to CSV file
function writeToCSV(fileList, outputFilePath) {
  // Write header to CSV file
  let csvContent = "Category,API name,Response Name\n";

  // Append file data to CSV content
  fileList.forEach((file) => {
    csvContent += `${file.firstColumn},${file.secondColumn},${file.parentFolderName}\n`;
  });

  // Write CSV content to file
  fs.writeFileSync(outputFilePath, csvContent);
}

// Main function
function main() {
  const mainFolderPath = "./Responses"; // Replace with your main folder path
  const outputFilePath = "output.csv"; // Output CSV file path

  const fileList = [];

  // Read main directory and collect file names with parent folder names
  readDirectory(mainFolderPath, "", fileList);

  // Write collected data to CSV file
  writeToCSV(fileList, outputFilePath);

  console.log("CSV file created successfully.");
}

// Run main function
main();
