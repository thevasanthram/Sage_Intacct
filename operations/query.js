const fs = require("fs");
const csv_generator = require("./../modules/csv_generator");
const bootstrap = require("./../bootstrap");
const IA = require("@intacct/intacct-sdk");

const api_collection = {
  "General Ledger": {
    GLACCTALLOCATIONGRP: "Account Allocation Groups",
    GLACCTALLOCATION: "Account Allocation",
    GLACCTALLOCATIONRUN: "Account Allocation Run",
    default: "Account Balances",
    GLACCTGRPPURPOSE: "Account Group Purposes",
    GLACCTGRP: "Account Groups",
    GLACCTGRPHIERARCHY: "Account Group Hierarchy",
    GLACCOUNT: "Accounts",
    ACCTTITLEBYLOC: "Entity Level Account Titles",
    GLBUDGETHEADER: "Budgets",
    GLBUDGETITEM: "Budget Details",
    GLDETAIL: "General Ledger Details",
    GLBATCH: "Journal Entries",
    GLENTRY: "Journal Entry Lines",
    RECURGLACCTALLOCATION: "Recurring Account Allocations",
    REPORTINGPERIOD: "Reporting Periods",
    STATACCOUNT: "Statistical Accounts",
    GLBATCH: "Statistical Journal Entries",
    GLENTRY: "Statistical Journal Entry Lines",
    ALLOCATION: "Transaction Allocations",
    ALLOCATIONENTRY: "Transaction Allocation Lines",
    default: "Trial Balances",
  },
};

async function query(api_keyword, api_name, api_category) {
  const data_lake = {};

  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    // let query = new IA.Functions.Common.ReadMore();
    query.objectName = api_keyword;
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
    csv_generator(
      api_name,
      api_category,
      data_lake[query.objectName],
      firstObject,
      query.objectName
    );

    // console.log(arr);
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}

async function Iterator() {
  Object.keys(api_collection).map((api_category) => {
    const api_category_list = api_collection[api_category];

    Object.keys(api_category_list).map((api_keyword) => {
      query(api_keyword, api_name, api_category);
    });
  });
}

Iterator();
