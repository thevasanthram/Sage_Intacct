look_up();
const fs = require("fs");

async function look_up() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    query.objectName = "ARINVOICE";
    query.returnFormat = "csv";
    query.pageSize = 1000;

    const response = await client.execute(query);
    console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    console.log("Result:");
    console.log(JSON.stringify(json_data));

    fs.writeFile("./csv_try.csv", JSON.stringify(json_data), () => {
      console.log("File has written successfully");
    });
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
