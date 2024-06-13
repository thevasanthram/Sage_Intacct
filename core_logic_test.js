const flat_data_insertion = require("./modules/flat_data_insertion");
const hvac_merge_insertion = require("./modules/hvac_merge_insertion");
const find_lenghthiest_header = require("./modules/find_lengthiest_header");
const create_sql_connection = require("./modules/create_sql_connection");

let data_pool = [
  {
    RECORDNO: "1",
    name: "vasanth",
    english: "100",
    tamil: "100",
    maths: "100",
    science: "100",
    social: "100",
    computer: "100",
  },
  {
    RECORDNO: "2",
    name: "sanjeev",
    english: "80",
    tamil: "80",
    maths: "80",
    science: "80",
    social: "80",
    archery: "100",
    gym: "100",
  },
  {
    RECORDNO: "3",
    name: "manvendra",
    english: "90",
    tamil: "90",
    maths: "90",
    science: "90",
    social: "90",
  },
  {
    RECORDNO: "4",
    name: "kiran",
    english: "75",
    tamil: "75",
    maths: "75",
    science: "75",
    social: "75",
  },
  {
    RECORDNO: "5",
    name: "deevia",
    english: "95",
    tamil: "95",
    maths: "95",
    science: "95",
    social: "95",
  },
  {
    RECORDNO: "6",
    name: "zf",
    english: "95",
  },
];

let is_first_time = true;
const insertion_mode = "UPADTE-FLASHING";
const table_name = "core_logic_testing";

async function core_logic_test(is_first_time, insertion_mode) {
  // creating a client for azure sql database operations
  let sql_request = "";
  do {
    sql_request = await create_sql_connection();
  } while (!sql_request);

  //   if (data_pool.length >= 1) {
  // write into db
  let data_insertion_status = false;

  const lenghthiest_header = await find_lenghthiest_header(data_pool);
  console.log("lenghthiest_header: ", lenghthiest_header);

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
  //   }

  console.log("done");
}

core_logic_test(is_first_time, insertion_mode);
