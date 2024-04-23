async function create_flat_table(sql_request, table_name, header_data) {
  let table_creation_status = false;
  try {
    const table_creation_query = `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table_name}')
    BEGIN
    CREATE TABLE ${table_name} (
        ${header_data
          .map((column) => column.replace(/\./g, "_") + " NVARCHAR(MAX) NULL")
          .join(",")}
        
    )
    END`;

    // console.log("table_creation_query: ", table_creation_query);

    await sql_request.query(table_creation_query);

    table_creation_status = true;
  } catch (err) {
    console.log(`Error creating flat table - ${table_name}`);
    table_creation_status = false;
  }

  return table_creation_status;
}

module.exports = create_flat_table;
