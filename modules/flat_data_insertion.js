const fs = require("fs");
const path = require("path");
const mssql = require("mssql");

async function flat_data_insertion(
  sql_request,
  data_pool,
  header_data,
  table_name,
  insertion_mode
) {
  let status = false;
  try {
    if (insertion_mode == "UPADTE-FLASHING") {
      const delete_table_records = `DELETE FROM ${table_name}`;
      await sql_request.query(delete_table_records);
    }

    // Create a table object with create option set to false
    const table = new mssql.Table(table_name);
    table.create = true; // Create the table if it doesn't exist

    // Define the columns based on the header_data
    // console.log("table_name: ", table_name);
    // console.log("header_data: ", header_data);

    header_data.map((column) => {
      table.columns.add(column.replace(/\./g, "_"), mssql.NVarChar(mssql.MAX));
    });

    // table.rows.add(1, "Expert Heating and Cooling");

    await Promise.all(
      data_pool.map(async (currentObj, index) => {
        table.rows.add(
          ...Object.values(currentObj).map((value) => {
            if (typeof value == "string") {
              return value.includes(`'`)
                ? `${String(value.replace(/'/g, `''`))}`
                : `${String(value)}`;
            } else {
              return String(value);
            }
          })
        ); // Spread the elements of the row array as arguments
      })
    );

    if (table_name == "Project_and_Resource_Management_Projects") {
      console.log("columns: ", table.columns);
      console.log("rows: ", table.rows[0]);
    }

    console.log(`${table_name}: `, data_pool.length);

    // Bulk insert
    const bulkResult = await sql_request.bulk(table);

    // Log the queries

    console.log(
      `${table_name} data insertion completed. Affected no of rows: `,
      bulkResult.rowsAffected
    );

    status = true;
  } catch (err) {
    console.error(table_name, "Bulk insert error: trying again..", err);

    status = false;
  }

  return status;
}

module.exports = flat_data_insertion;
