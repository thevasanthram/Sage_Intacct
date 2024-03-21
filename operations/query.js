const fs = require("fs");
const csv_generator = require("./../modules/csv_generator");

query();

async function query() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  const data_lake = {};

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    // let query = new IA.Functions.Common.ReadMore();
    query.objectName = "ARINVOICE";
    query.returnFormat = "json";
    query.pageSize = 1000;
    // query.resultId = "7030372d776562303330ZfwHvoQwaDHcMgMEJphxAwAAAAY4";
    // query.controlId = "1711005998476";

    data_lake[query.objectName] = {};

    let response = await client.execute(query);
    // console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    let data_pool = {};
    Object.values(json_data).map((invoice) => {
      data_pool[invoice["RECORDNO"]] = invoice;
    });

    let shouldIterate = true;

    do {
      let query = new IA.Functions.Common.ReadMore();
      query.resultId = response._results[0]._resultId;

      response = await client.execute(query);
      console.log(response);
      const result = response.getResult();

      const _totalCount = response._results[0]._totalCount;
      const _numRemaining = response._results[0]._numRemaining;

      console.log("_numRemaining: ", _numRemaining);

      if (_numRemaining == 0) {
        shouldIterate = false;
      }

      let json_data = result.data;

      let temp_data_pool = {};
      Object.values(json_data).map((invoice) => {
        temp_data_pool[invoice["RECORDNO"]] = invoice;
      });

      data_pool = { ...data_pool, ...temp_data_pool };
    } while (shouldIterate);

    data_lake[query.objectName] = data_pool;

    console.log(
      "total records: ",
      Object.keys(data_lake[query.objectName]).length
    );

    let firstObject =
      data_lake[query.objectName][Object.keys(data_lake[query.objectName])[0]];

    // generating csv files for this data
    csv_generator(data_lake[query.objectName], firstObject, query.objectName);

    // console.log(arr);
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
