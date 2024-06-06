const fs = require("fs");
const path = require("path");
const mssql = require("mssql");
const extractMatchingValues = require("./extract_matching_values");

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
    // Create a table object with create option set to true
    const table = new mssql.Table(tempTableName);
    table.create = true; // Create the table if it doesn't exist

    // Define the columns based on the header_data
    Object.keys(header_data).map((column) => {
      table.columns.add(column.replace(/\./g, "_"), mssql.NVarChar(mssql.MAX));
    });

    // console.log("header_data: ", header_data);

    // Add the data to the table
    data_pool.map((currentObj) => {
      const revised_record = extractMatchingValues(header_data, currentObj);

      table.rows.add(
        ...Object.values(revised_record).map((value) => {
          if (typeof value == "string") {
            return value.includes(`'`)
              ? `${value.replace(/'/g, `''`)}`
              : `${value}`;
          } else {
            return value;
          }
        })
      );
    });

    // Bulk insert into the temporary table
    await sql_pool.bulk(table);

    // Check for new columns and alter the target table if necessary
    const targetColumnsResult = await sql_pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table_name}'`
    );

    const targetColumns = targetColumnsResult.recordset.map(
      (row) => row.COLUMN_NAME
    );

    const newColumns = header_data.filter(
      (column) => !targetColumns.includes(column.replace(/\./g, "_"))
    );

    for (const column of newColumns) {
      const alterTableQuery = `ALTER TABLE ${table_name} ADD [${column.replace(
        /\./g,
        "_"
      )}] NVARCHAR(MAX) NULL`;
      console.log(`Altering table to add new column: ${column}`);
      await sql_pool.query(alterTableQuery);
    }

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

    // Use MERGE to update or insert into the target table
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
    console.error(`${table_name} Bulk insert error:`, err);
    status = "failure";

    try {
      await sql_pool.query(`DROP TABLE ${tempTableName}`);
    } catch (dropError) {
      console.error(
        `Failed to drop temporary table ${tempTableName}:`,
        dropError
      );
    }
  }

  return status;
}

module.exports = hvac_merge_insertion;
