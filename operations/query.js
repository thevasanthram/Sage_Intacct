const fs = require("fs");
const csv_generator = require("./../modules/csv_generator");
const bootstrap = require("./../bootstrap");
const IA = require("@intacct/intacct-sdk");

const api_collection = {
  // "General Ledger": {
  //   GLACCTALLOCATIONGRP: "Account Allocation Groups",
  //   GLACCTALLOCATION: "Account Allocation",
  //   GLACCTALLOCATIONRUN: "Account Allocation Run",
  //   default: "Account Balances",
  //   GLACCTGRPPURPOSE: "Account Group Purposes",
  //   GLACCTGRP: "Account Groups",
  //   GLACCTGRPHIERARCHY: "Account Group Hierarchy",
  //   GLACCOUNT: "Accounts",
  //   ACCTTITLEBYLOC: "Entity Level Account Titles",
  //   GLBUDGETHEADER: "Budgets",
  //   GLBUDGETITEM: "Budget Details",
  //   GLDETAIL: "General Ledger Details",
  //   GLBATCH: "Journal Entries",
  //   GLENTRY: "Journal Entry Lines",
  //   RECURGLACCTALLOCATION: "Recurring Account Allocations",
  //   REPORTINGPERIOD: "Reporting Periods",
  //   STATACCOUNT: "Statistical Accounts",
  //   GLBATCH: "Statistical Journal Entries",
  //   GLENTRY: "Statistical Journal Entry Lines",
  //   ALLOCATION: "Transaction Allocations",
  //   ALLOCATIONENTRY: "Transaction Allocation Lines",
  //   default: "Trial Balances",
  // },
  // "Cash Management": {
  //   ACHBANK: "ACH Bank Configurations",
  //   BANKACCTTXNFEED: "Bank Feeds",
  //   BANKFEE: "Bank Interest Income / Charges",
  //   BANKFEEENTRY: "Bank Interest Income Line/Charges",
  //   CREDITCARD: " Charge Card Accounts",
  //   CCTRANSACTION: "Charge Card Transactions",
  //   CCTRANSACTIONENTRY: "Charge Card Transaction Lines",
  //   CHARGEPAYOFF: "Charge Payoffs",
  //   CHARGEPAYOFFENTRY: "Charge Payoff Lines",
  //   CHECKINGACCOUNT: "Checking Accounts",
  //   BANKACCTRECON: "Checking Account Reconciliations",
  //   CREDITCARDFEE: "Credit Card Charges/Other Fees",
  //   CREDITCARDFEEENTRY: "Credit Card Charges/Other Fee Lines",
  //   DEPOSIT: "Deposits",
  //   DEPOSITENTRY: "Deposit Lines",
  //   FUNDSTRANSFER: "Fund Transfers",
  //   FUNDSTRANSFERENTRY: "Fund Transfer Lines",
  //   OTHERRECEIPTS: "Other Receipts",
  //   OTHERRECEIPTENTRY: "Other Receipt Lines",
  //   SAVINGSACCOUNT: "Savings Accounts",
  // },
  // "Accounts Payable": {
  //   APACCOUNTLABEL: "AP Account Labels",
  //   APADJUSTMENT: "AP Adjustments",
  //   APADJUSTMENTITEM: "AP Adjustment Lines",
  //   APPYMT: "AP Payments",
  //   APPYMTDETAIL: "AP Payment Details",
  //   APPAYMENTREQUEST: "AP Payment Requests",
  //   APBILLBATCH: "AP Summaries",
  //   default: "AP Adjustment Summaries",
  //   APTERM: "AP Terms",
  //   APBILL: "Bills",
  //   APBILLITEM: "Bill Lines",
  //   PROVIDERBANKACCOUNT: "Payment Provider Bank Accounts",
  //   PROVIDERPAYMENTMETHOD: "Payment Provider Payment Methods",
  //   PROVIDERVENDOR: "Payment Provider Vendor",
  //   APRECURBILL: "Recurring Bills",
  //   APRECURBILLENTRY: "Recurring Bill Lines",
  //   VENDORGROUP: "Vendor Groups",
  //   VENDTYPE: "Vendor Types",
  //   VENDOR: "Vendors",
  //   VENDOREMAILTEMPLATE: "Vendor Email Templates",
  //   noObject: "Vendor Approvals",
  // },
  // "Accounts Receivable": {
  //   ARACCOUNTLABEL: "AR Account Labels",
  //   ARADJUSTMENT: "AR Adjustments",
  //   ARADJUSTMENTITEM: "AR Adjustment Lines",
  //   ARADVANCE: "AR Advances",
  //   default: "AR Aging",
  //   ARPYMT: "AR Payments",
  //   ARINVOICEBATCH: "AR Summaries",
  //   default: "AR Adjustment Summaries",
  //   ARTERM: "AR Terms",
  //   default: "Customer Bank Accounts",
  //   default: "Customer Charge Cards",
  //   CUSTOMERGROUP: "Customer Groups",
  //   CUSTTYPE: "Customer Types",
  //   CUSTOMER: "Customers",
  //   CUSTOMEREMAILTEMPLATE: "Customer Email Templates",
  //   DUNNINGDEFINITION: "Dunning Level Definitions",
  //   ARINVOICE: "Invoices",
  //   ARRECURINVOICE: "Recurring Invoices",
  //   ARRECURINVOICEENTRY: "Recurring Invoice Lines",
  //   default: "Territories",
  // },
  "Employee Expenses": {
    EMPLOYEEGROUP: "Employee Groups",
    EMPLOYEETYPE: "Employee Types",
    EMPLOYEE: "Employees",
    default: "Employee Cost Rates",
    EXPENSEADJUSTMENTS: "Expense Adjustments",
    EXPENSEADJUSTMENTSITEM: "Expense Adjustment Lines",
    EXPENSEPAYMENTTYPE: "Expense Payment Types",
    EXPENSEPAYMENTTYPE: " Expense Payment Types",
    EEXPENSES: "Expense Reports",
    default: "Expense Summaries ",
    EEACCOUNTLABEL: "Expense Types",
    EPPAYMENT: "Reimbursements",
    EPPAYMENTREQUEST: "Reimbursement Requests",
  },
  Purchasing: {
    POPRICELIST: "Purchasing Price Lists",
    PODOCUMENTPARAMS: "Purchasing Transaction Definitions",
    POSUBTOTALTEMPLATE: "Purchasing Transaction Subtotal Templates",
    PODOCUMENT: "Purchasing Transactions",
    PODOCUMENTENTRY: "Purchasing Transaction Lines",
    PODOCUMENTSUBTOTALS: "Purchasing Transaction Subtotals",
    COMPLIANCEDEFINITION: "Vendor Compliance Definitions",
    COMPLIANCERECORD: "Vendor Compliance Records",
    COMPLIANCETYPE: "Vendor Compliance Types",
  },
  "Order Entry": {
    SODOCUMENTPARAMS: "Order Entry Transaction Definitions",
    SOSUBTOTALTEMPLATE: "Order Entry Transaction Subtotal Templates",
    SODOCUMENT: "Order Entry Transactions",
    SODOCUMENTENTRY: "Order Entry Transaction Lines",
    SODOCUMENTSUBTOTALS: "Order Entry Transaction Subtotals",
    SOPRICELIST: "Order Entry Price Lists",
    SORECURDOCUMENT: "Recurring Order Entry Transactions",
    REVRECSCHEDULE: "Revenue Recognition Schedules",
    REVRECSCHEDULEENTRY: "Revenue Recognition Schedule Entries",
  },
  // "Inventory Control": {
  //   AISLE: "Aisles",
  //   AVAILABLEINVENTORY: "Available Inventory",
  //   BINFACE: "Bin Faces",
  //   BINSIZE: "Bin Sizes",
  //   BIN: "Bins",
  //   COGSCLOSEDJE: "COGS Adjustments for Prior Periods",
  //   ICCYCLECOUNT: "Inventory Cycle Counts",
  //   ICCYCLECOUNTENTRY: "Inventory Cycle Count Lines",
  //   INVPRICELIST: "Inventory Control Price Lists",
  //   INVENTORYTOTALDETAIL: "Inventory Total Details",
  //   INVDOCUMENTPARAMS: "Inventory Transaction Definitions",
  //   INVDOCUMENT: "Inventory Transactions",
  //   INVDOCUMENTENTRY: "Inventory Transaction Lines",
  //   INVDOCUMENTSUBTOTALS: "Inventory Transaction Subtotals",
  //   INVENTORYWQDETAIL: "Inventory Work Queue Details",
  //   INVENTORYWQDETAIL: "Inventory Work Queue Details",
  //   INVENTORYWQORDER: "Inventory Work Queue Orders",
  //   ITEMCROSSREF: "Item Cross References",
  //   ITEMGLGROUP: " Item GL Groups",
  //   ITEMGROUP: "Item Groups",
  //   ITEMTAXGROUP: "Item Tax Groups",
  //   ITEMWAREHOUSEINFO: "Item Warehouse Details",
  //   ITEM: "Items",
  //   PRODUCTLINE: " Product Lines",
  //   ICROW: "Rows",
  //   noObject: "Stockable Kit Transactions",
  //   UOM: "Units of Measure",
  //   UOMDETAIL: "Units of Measure Related Units",
  //   WAREHOUSEGROUP: "Warehouse Groups",
  //   ICTRANSFER: "Warehouse Transfers",
  //   WAREHOUSE: "Warehouses",
  //   ZONE: "Zones",
  // },
  // "Project and Resource Management": {
  //   EARNINGTYPE: "Earning Types",
  //   POSITIONSKILL: "Positions and Skills",
  //   PROJECTGROUP: "Project Groups",
  //   OBSPCTCOMPLETED: "Project Observed Percent Completed",
  //   PROJECTRESOURCES: "Project Resources",
  //   PROJECTSTATUS: "Project Statuses",
  //   PROJECTTYPE: "Project Types",
  //   PROJECT: "Projects",
  //   OBSPCTCOMPLETED: "Task Observed Percent Completed",
  //   TASKRESOURCES: "Task Resources",
  //   TASK: "Tasks",
  //   TIMETYPE: "Time Types",
  //   TIMESHEET: "Timesheets",
  //   TIMESHEETENTRY: "Timesheet Entry Object",
  //   TIMESHEETAPPROVAL: "Timesheet Entry Approval Object",
  //   TRANSACTIONRULE: "Transaction Rules",
  // },
  // Consolidation: {
  //   GCBOOK: "Consolidation Books",
  //   GCBOOKELIMACCOUNT: "Consolidation Elimination Accounts",
  //   GCBOOKENTITY: "Consolidation Entities",
  //   GCBOOKADJJOURNAL: "Consolidation Journals",
  //   GCBOOKACCTRATETYPE: "Consolidation Override Accounts",
  //   default: "Run Global or Domestic Consolidation",
  //   noObject: "Run Ownership Structure Consolidation",
  //   GCOWNERSHIPSTRUCTURE: "Ownership Structures",
  //   GCOWNERSHIPSTRUCTUREDETAIL: "Ownership Structure Detail Object",
  //   GCOWNERSHIPSENTITY: "Ownership Entity Object",
  //   GCOWNERSHIPCHILDENTITY: "Ownership Child Entity Object",
  // },
  // Construction: {
  //   ACCUMULATIONTYPE: "Accumulation Types",
  //   APRETAINAGERELEASE: "AP Retainage Releases",
  //   APRETAINAGERELEASEENTRY: "AP Retainage Release Entries",
  //   ARRETAINAGERELEASE: "AR Retainage Releases",
  //   ARRETAINAGERELEASEENTRY: "AR Retainage Release Entries",
  //   CHANGEREQUESTSTATUS: "Change Request Status",
  //   CHANGEREQUESTTYPE: "Change Request Types",
  //   CHANGEREQUEST: "Change Requests",
  //   CHANGEREQUESTENTRY: "Change Request Entries",
  //   COSTTYPE: "Cost Types",
  //   EMPLOYEEPOSITION: "Employee Position",
  //   LABORCLASS: "Labor Class, Shift, and Union",
  //   LABORSHIFT: "Labor Shifts",
  //   LABORUNION: "Labor Unions",
  //   PROJECTCHANGEORDER: "Project Change Orders",
  //   PROJECTCONTRACTTYPE: "Project Contract Types",
  //   PROJECTCONTRACT: "Project Contracts",
  //   PROJECTCONTRACTLINE: "Project Contract Lines",
  //   PROJECTCONTRACTLINEENTRY: "Project Contract Line Entries",
  //   PJESTIMATETYPE: "Project Estimate Types",
  //   PJESTIMATE: "Project Estimates",
  //   PJESTIMATEENTRY: "Project Estimate Entries",
  //   RATETABLE: "Rate Tables",
  //   RATETABLEID: "Rate Table Timesheet Entries",
  //   RATETABLEPOENTRY: "Rate Table Purchase Order Entries",
  //   RATETABLECCENTRY: "Rate Table Credit Card Entries",
  //   RATETABLEEXPENSEENTRY: "Rate Table Employee Expense Entries",
  //   RATETABLEAPENTRY: "Rate Table Accounts Payable Entries",
  //   RATETABLEGLENTRY: "Rate Table General Ledger Entries",
  //   STANDARDCOSTTYPE: "Standard Cost Types",
  //   STANDARDTASK: "Standard Tasks",
  // },
  // "Contracts and Revenue Management": {
  //   CONTRACTPRICELIST: "Billing Price Lists",
  //   CONTRACTITEMPRICELIST: "Billing Price List Entries",
  //   CONTRACTITEMPRICELISTENTRY: "Billing Price List Entry Details",
  //   CONTRACTITEMPRCLSTENTYTIER: "Billing Price List Entry Detail Tiers",
  //   CONTRACTBILLINGTEMPLATE: "Billing Templates",
  //   CONTRACTBILLINGTEMPLATEENTRY: "Billing Template Details",
  //   CONTRACTBILLINGSCHEDULE: "Contract Billing Schedules",
  //   CONTRACTBILLINGSCHEDULEENTRY: "Contract Billing Schedule Entries",
  //   CONTRACTEXPENSESCHEDULE: "Contract Expense Schedules",
  //   noObject: "Contract Expense Schedule Entries",
  //   CONTRACTEXPENSE2SCHEDULE: "Contract Expense 2 Schedules",
  //   CONTRACTEXPENSE: "Contract Expenses",
  //   CONTRACTGROUP: "Contract Groups",
  //   GENINVOICEPOLICY: "Contract Invoice Policies",
  //   GENINVOICEPREVIEW: "Contract Invoices",
  //   GENINVOICEPREVIEWLINE: "Contract Invoice Preview Lines",
  //   GENINVOICERUN: "Contract Invoice Runs",
  //   CONTRACTDETAIL: "Contract Lines",
  //   CONTRACTEXPENSE: "Contract Line Expenses",
  //   CONTRACTREVENUESCHEDULE: "Contract Revenue Schedules",
  //   CONTRACTREVENUE2SCHEDULE: "Contract Revenue Schedule Entries",
  //   CONTRACTREVENUE2SCHEDULE: "Contract Revenue 2 Schedules",
  //   CONTRACTREVENUETEMPLATE: "Contract Revenue Templates",
  //   CONTRACTTYPE: "Contract Types",
  //   CONTRACT: "Contracts",
  //   CONTRACTMEABUNDLE: "MEA Allocations",
  //   CONTRACTMEAPRICELIST: "MEA Price Lists",
  //   CONTRACTMEAITEMPRICELIST: "MEA Price List Entries",
  //   CONTRACTMEAITEMPRICELISTENTRY: "MEA Price List Entry Lines",
  //   CONTRACTUSAGE: "Usage Data",
  // },
  // " Customization Services ": {
  //   noObject: "Customization Services",
  //   default: "Smart Events",
  // },
  // "Platform Services": {
  //   PTAPPLICATION: "Applications",
  //   noObject: "Dimensions",
  //   ACTIVITYLOG: "Objects",
  //   noObject: "Records",
  //   noObject: "Views",
  // },
  // "Data Delivery Service": {
  //   DDSJOB: "DDS Jobs",
  //   noObject: "DDS Objects",
  // },
  // "Sales Tax, VAT, and GST": {
  //   default: " Contact Tax Groups",
  //   TAXDETAIL: "Tax Details",
  //   TAXRECORD: "Tax Records",
  //   TAXSOLUTION: "Tax Solutions",
  // },
};

