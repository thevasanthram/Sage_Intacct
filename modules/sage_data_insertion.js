const fs = require("fs");
const path = require("path");
const mssql = require("mssql");

async function sage_data_insertion(
  sql_pool,
  data_pool,
  header_data,
  table_name
) {
  let status = false;
  // Generate a temporary table name
  const tempTableName = `Temp_${table_name}_${Date.now()}`;

  try {
    // Create a request object
    const request = new mssql.Request(sql_pool);

    // Create a table object with create option set to true
    const table = new mssql.Table(tempTableName);
    table.create = true; // Create the table if it doesn't exist

    // Define the columns based on the header_data
    Object.keys(header_data).forEach((column) => {
      table.columns.add(column.replace(/\./g, "_"), mssql.NVarChar(mssql.MAX));
    });

    // Add the data to the table
    data_pool.forEach((currentObj) => {
      table.rows.add(
        ...Object.values(currentObj).map((value) => {
          if (typeof value === "string") {
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
    await request.bulk(table);

    // Check if the target table exists
    const tableExistsQuery = `
      SELECT 1 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = '${table_name}'
    `;
    const tableExistsResult = await sql_pool.query(tableExistsQuery);

    if (tableExistsResult.recordset.length === 0) {
      // If the table does not exist, create it and bulk insert
      console.log(
        `Table ${table_name} does not exist. Performing bulk insert.`
      );

      // Create the target table object
      const targetTable = new mssql.Table(table_name);
      targetTable.create = true; // Create the table if it doesn't exist

      // Define the columns based on the header_data
      Object.keys(header_data).forEach((column) => {
        targetTable.columns.add(
          column.replace(/\./g, "_"),
          mssql.NVarChar(mssql.MAX)
        );
      });

      // Add the data to the target table
      targetTable.rows = table.rows;

      // Bulk insert into the target table
      await request.bulk(targetTable);
    } else {
      // If the table exists, perform merge operation
      console.log(`Table ${table_name} exists. Performing merge operation.`);

      // Check for new columns and alter the target table if necessary
      const targetColumnsResult = await sql_pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table_name}'`
      );

      const targetColumns = targetColumnsResult.recordset.map(
        (row) => row.COLUMN_NAME
      );

      const newColumns = Object.keys(header_data).filter(
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
      const updation_query = Object.keys(header_data)
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
        INSERT (${Object.keys(header_data)
          .map((column) => `[${column.replace(/\./g, "_")}]`)
          .join(", ")}
        )
        VALUES (${Object.keys(header_data)
          .map((column) => `[Source].[${column.replace(/\./g, "_")}]`)
          .join(", ")}
        );
      `;

      // Execute the MERGE query
      const mergeResult = await sql_pool.query(mergeQuery);

      console.log(
        `${table_name} data insertion completed. Affected number of rows: `,
        mergeResult.rowsAffected
      );
    }

    // Drop the temporary table
    await sql_pool.query(`DROP TABLE ${tempTableName}`);

    status = true;
  } catch (err) {
    console.error(`${table_name} Bulk insert error:`, err);
    status = false;

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

module.exports = sage_data_insertion;
