const fs = require("fs");
const path = require("path");
const csv_generator = require("./../modules/csv_generator");
const bootstrap = require("./../bootstrap");
const IA = require("@intacct/intacct-sdk");
const { count, error } = require("console");

let total_counting = 0;
let available_counting = 0;
let empty_counting = 0;
let error_counting = 0;

const api_collection = {
  "General Ledger": {
    "Account Allocation Groups": "GLACCTALLOCATIONGRP",
    "Account Allocation": "GLACCTALLOCATION",
    "Account Allocation Run": "GLACCTALLOCATIONRUN",
    "Account Balances": "default",
    "Account Group Purposes": "GLACCTGRPPURPOSE",
    "Account Groups": "GLACCTGRP",
    "Account Group Hierarchy": "GLACCTGRPHIERARCHY",
    Accounts: "GLACCOUNT",
    "Entity Level Account Titles": "ACCTTITLEBYLOC",
    Budgets: "GLBUDGETHEADER",
    "Budget Details": "GLBUDGETITEM",
    "General Ledger Details": "GLDETAIL",
    "Journal Entries": "GLBATCH",
    "Journal Entry Lines": "GLENTRY",
    "Recurring Account Allocations": "RECURGLACCTALLOCATION",
    "Reporting Periods": "REPORTINGPERIOD",
    "Statistical Accounts": "STATACCOUNT",
    "Statistical Journal Entries": "GLBATCH",
    "Statistical Journal Entry Lines": "GLENTRY",
    "Transaction Allocations": "ALLOCATION",
    "Transaction Allocation Lines": "ALLOCATIONENTRY",
    "Trial Balances": "default",
  },
  "Cash Management": {
    "ACH Bank Configurations": "ACHBANK",
    "Bank Feeds": "BANKACCTTXNFEED",
    "Bank Interest Income / Charges": "BANKFEE",
    "Bank Interest Income Line/Charges": "BANKFEEENTRY",
    " Charge Card Accounts": "CREDITCARD",
    "Charge Card Transactions": "CCTRANSACTION",
    "Charge Card Transaction Lines": "CCTRANSACTIONENTRY",
    "Charge Payoffs": "CHARGEPAYOFF",
    "Charge Payoff Lines": "CHARGEPAYOFFENTRY",
    "Checking Accounts": "CHECKINGACCOUNT",
    "Checking Account Reconciliations": "BANKACCTRECON",
    "Credit Card Charges/Other Fees": "CREDITCARDFEE",
    "Credit Card Charges/Other Fee Lines": "CREDITCARDFEEENTRY",
    Deposits: "DEPOSIT",
    "Deposit Lines": "DEPOSITENTRY",
    "Fund Transfers": "FUNDSTRANSFER",
    "Fund Transfer Lines": "FUNDSTRANSFERENTRY",
    "Other Receipts": "OTHERRECEIPTS",
    "Other Receipt Lines": "OTHERRECEIPTENTRY",
    "Savings Accounts": "SAVINGSACCOUNT",
  },
  "Accounts Payable": {
    "AP Account Labels": "APACCOUNTLABEL",
    "AP Adjustments": "APADJUSTMENT",
    "AP Adjustment Lines": "APADJUSTMENTITEM",
    "AP Payments": "APPYMT",
    "AP Payment Details": "APPYMTDETAIL",
    "AP Payment Requests": "APPAYMENTREQUEST",
    "AP Summaries": "APBILLBATCH",
    "AP Adjustment Summaries": "default",
    "AP Terms": "APTERM",
    Bills: "APBILL",
    "Bill Lines": "APBILLITEM",
    "Payment Provider Bank Accounts": "PROVIDERBANKACCOUNT",
    "Payment Provider Payment Methods": "PROVIDERPAYMENTMETHOD",
    "Payment Provider Vendor": "PROVIDERVENDOR",
    "Recurring Bills": "APRECURBILL",
    "Recurring Bill Lines": "APRECURBILLENTRY",
    "Vendor Groups": "VENDORGROUP",
    "Vendor Types": "VENDTYPE",
    Vendors: "VENDOR",
    "Vendor Email Templates": "VENDOREMAILTEMPLATE",
    "Vendor Approvals": "noObject",
  },
  "Accounts Receivable": {
    "AR Account Labels": "ARACCOUNTLABEL",
    "AR Adjustments": "ARADJUSTMENT",
    "AR Adjustment Lines": "ARADJUSTMENTITEM",
    "AR Advances": "ARADVANCE",
    "AR Aging": "default",
    "AR Payments": "ARPYMT",
    "AR Summaries": "ARINVOICEBATCH",
    "AR Adjustment Summaries": "default",
    "AR Terms": "ARTERM",
    "Customer Bank Accounts": "default",
    "Customer Charge Cards": "default",
    "Customer Groups": "CUSTOMERGROUP",
    "Customer Types": "CUSTTYPE",
    Customers: "CUSTOMER",
    "Customer Email Templates": "CUSTOMEREMAILTEMPLATE",
    "Dunning Level Definitions": "DUNNINGDEFINITION",
    Invoices: "ARINVOICE",
    "Recurring Invoices": "ARRECURINVOICE",
    "Recurring Invoice Lines": "ARRECURINVOICEENTRY",
    Territories: "default",
  },
  "Employee Expenses": {
    "Employee Groups": "EMPLOYEEGROUP",
    "Employee Types": "EMPLOYEETYPE",
    Employees: "EMPLOYEE",
    "Employee Cost Rates": "default",
    "Expense Adjustments": "EXPENSEADJUSTMENTS",
    "Expense Adjustment Lines": "EXPENSEADJUSTMENTSITEM",
    "Expense Payment Types": "EXPENSEPAYMENTTYPE",
    "Expense Reports": "EEXPENSES",
    "Expense Summaries ": "default",
    "Expense Types": "EEACCOUNTLABEL",
    Reimbursements: "EPPAYMENT",
    "Reimbursement Requests": "EPPAYMENTREQUEST",
  },
  Purchasing: {
    "Purchasing Price Lists": "POPRICELIST",
    "Purchasing Transaction Definitions": "PODOCUMENTPARAMS",
    "Purchasing Transaction Subtotal Templates": "POSUBTOTALTEMPLATE",
    "Purchasing Transactions": "PODOCUMENT",
    "Purchasing Transaction Lines": "PODOCUMENTENTRY",
    "Purchasing Transaction Subtotals": "PODOCUMENTSUBTOTALS",
    "Vendor Compliance Definitions": "COMPLIANCEDEFINITION",
    "Vendor Compliance Records": "COMPLIANCERECORD",
    "Vendor Compliance Types": "COMPLIANCETYPE",
  },
  "Order Entry": {
    "Order Entry Transaction Definitions": "SODOCUMENTPARAMS",
    "Order Entry Transaction Subtotal Templates": "SOSUBTOTALTEMPLATE",
    "Order Entry Transactions": "SODOCUMENT",
    "Order Entry Transaction Lines": "SODOCUMENTENTRY",
    "Order Entry Transaction Subtotals": "SODOCUMENTSUBTOTALS",
    "Order Entry Price Lists": "SOPRICELIST",
    "Recurring Order Entry Transactions": "SORECURDOCUMENT",
    "Revenue Recognition Schedules": "REVRECSCHEDULE",
    "Revenue Recognition Schedule Entries": "REVRECSCHEDULEENTRY",
  },
  "Inventory Control": {
    Aisles: "AISLE",
    "Available Inventory": "AVAILABLEINVENTORY",
    "Bin Faces": "BINFACE",
    "Bin Sizes": "BINSIZE",
    Bins: "BIN",
    "COGS Adjustments for Prior Periods": "COGSCLOSEDJE",
    "Inventory Cycle Counts": "ICCYCLECOUNT",
    "Inventory Cycle Count Lines": "ICCYCLECOUNTENTRY",
    "Inventory Control Price Lists": "INVPRICELIST",
    "Inventory Total Details": "INVENTORYTOTALDETAIL",
    "Inventory Transaction Definitions": "INVDOCUMENTPARAMS",
    "Inventory Transactions": "INVDOCUMENT",
    "Inventory Transaction Lines": "INVDOCUMENTENTRY",
    "Inventory Transaction Subtotals": "INVDOCUMENTSUBTOTALS",
    "Inventory Work Queue Details": "INVENTORYWQDETAIL",
    "Inventory Work Queue Details": "INVENTORYWQDETAIL",
    "Inventory Work Queue Orders": "INVENTORYWQORDER",
    "Item Cross References": "ITEMCROSSREF",
    " Item GL Groups": "ITEMGLGROUP",
    "Item Groups": "ITEMGROUP",
    "Item Tax Groups": "ITEMTAXGROUP",
    "Item Warehouse Details": "ITEMWAREHOUSEINFO",
    Items: "ITEM",
    " Product Lines": "PRODUCTLINE",
    Rows: "ICROW",
    "Stockable Kit Transactions": "noObject",
    "Units of Measure": "UOM",
    "Units of Measure Related Units": "UOMDETAIL",
    "Warehouse Groups": "WAREHOUSEGROUP",
    "Warehouse Transfers": "ICTRANSFER",
    Warehouses: "WAREHOUSE",
    Zones: "ZONE",
  },
  "Project and Resource Management": {
    "Earning Types": "EARNINGTYPE",
    "Positions and Skills": "POSITIONSKILL",
    "Project Groups": "PROJECTGROUP",
    "Project Observed Percent Completed": "OBSPCTCOMPLETED",
    "Project Resources": "PROJECTRESOURCES",
    "Project Statuses": "PROJECTSTATUS",
    "Project Types": "PROJECTTYPE",
    Projects: "PROJECT",
    "Task Observed Percent Completed": "OBSPCTCOMPLETED",
    "Task Resources": "TASKRESOURCES",
    Tasks: "TASK",
    "Time Types": "TIMETYPE",
    Timesheets: "TIMESHEET",
    "Timesheet Entry Object": "TIMESHEETENTRY",
    "Timesheet Entry Approval Object": "TIMESHEETAPPROVAL",
    "Transaction Rules": "TRANSACTIONRULE",
  },
  Consolidation: {
    "Consolidation Books": "GCBOOK",
    "Consolidation Elimination Accounts": "GCBOOKELIMACCOUNT",
    "Consolidation Entities": "GCBOOKENTITY",
    "Consolidation Journals": "GCBOOKADJJOURNAL",
    "Consolidation Override Accounts": "GCBOOKACCTRATETYPE",
    "Run Global or Domestic Consolidation": "default",
    "Run Ownership Structure Consolidation": "noObject",
    "Ownership Structures": "GCOWNERSHIPSTRUCTURE",
    "Ownership Structure Detail Object": "GCOWNERSHIPSTRUCTUREDETAIL",
    "Ownership Entity Object": "GCOWNERSHIPSENTITY",
    "Ownership Child Entity Object": "GCOWNERSHIPCHILDENTITY",
  },
  Construction: {
    "Accumulation Types": "ACCUMULATIONTYPE",
    "AP Retainage Releases": "APRETAINAGERELEASE",
    "AP Retainage Release Entries": "APRETAINAGERELEASEENTRY",
    "AR Retainage Releases": "ARRETAINAGERELEASE",
    "AR Retainage Release Entries": "ARRETAINAGERELEASEENTRY",
    "Change Request Status": "CHANGEREQUESTSTATUS",
    "Change Request Types": "CHANGEREQUESTTYPE",
    "Change Requests": "CHANGEREQUEST",
    "Change Request Entries": "CHANGEREQUESTENTRY",
    "Cost Types": "COSTTYPE",
    "Employee Position": "EMPLOYEEPOSITION",
    "Labor Class, Shift, and Union": "LABORCLASS",
    "Labor Shifts": "LABORSHIFT",
    "Labor Unions": "LABORUNION",
    "Project Change Orders": "PROJECTCHANGEORDER",
    "Project Contract Types": "PROJECTCONTRACTTYPE",
    "Project Contracts": "PROJECTCONTRACT",
    "Project Contract Lines": "PROJECTCONTRACTLINE",
    "Project Contract Line Entries": "PROJECTCONTRACTLINEENTRY",
    "Project Estimate Types": "PJESTIMATETYPE",
    "Project Estimates": "PJESTIMATE",
    "Project Estimate Entries": "PJESTIMATEENTRY",
    "Rate Tables": "RATETABLE",
    "Rate Table Timesheet Entries": "RATETABLEID",
    "Rate Table Purchase Order Entries": "RATETABLEPOENTRY",
    "Rate Table Credit Card Entries": "RATETABLECCENTRY",
    "Rate Table Employee Expense Entries": "RATETABLEEXPENSEENTRY",
    "Rate Table Accounts Payable Entries": "RATETABLEAPENTRY",
    "Rate Table General Ledger Entries": "RATETABLEGLENTRY",
    "Standard Cost Types": "STANDARDCOSTTYPE",
    "Standard Tasks": "STANDARDTASK",
  },
  "Contracts and Revenue Management": {
    "Billing Price Lists": "CONTRACTPRICELIST",
    "Billing Price List Entries": "CONTRACTITEMPRICELIST",
    "Billing Price List Entry Details": "CONTRACTITEMPRICELISTENTRY",
    "Billing Price List Entry Detail Tiers": "CONTRACTITEMPRCLSTENTYTIER",
    "Billing Templates": "CONTRACTBILLINGTEMPLATE",
    "Billing Template Details": "CONTRACTBILLINGTEMPLATEENTRY",
    "Contract Billing Schedules": "CONTRACTBILLINGSCHEDULE",
    "Contract Billing Schedule Entries": "CONTRACTBILLINGSCHEDULEENTRY",
    "Contract Expense Schedules": "CONTRACTEXPENSESCHEDULE",
    "Contract Expense Schedule Entries": "noObject",
    "Contract Expense 2 Schedules": "CONTRACTEXPENSE2SCHEDULE",
    "Contract Expenses": "CONTRACTEXPENSE",
    "Contract Groups": "CONTRACTGROUP",
    "Contract Invoice Policies": "GENINVOICEPOLICY",
    "Contract Invoices": "GENINVOICEPREVIEW",
    "Contract Invoice Preview Lines": "GENINVOICEPREVIEWLINE",
    "Contract Invoice Runs": "GENINVOICERUN",
    "Contract Lines": "CONTRACTDETAIL",
    "Contract Line Expenses": "CONTRACTEXPENSE",
    "Contract Revenue Schedules": "CONTRACTREVENUESCHEDULE",
    "Contract Revenue Schedule Entries": "CONTRACTREVENUE2SCHEDULE",
    "Contract Revenue 2 Schedules": "CONTRACTREVENUE2SCHEDULE",
    "Contract Revenue Templates": "CONTRACTREVENUETEMPLATE",
    "Contract Types": "CONTRACTTYPE",
    Contracts: "CONTRACT",
    "MEA Allocations": "CONTRACTMEABUNDLE",
    "MEA Price Lists": "CONTRACTMEAPRICELIST",
    "MEA Price List Entries": "CONTRACTMEAITEMPRICELIST",
    "MEA Price List Entry Lines": "CONTRACTMEAITEMPRICELISTENTRY",
    "Usage Data": "CONTRACTUSAGE",
  },
  " Customization Services ": {
    "Customization Services": "noObject",
    "Smart Events": "default",
  },
  "Platform Services": {
    Applications: "PTAPPLICATION",
    Dimensions: "noObject",
    Objects: "ACTIVITYLOG",
    Records: "noObject2",
    Views: "noObject3",
  },
  "Data Delivery Service": {
    "DDS Jobs": "DDSJOB",
    "DDS Objects": "noObject",
  },
  "Sales Tax, VAT, and GST": {
    " Contact Tax Groups": "default",
    "Tax Details": "TAXDETAIL",
    "Tax Records": "TAXRECORD",
    "Tax Solutions": "TAXSOLUTION",
  },
};

