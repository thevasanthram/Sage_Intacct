const bootstrap = require("./../bootstrap");
const IA = require("@intacct/intacct-sdk");
const create_flat_table = require("./create_flat_table");
const flat_data_insertion = require("./flat_data_insertion");

async function query(
  sql_request,
  api_keyword,
  api_name,
  api_category,
  filtering_condition
) {
  console.log("api_keyword: ", api_keyword);
  console.log("api_name: ", api_name);
  console.log("api_category: ", api_category);
  console.log("filtering_condition: ", filtering_condition);

  try {
    let client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    query.objectName = api_keyword;

    let greaterThanOrEqualTo;
    let lessThan;
    let andCondition;

    if (filtering_condition["greaterThanOrEqualTo"]) {
      // GreaterThanOrEqualTo condition
      greaterThanOrEqualTo =
        new IA.Functions.Common.Query.Comparison.GreaterThanOrEqualTo.GreaterThanOrEqualToDateTime();
      greaterThanOrEqualTo.field = "WHENCREATED";
      greaterThanOrEqualTo.value = new Date("2024-04-04");

      query.query = greaterThanOrEqualTo;
    }

    if (filtering_condition["lessThan"]) {
      // LessThan condition
      lessThan =
        new IA.Functions.Common.Query.Comparison.LessThan.LessThanDateTime();
      lessThan.field = "WHENCREATED";
      lessThan.value = new Date("2024-04-05");

      query.query = lessThan;
    }

    if (
      filtering_condition["greaterThanOrEqualTo"] &&
      filtering_condition["lessThan"]
    ) {
      // Combine conditions with logical AND
      andCondition = new IA.Functions.Common.Query.Logical.AndCondition();
      andCondition.conditions = [greaterThanOrEqualTo, lessThan];

      // Set the combined condition as the query
      query.query = andCondition;
    }

    let response = await client.execute(query);
    let _totalCount = response._results[0]._totalCount;
    let _numRemaining = response._results[0]._numRemaining;
    const result = response.getResult();
    let json_data = result.data;

    // if no data, then return
    if (json_data.length < 0) {
      return;
    }

    // '_status', "_functionName", "_controlId", "_listType", "_totalCount", "_count", "_numRemaining", "_resultId", "_data";

    let data_pool = [...json_data];

    let header_data = Object.keys(json_data[0]);

    // create table if its not exist
    let table_name = api_category + "_" + api_name;
    table_name = table_name
      .replace(/ /g, "_")
      .replace(/-/g, "_")
      .replace("/", "_");

    // let table_creation_status = false;
    // do {
    //   table_creation_status = await create_flat_table(
    //     sql_request,
    //     table_name,
    //     header_data
    //   );
    // } while (!table_creation_status);

    let shouldIterate = _numRemaining ? true : false;

    while (shouldIterate) {
      client = bootstrap.client();

      let query = new IA.Functions.Common.ReadMore();
      query.resultId = response._results[0]._resultId;

      response = await client.execute(query);
      const result = response.getResult();

      _totalCount = response._results[0]._totalCount;
      _numRemaining = response._results[0]._numRemaining;

      console.log(
        `${api_name} -> ${api_keyword} -> remaining records: `,
        _numRemaining
      );

      if (_numRemaining == 0) {
        shouldIterate = false;
      }

      let json_data = result.data;

      data_pool.push(...json_data);

      if (data_pool.length >= 50000) {
        // write into db
        let data_insertion_status = false;
        do {
          data_insertion_status = await flat_data_insertion(
            sql_request,
            data_pool,
            header_data,
            table_name
          );
        } while (!data_insertion_status);

        // free data_pool
        data_pool = [];
      }
    }

    if (data_pool.length > 0) {
      let data_insertion_status = false;
      do {
        data_insertion_status = await flat_data_insertion(
          sql_request,
          data_pool,
          header_data,
          table_name
        );
      } while (!data_insertion_status);

      data_pool = [];
    }
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

module.exports = query;
