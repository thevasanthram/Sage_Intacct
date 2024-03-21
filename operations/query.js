const fs = require("fs");

query();

async function query() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    console.log("query: ", query);
    query.objectName = "ARINVOICE";
    query.returnFormat = "json";
    // query.pageSize = 1000;
    // query.page = 2;
    // query.result = "7030372d776562303331Zfvdh7j8mvNonxj4Sqag_gAAAAw4";
    // query.controlId = "1711005998476";

    const response = await client.execute(query);
    // console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    // console.log(Object.values(json_data));
    // console.log(Object.keys(json_data).length);
    // console.log("Result:", Object.keys(Object.values(json_data)[0]));
    // console.log("Result:", Object.values(json_data)[0]["RECORDNO"]);
    // console.log(JSON.stringify(json_data));

    const arr = [];
    Object.values(json_data).map((invoice) => {
      arr.push(invoice["RECORDNO"]);
    });

    fs.writeFile("./response.js", JSON.stringify(arr), () => {
      console.log("data written to file");
    });

    // console.log(arr);
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