async function query(api_keyword, api_name, api_category) {
  try {
    const client = bootstrap.client();

    let query = new IA.Functions.Common.ReadByQuery();
    // let query = new IA.Functions.Common.ReadMore();
    query.objectName = api_keyword;
    query.returnFormat = "json";
    query.pageSize = 1000;
    // query.resultId = "7030372d776562303330ZfwHvoQwaDHcMgMEJphxAwAAAAY4";
    // query.controlId = "1711005998476";

    let response = await client.execute(query);
    // console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    if (json_data.length > 0) {
      let data_pool = {};
      Object.values(json_data).map((invoice) => {
        data_pool[invoice["RECORDNO"]] = invoice;
      });

      let firstObject = data_pool[Object.keys(data_pool)[0]];

      // generating csv files for this data
      csv_generator(
        api_name,
        api_category,
        data_pool,
        firstObject,
        query.objectName,
        true
      );

      let shouldIterate = true;

      do {
        let query = new IA.Functions.Common.ReadMore();
        query.resultId = response._results[0]._resultId;

        response = await client.execute(query);
        const result = response.getResult();

        const _totalCount = response._results[0]._totalCount;
        const _numRemaining = response._results[0]._numRemaining;

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
        csv_generator(
          api_name,
          api_category,
          temp_data_pool,
          firstObject,
          query.objectName,
          false
        );
      } while (shouldIterate);
    }
  } catch (ex) {
    console.log(`${api_category} -> ${api_keyword} Error from main: `, ex);
  }
}

async function Iterator() {
  Object.keys(api_collection).map((api_category) => {
    const api_category_list = api_collection[api_category];

    Object.keys(api_category_list).map((api_keyword) => {
      const api_name = api_category_list[api_keyword];
      query(api_keyword, api_name, api_category);
    });
  });
}

Iterator();
