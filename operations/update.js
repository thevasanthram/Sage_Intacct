async function query() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  let data_pool = [];

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    query.objectName = "GLDETAIL";

    // GreaterThanOrEqualTo condition
    let greaterThanOrEqualTo =
      new IA.Functions.Common.Query.Comparison.GreaterThanOrEqualTo.GreaterThanOrEqualToDateTime();
    greaterThanOrEqualTo.field = "WHENMODIFIED";
    greaterThanOrEqualTo.value = new Date("2024-06-04");

    // LessThan condition
    let lessThan =
      new IA.Functions.Common.Query.Comparison.LessThan.LessThanDateTime();
    lessThan.field = "WHENMODIFIED";
    lessThan.value = new Date("2024-06-05");

    // Combine conditions with logical AND
    let andCondition = new IA.Functions.Common.Query.Logical.AndCondition();
    andCondition.conditions = [greaterThanOrEqualTo, lessThan];

    // Set the combined condition as the query
    query.query = greaterThanOrEqualTo;

    const response = await client.execute(query);
    const result = response.getResult();
    let _totalCount = response._results[0]._totalCount;
    let _numRemaining = response._results[0]._numRemaining;
    let result_id = response._results[0]._resultId;

    // '_status', "_functionName", "_controlId", "_listType", "_totalCount", "_count", "_numRemaining", "_resultId", "_data";

    let json_data = result.data;

    console.log("result: ", Object.keys(result));

    console.log("Result:", json_data.length);
    console.log("First Record Number:", json_data[0]["RECORDNO"]);
    console.log("First Record Created Date:", json_data[0]["WHENMODIFIED"]);
    console.log("Second Record Number:", json_data[1]["RECORDNO"]);
    console.log("Second Record Created Date:", json_data[1]["WHENMODIFIED"]);

    data_pool = [...json_data];

    let shouldIterate = _numRemaining ? true : false;

    while (shouldIterate) {
      let query = new IA.Functions.Common.ReadMore();
      query.resultId = result_id;

      let response = await client.execute(query);
      const result = response.getResult();

      let _totalCount = response._results[0]._totalCount;
      _numRemaining = response._results[0]._numRemaining;

      console.log(`remaining records: `, _numRemaining);

      if (_numRemaining == 0) {
        shouldIterate = false;
      }

      let json_data = result.data;

      data_pool.push(...json_data);
    }

    console.log("data_pool: ", data_pool.length);

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
