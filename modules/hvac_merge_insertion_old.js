const fs = require("fs");
const path = require("path");
const mssql = require("mssql");

async function hvac_merge_insertion(
  sql_pool,
  data_pool,
  header_data,
  table_name
) {
  let status = "failure";
  // Generate a temporary table name
  const tempTableName = `Temp_${table_name}_${Date.now()}`;

  try {
    // Create a table object with create option set to false
    const table = new mssql.Table(tempTableName);
    table.create = true; // Create the table if it doesn't exist

    // Update query
    const updation_query = header_data
      .map(
        (column) =>
          `Target.[${column.replace(/\./g, "_")}] = Source.[${column.replace(
            /\./g,
            "_"
          )}]`
      )
      .join(",\n");

    // Define the columns based on the header_data
    header_data.map((column) => {
      table.columns.add(column.replace(/\./g, "_"), mssql.NVarChar(mssql.MAX));
    });

    console.log("header_data: ", header_data);

    // Add the data to the table
    await Promise.all(
      data_pool.map(async (currentObj, index) => {
        table.rows.add(
          ...Object.values(currentObj).map((value) => {
            if (typeof value == "string") {
              return value.includes(`'`)
                ? `${value.replace(/'/g, `''`)}`
                : `${value}`;
            } else {
              return value;
            }
          })
        );
      })
    );

    // console.log("started to enter db");

    // Bulk insert into the temporary table
    await sql_pool.bulk(table);

    // Use MERGE to update or insert into the target table
    // Example of how to use it in the MERGE statement
    const mergeQuery = `
        MERGE INTO ${table_name} AS Target
        USING ${tempTableName} AS Source
        ON Target.RECORDNO = Source.RECORDNO
        WHEN MATCHED THEN
        UPDATE SET
            ${updation_query}
        WHEN NOT MATCHED THEN
        INSERT (${header_data
          .map((column) => `[${column.replace(/\./g, "_")}]`)
          .join(", ")}
        )
        VALUES (${header_data
          .map((column) => `[Source].[${column.replace(/\./g, "_")}]`)
          .join(", ")}
        );
    `;

    // console.log("mergeQuery: ", mergeQuery);

    // Execute the MERGE query
    const mergeResult = await sql_pool.query(mergeQuery);
    
    

    // Drop the temporary table
    await sql_pool.query(`DROP TABLE ${tempTableName}`);

    console.log(
      `${table_name} data insertion completed. Affected no of rows: `,
      mergeResult.rowsAffected
    );

    status = "success";
  } catch (err) {
    console.error(table_name, "Bulk insert error: trying again..", err);
    status = "failure";

    await sql_pool.query(`DROP TABLE ${tempTableName}`);

    // await sql_pool;
  }

  return status;
}

module.exports = hvac_merge_insertion;
