const bootstrap = require("./../bootstrap");
const IA = require("@intacct/intacct-sdk");
const create_flat_table = require("./create_flat_table");
const flat_data_insertion = require("./flat_data_insertion");
const hvac_merge_insertion = require("./hvac_merge_insertion");
const find_lenghthiest_header = require("./find_lengthiest_header");
const csv_generator = require("./../modules/csv_generator");

async function query(
  sql_request,
  api_keyword,
  api_name,
  api_category,
  filtering_condition,
  data_pool,
  result_id,
  _numRemaining,
  insertion_mode,
  column,
  is_first_time
) {
  // console.log("api_keyword: ", api_keyword);
  // console.log("api_name: ", api_name);
  // console.log("api_category: ", api_category);
  // console.log("filtering_condition: ", filtering_condition);

  let fetching_data_status = false;

  try {
    let client = bootstrap.client();

    let header_data;

    if (result_id.length == 0) {
      // first time
      let query = new IA.Functions.Common.ReadByQuery();
      query.objectName = api_keyword;

      let greaterThanOrEqualTo;
      let lessThan;
      let andCondition;

      if (filtering_condition["greaterThanOrEqualTo"]) {
        // GreaterThanOrEqualTo condition
        greaterThanOrEqualTo =
          new IA.Functions.Common.Query.Comparison.GreaterThanOrEqualTo.GreaterThanOrEqualToDateTime();
        greaterThanOrEqualTo.field = column;
        greaterThanOrEqualTo.value = new Date(
          filtering_condition["greaterThanOrEqualTo"]
        );

        query.query = greaterThanOrEqualTo;
      }

      if (filtering_condition["lessThan"]) {
        // LessThan condition
        lessThan =
          new IA.Functions.Common.Query.Comparison.LessThan.LessThanDateTime();
        lessThan.field = column;
        lessThan.value = new Date(filtering_condition["lessThan"]);

        query.query = lessThan;
      }

      if (
        filtering_condition["greaterThanOrEqualTo"] &&
        filtering_condition["lessThan"]
      ) {
        // Combine conditions with logical AND
        andCondition = new IA.Functions.Common.Query.Logical.AndCondition();
        andCondition.conditions = [greaterThanOrEqualTo, lessThan];
      }

      // Set the combined condition as the query
      query.query = andCondition;

      let response = await client.execute(query);

      let _totalCount = response._results[0]._totalCount;
      _numRemaining = response._results[0]._numRemaining;
      result_id = response._results[0]._resultId;

      const result = response.getResult();
      let json_data = result.data;

      console.log("_totalCount: ", _totalCount);

      // if no data, then return
      if (json_data.length < 0) {
        return;
      }

      // '_status', "_functionName", "_controlId", "_listType", "_totalCount", "_count", "_numRemaining", "_resultId", "_data";

      data_pool = [...json_data];

      if (json_data.length > 0) {
        header_data = Object.keys(json_data[0]);
      }
    }

    // create table if its not exist
    let table_name = api_category + "_" + api_name;
    table_name = table_name
      .replace(/ /g, "_")
      .replace(/-/g, "_")
      .replace("/", "_");

    let shouldIterate = _numRemaining ? true : false;

    while (shouldIterate) {
      let query = new IA.Functions.Common.ReadMore();
      query.resultId = result_id;

      let response = await client.execute(query);
      const result = response.getResult();

      let _totalCount = response._results[0]._totalCount;
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

        const lenghthiest_header = await find_lenghthiest_header(data_pool);
        // console.log("lenghthiest_header: ", lenghthiest_header);

        if (
          is_first_time &&
          (insertion_mode == "FLASHING" || insertion_mode == "UPADTE-FLASHING")
        ) {
          // first time
          do {
            data_insertion_status = await flat_data_insertion(
              sql_request,
              data_pool,
              lenghthiest_header,
              table_name,
              insertion_mode
            );
          } while (!data_insertion_status);

          is_first_time = false;
        } else {
          // save the old data in a file
          if (insertion_mode == "UPDATING") {
            console.log("total modified records: ", data_pool.length);

            const fetch_old_details_query = `SELECT * FROM ${table_name} WHERE RECORDNO IN (${data_pool
              .map((record) => {
                return `'${record["RECORDNO"]}'`;
              })
              .join(",")})`;

            const now = new Date();

            const fetched_details = await sql_request.query(
              fetch_old_details_query
            );

            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0"); // Adding 1 since months are 0-indexed
            const day = String(today.getDate()).padStart(2, "0");

            const formattedDate = `${year}_${month}_${day}`;

            // generating csv files for this data
            await csv_generator(
              "",
              "",
              fetched_details.recordset,
              fetched_details.recordset[0],
              table_name + `_${formattedDate}`,
              true,
              "old_changes"
            );

            const new_now = new Date();

            console.log("total time", now - new_now / 1000);

            console.log("fetched_details: ", fetched_details.recordset.length);
          }

          do {
            data_insertion_status = await hvac_merge_insertion(
              sql_request,
              data_pool,
              lenghthiest_header,
              table_name
            );
          } while (!data_insertion_status);
        }

        // free data_pool
        data_pool = [];
      }
    }

    // console.log("fetching done");

    // console.log("insertion_mode: ", insertion_mode);

    if (data_pool.length > 0) {
      let data_insertion_status = false;

      const lenghthiest_header = await find_lenghthiest_header(data_pool);
      // console.log("lenghthiest_header: ", lenghthiest_header);

      if (
        is_first_time &&
        (insertion_mode == "FLASHING" || insertion_mode == "UPADTE-FLASHING")
      ) {
        // first time
        do {
          data_insertion_status = await flat_data_insertion(
            sql_request,
            data_pool,
            lenghthiest_header,
            table_name,
            insertion_mode
          );
        } while (!data_insertion_status);

        is_first_time = false;
      } else {
        // save the old data in a file
        // if (insertion_mode == "UPDATING") {
        //   console.log("total modified records: ", data_pool.length);

        //   const fetch_old_details_query = `SELECT * FROM ${table_name} WHERE RECORDNO IN (${data_pool
        //     .map((record) => {
        //       return `'${record["RECORDNO"]}'`;
        //     })
        //     .join(",")})`;

        //   const now = new Date();

        //   const fetched_details = await sql_request.query(
        //     fetch_old_details_query
        //   );

        //   const today = new Date();
        //   const year = today.getFullYear();
        //   const month = String(today.getMonth() + 1).padStart(2, "0"); // Adding 1 since months are 0-indexed
        //   const day = String(today.getDate()).padStart(2, "0");

        //   const formattedDate = `${year}_${month}_${day}`;

        //   // generating csv files for this data
        //   await csv_generator(
        //     "",
        //     "",
        //     fetched_details.recordset,
        //     fetched_details.recordset[0],
        //     table_name + `_${formattedDate}`,
        //     true,
        //     "old_changes"
        //   );

        //   const new_now = new Date();

        //   console.log("total time", now - new_now / 1000);

        //   console.log("fetched_details: ", fetched_details.recordset.length);
        // }

        do {
          data_insertion_status = await hvac_merge_insertion(
            sql_request,
            data_pool,
            lenghthiest_header,
            table_name
          );
        } while (!data_insertion_status);
      }

      data_pool = [];
    }

    fetching_data_status = true;
  } catch (ex) {
    console.log(`Error from main- ${api_category} -> ${api_name}: `, ex);

    if (ex["errors"] && ex["errors"][0]) {
      const error_text = ex["errors"][0];

      console.log("error_text: ", error_text);

      if (
        error_text.indexOf("Account allocation module is not subscribed") !== -1
      ) {
        fetching_data_status = true;
      } else if (error_text.indexOf("Query Failed Object definition") !== -1) {
        fetching_data_status = true;
      } else if (
        error_text.indexOf(
          "You do not have permission for API operation READ_BY_QUERY"
        ) !== -1
      ) {
        fetching_data_status = true;
      } else if (
        error_text.indexOf(
          "API operation 'READ_BY_QUERY' cannot be performed on objects of type"
        ) !== -1
      ) {
        fetching_data_status = true;
      } else if (
        error_text.indexOf(
          "Error There was an error processing the request"
        ) !== -1
      ) {
        fetching_data_status = true;
      } else if (
        error_text.indexOf("You're not authorized to perform this action") !==
        -1
      ) {
        fetching_data_status = true;
      } else if (
        error_text.indexOf(
          "This feature is disabled for your company or your current user"
        ) !== -1
      ) {
        fetching_data_status = true;
      } else if (
        error_text.indexOf("Object type advaudithistory is not valid") !== -1
      ) {
        fetching_data_status = true;
      }
    } else {
      if (
        ex.message.includes(
          "network timeout at: https://api.intacct.com/ia/xml/xmlgw.phtml"
        )
      ) {
        console.log("Fetching failed.. trying again!");
        fetching_data_status = false;
      } else {
        fetching_data_status = false;
        console.log(
          "============================================================="
        );
        console.log("fetching_data_status: ", fetching_data_status);
        console.log(
          "============================================================="
        );
      }
    }
  }

  return {
    fetching_data_status,
    data_pool,
    result_id,
    _numRemaining,
    is_first_time,
  };
}

module.exports = query;
