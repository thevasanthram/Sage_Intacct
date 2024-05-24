const path = require("path");
const fs = require("fs");

const schemaPath = path.join(__dirname, "/modules/drop_all_table.sql"); // Use an absolute path
const schema = fs.readFileSync(schemaPath, "utf-8");

console.log(schema);
