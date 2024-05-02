const create_sql_connection = require("./modules/create_sql_connection");
const query = require("./modules/fetch_data");

const api_collection = {
  // "General Ledger": {
  //   "Account Allocation Groups": "GLACCTALLOCATIONGRP",
  //   "Account Allocation": "GLACCTALLOCATION",
  //   "Account Allocation Run": "GLACCTALLOCATIONRUN",
  //   "Account Balances": "default",
  //   "Account Group Purposes": "GLACCTGRPPURPOSE",
  //   "Account Groups": "GLACCTGRP",
  //   "Account Group Hierarchy": "GLACCTGRPHIERARCHY",
  //   Accounts: "GLACCOUNT",
  //   "Entity Level Account Titles": "ACCTTITLEBYLOC",
  //   Budgets: "GLBUDGETHEADER",
  //   "Budget Details": "GLBUDGETITEM",
  //   // "General Ledger Details": "GLDETAIL",
  //   "Journal Entries": "GLBATCH",
  //   // "Journal Entry Lines": "GLENTRY",
  //   "Recurring Account Allocations": "RECURGLACCTALLOCATION",
  //   "Reporting Periods": "REPORTINGPERIOD",
  //   "Statistical Accounts": "STATACCOUNT",
  //   "Statistical Journal Entries": "GLBATCH",
  //   // "Statistical Journal Entry Lines": "GLENTRY",
  //   "Transaction Allocations": "ALLOCATION",
  //   "Transaction Allocation Lines": "ALLOCATIONENTRY",
  //   "Trial Balances": "default",
  // },
  // "Cash Management": {
  //   "ACH Bank Configurations": "ACHBANK",
  //   "Bank Feeds": "BANKACCTTXNFEED",
  //   "Bank Interest Income / Charges": "BANKFEE",
  //   "Bank Interest Income Line/Charges": "BANKFEEENTRY",
  //   " Charge Card Accounts": "CREDITCARD",
  //   "Charge Card Transactions": "CCTRANSACTION",
  //   "Charge Card Transaction Lines": "CCTRANSACTIONENTRY",
  //   "Charge Payoffs": "CHARGEPAYOFF",
  //   "Charge Payoff Lines": "CHARGEPAYOFFENTRY",
  //   "Checking Accounts": "CHECKINGACCOUNT",
  //   "Checking Account Reconciliations": "BANKACCTRECON",
  //   "Credit Card Charges/Other Fees": "CREDITCARDFEE",
  //   "Credit Card Charges/Other Fee Lines": "CREDITCARDFEEENTRY",
  //   Deposits: "DEPOSIT",
  //   "Deposit Lines": "DEPOSITENTRY",
  //   "Fund Transfers": "FUNDSTRANSFER",
  //   "Fund Transfer Lines": "FUNDSTRANSFERENTRY",
  //   "Other Receipts": "OTHERRECEIPTS",
  //   "Other Receipt Lines": "OTHERRECEIPTSENTRY",
  //   "Savings Accounts": "SAVINGSACCOUNT",
  // },
  // "Accounts Payable": {
  //   "AP Account Labels": "APACCOUNTLABEL",
  //   "AP Adjustments": "APADJUSTMENT",
  //   "AP Adjustment Lines": "APADJUSTMENTITEM",
  //   "AP Payments": "APPYMT",
  //   "AP Payment Details": "APPYMTDETAIL",
  //   "AP Payment Requests": "APPAYMENTREQUEST",
  //   "AP Summaries": "APBILLBATCH",
  //   "AP Adjustment Summaries": "default",
  //   "AP Terms": "APTERM",
  //   Bills: "APBILL",
  //   "Bill Lines": "APBILLITEM",
  //   "Payment Provider Bank Accounts": "PROVIDERBANKACCOUNT",
  //   "Payment Provider Payment Methods": "PROVIDERPAYMENTMETHOD",
  //   "Payment Provider Vendor": "PROVIDERVENDOR",
  //   "Recurring Bills": "APRECURBILL",
  //   "Recurring Bill Lines": "APRECURBILLENTRY",
  //   "Vendor Groups": "VENDORGROUP",
  //   "Vendor Types": "VENDTYPE",
  //   Vendors: "VENDOR",
  //   "Vendor Email Templates": "VENDOREMAILTEMPLATE",
  //   "Vendor Approvals": "noObject",
  // },
  // "Accounts Receivable": {
  //   // "AR Account Labels": "ARACCOUNTLABEL",
  //   // "AR Adjustments": "ARADJUSTMENT",
  //   // "AR Adjustment Lines": "ARADJUSTMENTITEM",
  //   // "AR Advances": "ARADVANCE",
  //   // "AR Aging": "default",
  //   // "AR Payments": "ARPYMT",
  //   // "AR Summaries": "ARINVOICEBATCH",
  //   // "AR Adjustment Summaries": "default",
  //   // "AR Terms": "ARTERM",
  //   // "Customer Bank Accounts": "default",
  //   // "Customer Charge Cards": "default",
  //   // "Customer Groups": "CUSTOMERGROUP",
  //   // "Customer Types": "CUSTTYPE",
  //   // Customers: "CUSTOMER",
  //   // "Customer Email Templates": "CUSTOMEREMAILTEMPLATE",
  //   // "Dunning Level Definitions": "DUNNINGDEFINITION",
  //   Invoices: "ARINVOICE",
  //   // "Recurring Invoices": "ARRECURINVOICE",
  //   // "Recurring Invoice Lines": "ARRECURINVOICEENTRY",
  //   // Territories: "default",
  // },
  // "Employee Expenses": {
  //   "Employee Groups": "EMPLOYEEGROUP",
  //   "Employee Types": "EMPLOYEETYPE",
  //   Employees: "EMPLOYEE",
  //   "Employee Cost Rates": "default",
  //   "Expense Adjustments": "EXPENSEADJUSTMENTS",
  //   "Expense Adjustment Lines": "EXPENSEADJUSTMENTSITEM",
  //   "Expense Payment Types": "EXPENSEPAYMENTTYPE",
  //   "Expense Reports": "EEXPENSES",
  //   "Expense Summaries ": "default",
  //   "Expense Types": "EEACCOUNTLABEL",
  //   Reimbursements: "EPPAYMENT",
  //   "Reimbursement Requests": "EPPAYMENTREQUEST",
  // },
  // Purchasing: {
  //   "Purchasing Price Lists": "POPRICELIST",
  //   "Purchasing Transaction Definitions": "PODOCUMENTPARAMS",
  //   "Purchasing Transaction Subtotal Templates": "POSUBTOTALTEMPLATE",
  //   "Purchasing Transactions": "PODOCUMENT",
  //   "Purchasing Transaction Lines": "PODOCUMENTENTRY",
  //   "Purchasing Transaction Subtotals": "PODOCUMENTSUBTOTALS",
  //   "Vendor Compliance Definitions": "COMPLIANCEDEFINITION",
  //   "Vendor Compliance Records": "COMPLIANCERECORD",
  //   "Vendor Compliance Types": "COMPLIANCETYPE",
  // },
  // "Order Entry": {
  //   "Order Entry Transaction Definitions": "SODOCUMENTPARAMS",
  //   "Order Entry Transaction Subtotal Templates": "SOSUBTOTALTEMPLATE",
  //   "Order Entry Transactions": "SODOCUMENT",
  //   "Order Entry Transaction Lines": "SODOCUMENTENTRY",
  //   "Order Entry Transaction Subtotals": "SODOCUMENTSUBTOTALS",
  //   "Order Entry Price Lists": "SOPRICELIST",
  //   "Recurring Order Entry Transactions": "SORECURDOCUMENT",
  //   "Revenue Recognition Schedules": "REVRECSCHEDULE",
  //   "Revenue Recognition Schedule Entries": "REVRECSCHEDULEENTRY",
  // },
  // "Inventory Control": {
  //   Aisles: "AISLE",
  //   "Available Inventory": "AVAILABLEINVENTORY",
  //   "Bin Faces": "BINFACE",
  //   "Bin Sizes": "BINSIZE",
  //   Bins: "BIN",
  //   "COGS Adjustments for Prior Periods": "COGSCLOSEDJE",
  //   "Inventory Cycle Counts": "ICCYCLECOUNT",
  //   "Inventory Cycle Count Lines": "ICCYCLECOUNTENTRY",
  //   "Inventory Control Price Lists": "INVPRICELIST",
  //   "Inventory Total Details": "INVENTORYTOTALDETAIL",
  //   "Inventory Transaction Definitions": "INVDOCUMENTPARAMS",
  //   "Inventory Transactions": "INVDOCUMENT",
  //   "Inventory Transaction Lines": "INVDOCUMENTENTRY",
  //   "Inventory Transaction Subtotals": "INVDOCUMENTSUBTOTALS",
  //   "Inventory Work Queue Details": "INVENTORYWQDETAIL",
  //   "Inventory Work Queue Details": "INVENTORYWQDETAIL",
  //   "Inventory Work Queue Orders": "INVENTORYWQORDER",
  //   "Item Cross References": "ITEMCROSSREF",
  //   " Item GL Groups": "ITEMGLGROUP",
  //   "Item Groups": "ITEMGROUP",
  //   "Item Tax Groups": "ITEMTAXGROUP",
  //   "Item Warehouse Details": "ITEMWAREHOUSEINFO",
  //   Items: "ITEM",
  //   " Product Lines": "PRODUCTLINE",
  //   Rows: "ICROW",
  //   "Stockable Kit Transactions": "noObject",
  //   "Units of Measure": "UOM",
  //   "Units of Measure Related Units": "UOMDETAIL",
  //   "Warehouse Groups": "WAREHOUSEGROUP",
  //   "Warehouse Transfers": "ICTRANSFER",
  //   Warehouses: "WAREHOUSE",
  //   Zones: "ZONE",
  // },
  // "Project and Resource Management": {
  //   "Earning Types": "EARNINGTYPE",
  //   "Positions and Skills": "POSITIONSKILL",
  //   "Project Groups": "PROJECTGROUP",
  //   "Project Observed Percent Completed": "OBSPCTCOMPLETED",
  //   "Project Resources": "PROJECTRESOURCES",
  //   "Project Statuses": "PROJECTSTATUS",
  //   "Project Types": "PROJECTTYPE",
  //   Projects: "PROJECT",
  //   "Task Observed Percent Completed": "OBSPCTCOMPLETED",
  //   "Task Resources": "TASKRESOURCES",
  //   Tasks: "TASK",
  //   "Time Types": "TIMETYPE",
  //   Timesheets: "TIMESHEET",
  //   "Timesheet Entry Object": "TIMESHEETENTRY",
  //   "Timesheet Entry Approval Object": "TIMESHEETAPPROVAL",
  //   "Transaction Rules": "TRANSACTIONRULE",
  // },
  // Consolidation: {
  //   "Consolidation Books": "GCBOOK",
  //   "Consolidation Elimination Accounts": "GCBOOKELIMACCOUNT",
  //   "Consolidation Entities": "GCBOOKENTITY",
  //   "Consolidation Journals": "GCBOOKADJJOURNAL",
  //   "Consolidation Override Accounts": "GCBOOKACCTRATETYPE",
  //   "Run Global or Domestic Consolidation": "default",
  //   "Run Ownership Structure Consolidation": "noObject",
  //   "Ownership Structures": "GCOWNERSHIPSTRUCTURE",
  //   "Ownership Structure Detail Object": "GCOWNERSHIPSTRUCTUREDETAIL",
  //   "Ownership Entity Object": "GCOWNERSHIPSENTITY",
  //   "Ownership Child Entity Object": "GCOWNERSHIPCHILDENTITY",
  // },
  // Construction: {
  //   "Accumulation Types": "ACCUMULATIONTYPE",
  //   "AP Retainage Releases": "APRETAINAGERELEASE",
  //   "AP Retainage Release Entries": "APRETAINAGERELEASEENTRY",
  //   "AR Retainage Releases": "ARRETAINAGERELEASE",
  //   "AR Retainage Release Entries": "ARRETAINAGERELEASEENTRY",
  //   "Change Request Status": "CHANGEREQUESTSTATUS",
  //   "Change Request Types": "CHANGEREQUESTTYPE",
  //   "Change Requests": "CHANGEREQUEST",
  //   "Change Request Entries": "CHANGEREQUESTENTRY",
  //   "Cost Types": "COSTTYPE",
  //   "Employee Position": "EMPLOYEEPOSITION",
  //   "Labor Class, Shift, and Union": "LABORCLASS",
  //   "Labor Shifts": "LABORSHIFT",
  //   "Labor Unions": "LABORUNION",
  //   "Project Change Orders": "PROJECTCHANGEORDER",
  //   "Project Contract Types": "PROJECTCONTRACTTYPE",
  //   "Project Contracts": "PROJECTCONTRACT",
  //   "Project Contract Lines": "PROJECTCONTRACTLINE",
  //   "Project Contract Line Entries": "PROJECTCONTRACTLINEENTRY",
  //   "Project Estimate Types": "PJESTIMATETYPE",
  //   "Project Estimates": "PJESTIMATE",
  //   "Project Estimate Entries": "PJESTIMATEENTRY",
  //   "Rate Tables": "RATETABLE",
  //   "Rate Table Timesheet Entries": "RATETABLEID",
  //   "Rate Table Purchase Order Entries": "RATETABLEPOENTRY",
  //   "Rate Table Credit Card Entries": "RATETABLECCENTRY",
  //   "Rate Table Employee Expense Entries": "RATETABLEEXPENSEENTRY",
  //   "Rate Table Accounts Payable Entries": "RATETABLEAPENTRY",
  //   "Rate Table General Ledger Entries": "RATETABLEGLENTRY",
  //   "Standard Cost Types": "STANDARDCOSTTYPE",
  //   "Standard Tasks": "STANDARDTASK",
  // },
  // "Contracts and Revenue Management": {
  //   "Billing Price Lists": "CONTRACTPRICELIST",
  //   "Billing Price List Entries": "CONTRACTITEMPRICELIST",
  //   "Billing Price List Entry Details": "CONTRACTITEMPRICELISTENTRY",
  //   "Billing Price List Entry Detail Tiers": "CONTRACTITEMPRCLSTENTYTIER",
  //   "Billing Templates": "CONTRACTBILLINGTEMPLATE",
  //   "Billing Template Details": "CONTRACTBILLINGTEMPLATEENTRY",
  //   "Contract Billing Schedules": "CONTRACTBILLINGSCHEDULE",
  //   "Contract Billing Schedule Entries": "CONTRACTBILLINGSCHEDULEENTRY",
  //   "Contract Expense Schedules": "CONTRACTEXPENSESCHEDULE",
  //   "Contract Expense Schedule Entries": "noObject",
  //   "Contract Expense 2 Schedules": "CONTRACTEXPENSE2SCHEDULE",
  //   "Contract Expenses": "CONTRACTEXPENSE",
  //   "Contract Groups": "CONTRACTGROUP",
  //   "Contract Invoice Policies": "GENINVOICEPOLICY",
  //   "Contract Invoices": "GENINVOICEPREVIEW",
  //   "Contract Invoice Preview Lines": "GENINVOICEPREVIEWLINE",
  //   "Contract Invoice Runs": "GENINVOICERUN",
  //   "Contract Lines": "CONTRACTDETAIL",
  //   "Contract Line Expenses": "CONTRACTEXPENSE",
  //   "Contract Revenue Schedules": "CONTRACTREVENUESCHEDULE",
  //   "Contract Revenue Schedule Entries": "CONTRACTREVENUE2SCHEDULE",
  //   "Contract Revenue 2 Schedules": "CONTRACTREVENUE2SCHEDULE",
  //   "Contract Revenue Templates": "CONTRACTREVENUETEMPLATE",
  //   "Contract Types": "CONTRACTTYPE",
  //   Contracts: "CONTRACT",
  //   "MEA Allocations": "CONTRACTMEABUNDLE",
  //   "MEA Price Lists": "CONTRACTMEAPRICELIST",
  //   "MEA Price List Entries": "CONTRACTMEAITEMPRICELIST",
  //   "MEA Price List Entry Lines": "CONTRACTMEAITEMPRICELISTENTRY",
  //   "Usage Data": "CONTRACTUSAGE",
  // },
  // " Customization Services ": {
  //   "Customization Services": "noObject",
  //   "Smart Events": "default",
  // },
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

let today = new Date();

today.setUTCHours(7, 0, 0, 0); // IST 12.30 PM

const filtering_condition = {
  column: "WHENCREATED",
  // greaterThanOrEqualTo: "2024-04-20T00:00:00.00Z", // "2024-02-12T00:00:00.00Z"
  lessThan: today.toISOString(), // "2024-02-12T00:00:00.00Z"
};

async function start() {
  const data_hub = {};

  let total_counting = 0;
  let available_counting = 0;
  let empty_counting = 0;
  let error_counting = 0;

  // creating a client for azure sql database operations
  let sql_request = "";
  do {
    sql_request = await create_sql_connection();
  } while (!sql_request);

  for (let i = 0; i < Object.keys(api_collection).length; i++) {
    const api_category = Object.keys(api_collection)[i];
    console.log(" ========================================== ");
    console.log("api_category: ", api_category);
    console.log(" ========================================== ");
    const api_category_list = api_collection[api_category];

    await Promise.all(
      Object.keys(api_category_list).map(async (api_name) => {
        total_counting = total_counting + 1;

        let data_pool = [];
        let result_id = "";
        let _numRemaining = 0;

        // fetching data from respective apis
        const api_keyword = api_category_list[api_name];

        let fetching_data_status = false;
        do {
          ({ fetching_data_status, data_pool, result_id, _numRemaining } =
            await query(
              sql_request,
              api_keyword,
              api_name,
              api_category,
              filtering_condition,
              data_pool,
              result_id,
              _numRemaining,
              "FLASHING"
            ));
        } while (!fetching_data_status);
      })
    );
  }

  console.log("<- COMPLETED ->");

  // console.log("total_counting : ", total_counting);
  // console.log("available_counting : ", available_counting);
  // console.log("empty_counting : ", empty_counting);
  // console.log("error_counting : ", error_counting);
}

start();
