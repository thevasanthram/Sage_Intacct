look_up();

async function look_up() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let look_up = new IA.Functions.Common.Lookup();
    look_up.objectName = "ARINVOICE";

    const response = await client.execute(look_up);
    console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    console.log("Result:");
    console.log(JSON.stringify(json_data));
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
