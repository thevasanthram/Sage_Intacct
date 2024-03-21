query();

async function query() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    query.objectName = "ARINVOICE";
    query.returnFormat = "json";
    query.pageSize = 1000;
    query.result = "7030372d776562303333ZfvX9bYobeFo6jEeJwktBwAAAAU4";
    // query.controlId = "9cdd2db3-9965-47a3-b3d9-d49974672ad5";

    const response = await client.execute(query);
    console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    // console.log(Object.values(json_data));
    // console.log(Object.keys(json_data).length);
    // console.log("Result:", Object.keys(Object.values(json_data)[0]));
    // console.log("Result:", Object.keys(Object.values(json_data)[0]).length);
    // console.log(JSON.stringify(json_data));
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
