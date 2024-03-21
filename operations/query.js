const fs = require("fs");

query();

async function query() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    // let query = new IA.Functions.Common.ReadMore();
    query.objectName = "ARINVOICE";
    query.returnFormat = "json";
    query.pageSize = 1000;
    // query.resultId = "7030372d776562303330ZfwHvoQwaDHcMgMEJphxAwAAAAY4";
    // query.controlId = "1711005998476";

    let response = await client.execute(query);
    // console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    const arr = [];
    Object.values(json_data).map((invoice) => {
      arr.push(invoice["RECORDNO"]);
    });

    fs.writeFile("./response.js", JSON.stringify(arr), () => {
      console.log("data written to file");
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

      const arr = [];
      Object.values(json_data).map((invoice) => {
        arr.push(invoice["RECORDNO"]);
      });

      fs.writeFile("./response.js", JSON.stringify(arr), () => {
        console.log("data written to file");
      });
    } while (shouldIterate);

    // console.log(arr);
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
