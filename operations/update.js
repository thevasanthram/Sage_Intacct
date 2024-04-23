async function query() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    query.objectName = "ARINVOICE";

    // GreaterThanOrEqualTo condition
    let greaterThanOrEqualTo =
      new IA.Functions.Common.Query.Comparison.GreaterThanOrEqualTo.GreaterThanOrEqualToDateTime();
    greaterThanOrEqualTo.field = "WHENCREATED";
    greaterThanOrEqualTo.value = new Date("2024-04-20");

    // LessThan condition
    let lessThan =
      new IA.Functions.Common.Query.Comparison.LessThan.LessThanDateTime();
    lessThan.field = "WHENCREATED";
    lessThan.value = new Date("2024-04-05");

    // Combine conditions with logical AND
    let andCondition = new IA.Functions.Common.Query.Logical.AndCondition();
    andCondition.conditions = [greaterThanOrEqualTo, lessThan];

    // Set the combined condition as the query
    query.query = greaterThanOrEqualTo;

    const response = await client.execute(query);
    const result = response.getResult();
    // '_status', "_functionName", "_controlId", "_listType", "_totalCount", "_count", "_numRemaining", "_resultId", "_data";

    let json_data = result.data;

    console.log("result: ", Object.keys(result));

    console.log("Result:", json_data.length);
    console.log("First Record Number:", json_data[0]["RECORDNO"]);
    console.log("First Record Created Date:", json_data[0]["WHENCREATED"]);
    console.log("Second Record Number:", json_data[1]["RECORDNO"]);
    console.log("Second Record Created Date:", json_data[1]["WHENCREATED"]);
    // Process retrieved data further as needed
  } catch (ex) {
    console.log("Error from main: ", ex);

    // Log additional information if available
    if (
      ex.response &&
      ex.response.control &&
      ex.response.control.status === "failure" &&
      ex.response.errormessage
    ) {
      console.log(
        "Error Message:",
        ex.response.errormessage.error.description2
      );
    }
  }
}

query();