async function query(api_keyword, api_name, api_category) {
  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    // let query = new IA.Functions.Common.ReadMore();
    query.objectName = api_keyword;
    query.returnFormat = "json";
    query.pageSize = 1000;

    let response = await client.execute(query);
    let _totalCount = response._results[0]._totalCount;
    let _numRemaining = response._results[0]._numRemaining;
    // console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    if (json_data.length > 0) {
      available_counting = available_counting + 1;

      const folderPath = `./responses/available_data/`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      // Create the file path
      const filePath = path.join(
        folderPath,
        api_category + "_" + api_name.replace(/\//g, "or") + ".txt"
      );
 
      fs.writeFile(
        filePath,
        JSON.stringify(json_data),
        { flag: "w" },
        (err) => {
          if (err) {
            console.error("Error writing to file:", err);
          } else {
            console.log("Error has been noted to", filePath);
          }
        }
      );
    } else {
      empty_counting = empty_counting + 1;

      const folderPath = `./responses/empty_data/`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      // Create the file path
      const filePath = path.join(
        folderPath,
        api_category + "_" + api_name.replace(/\//g, "or") + ".txt"
      );

      fs.writeFile(
        filePath,
        JSON.stringify(json_data),
        { flag: "w" },
        (err) => {
          if (err) {
            console.error("Error writing to file:", err);
          } else {
            console.log("Error has been noted to", filePath);
          }
        }
      );
    }

    if (json_data.length > 0) {
      let data_pool = {};
      Object.values(json_data).map((invoice) => {
        data_pool[invoice["RECORDNO"]] = invoice;
      });

      let firstObject = data_pool[Object.keys(data_pool)[0]];

      // generating csv files for this data
      await csv_generator(
        api_name,
        api_category,
        data_pool,
        firstObject,
        query.objectName,
        true
      );

      let shouldIterate = _numRemaining ? true : false;

      while (shouldIterate) {
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

        let temp_data_pool = {};
        Object.values(json_data).map((invoice) => {
          temp_data_pool[invoice["RECORDNO"]] = invoice;
        });

        firstObject = temp_data_pool[Object.keys(temp_data_pool)[0]];

        // generating csv files for this data
        await csv_generator(
          api_name,
          api_category,
          temp_data_pool,
          firstObject,
          query.objectName,
          false
        );
      }
    }
  } catch (ex) {
    error_counting = error_counting + 1;
    // console.log(`${api_category} -> ${api_keyword} Error from main: `, ex);

    // if theres a exceptional response in some api
    // Create the folder if it doesn't exist

    const error_text = ex["errors"][0];
    let folderPath = "";
    if (
      error_text.indexOf("Account allocation module is not subscribed") !== -1
    ) {
      folderPath = "./responses/not_subscribed";
    } else if (error_text.indexOf("Query Failed Object definition") !== -1) {
      folderPath = "./responses/not_found";
    } else if (
      error_text.indexOf(
        "You do not have permission for API operation READ_BY_QUERY"
      ) !== -1
    ) {
      folderPath = "./responses/no_permission";
    } else if (
      error_text.indexOf(
        "API operation 'READ_BY_QUERY' cannot be performed on objects of type"
      ) !== -1
    ) {
      folderPath = "./responses/invalid_request";
    } else {
      folderPath = "./responses/";
    }
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    // Create the file path
    const filePath = path.join(
      folderPath,
      api_category + "_" + api_name + ".txt"
    );
    fs.writeFile(filePath, JSON.stringify(ex), { flag: "w" }, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log("Error has been noted to", filePath);
      }
    });
  }
}

async function Iterator() {
  for (let i = 0; i < Object.keys(api_collection).length; i++) {
    const api_category = Object.keys(api_collection)[i];
    console.log(" ========================================== ");
    console.log("api_category: ", api_category);
    console.log(" ========================================== ");
    const api_category_list = api_collection[api_category];

    await Promise.all(
      Object.keys(api_category_list).map(async (api_name) => {
        total_counting = total_counting + 1;
        const api_keyword = api_category_list[api_name];
        await query(api_keyword, api_name, api_category);
      })
    );
  }

  console.log("total_counting : ", total_counting);
  console.log("available_counting : ", available_counting);
  console.log("empty_counting : ", empty_counting);
  console.log("error_counting : ", error_counting);
}

Iterator();
