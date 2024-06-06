const sql = require("mssql");
const fs = require("fs");

async function create_sql_connection(db_name) {
  const config = {
    user: "pinnacleadmin",
    password: "PiTestBi01",
    server: "pinnaclemep.database.windows.net",
    database: db_name,
    options: {
      encrypt: true, // Use this option for SSL encryption
      requestTimeout: 48 * 60 * 60 * 1000, // 48 hours
    },
  };

  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    return pool.request();
  } catch (err) {
    console.log("Error while creating request object, Trying Again!", err);
    return false;
  }
}

async function sage_intacct_record_count() {
  let main_db = "sage_intacct";
  let refresh_db = "bi_play_ground_update";
  let sage_intacct_client = "";
  do {
    sage_intacct_client = await create_sql_connection(main_db);
  } while (!sage_intacct_client);

  let sage_auto_refresh_client = "";
  do {
    sage_auto_refresh_client = await create_sql_connection(refresh_db);
  } while (!sage_auto_refresh_client);

  try {
    // find table list in db
    const main_db_table_response = await sage_intacct_client.query(
      "SELECT t.name AS TableName,SUM(p.rows) AS RecordCount FROM sys.tables AS t INNER JOIN sys.partitions AS p ON t.object_id = p.object_id WHERE t.is_ms_shipped = 0 AND p.index_id IN (0,1) GROUP BY t.name ORDER BY RecordCount DESC;"
    );
    let main_db_table_list = main_db_table_response.recordset;

    console.log(`${main_db}: `, main_db_table_list.length);

    const refresh_db_table_response = await sage_auto_refresh_client.query(
      "SELECT t.name AS TableName,SUM(p.rows) AS RecordCount FROM sys.tables AS t INNER JOIN sys.partitions AS p ON t.object_id = p.object_id WHERE t.is_ms_shipped = 0 AND p.index_id IN (0,1) GROUP BY t.name ORDER BY RecordCount DESC;"
    );
    let refresh_db_table_list = refresh_db_table_response.recordset;

    console.log(`${refresh_db}: `, refresh_db_table_list.length);

    // writing into csv
    let csv_content = main_db + "\n";
    main_db_table_list.map((table) => {
      csv_content =
        csv_content +
        table.TableName.replace(/,/g, "")
          .replace(/\n/g, "")
          .replace(/\r\n/g, "")
          .replace(/\r/g, "") +
        "," +
        table.RecordCount +
        "\n";
    });

    csv_content = csv_content + "\n" + refresh_db + "\n";

    refresh_db_table_list.map((table) => {
      csv_content =
        csv_content +
        table.TableName.replace(/,/g, "")
          .replace(/\n/g, "")
          .replace(/\r\n/g, "")
          .replace(/\r/g, "") +
        "," +
        table.RecordCount +
        "\n";
    });

    csv_content = csv_content + "\n";

    fs.writeFile("sage_record_count.csv", csv_content, () =>
      console.log("Records details written to sage_record_count.csv")
    );
  } catch (err) {
    console.log("error: ", err);
  }
}

sage_intacct_record_count();
