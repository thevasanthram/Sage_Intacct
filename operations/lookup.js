look_up();

async function look_up() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let look_up = new IA.Functions.Common.ReadByQuery();
    look_up.objectName = "BANKFEEENTRY";
    // look_up.controlId = "33ce487e-b41f-43aa-9474-8d0c7bf1f182";
    // look_up.resultId = "7030372d776562303330ZgGJ04fUhVQBtPpvajfIZQAAABs4";

    const response = await client.execute(look_up);
    console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    console.log("Result:", json_data);
    // console.log(JSON.stringify(json_data));
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
