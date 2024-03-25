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

    let response = await client.execute(query);
    let _totalCount = response._results[0]._totalCount;
    let _count = response._results[0]._count;
    let _numRemaining = response._results[0]._numRemaining;
    console.log(response);
    const result = response.getResult();

    console.log("Result Id: ", response._results[0]._resultId);
    console.log("_totalCount: ", _totalCount);
    console.log("_count: ", _count);
    console.log("_numRemaining: ", _numRemaining);

    console.log("============================================================");

    let json_data = result.data;

    let shouldIterate = _numRemaining ? true : false;

    while (shouldIterate) {
      let query = new IA.Functions.Common.ReadMore();
      query.resultId = response._results[0]._resultId;

      response = await client.execute(query);
      const result = response.getResult();

      _totalCount = response._results[0]._totalCount;
      _count = response._results[0]._count;
      _numRemaining = response._results[0]._numRemaining;

      console.log(
        `${api_name} -> ${api_keyword} -> remaining records: `,
        _numRemaining
      );
      onsole.log("Result Id: ", response._results[0]._resultId);
      console.log("_totalCount: ", _totalCount);
      console.log("_count: ", _count);
      console.log("_numRemaining: ", _numRemaining);

      console.log(
        "============================================================"
      );

      if (_numRemaining == 0) {
        shouldIterate = false;
      }
    }

    // fs.writeFile("./csv_try.csv", JSON.stringify(json_data), () => {
    //   console.log("File has written successfully");
    // });
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}

// 7030372d776562303333ZgGJQG6uQLOoVs4wCprofAAAABk4
