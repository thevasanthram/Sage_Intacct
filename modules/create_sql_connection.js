const sql = require("mssql");

async function create_sql_connection() {
  // database configuration

  const config = {
    user: "pinnacleadmin",
    password: "PiTestBi01",
    server: "pinnaclemep.database.windows.net",
    // database: "bi_play_ground_update",
    database: "sage_intacct",
    options: {
      encrypt: true, // Use this option for SSL encryption
      requestTimeout: 48 * 60 * 60 * 1000, // 60 seconds (adjust as needed)
    },
  };

  let request;

  try {
    await sql.connect(config);

    // Create a request object
    request = new sql.Request();
  } catch (err) {
    console.log("Error while creating request object, Trying Again!", err);
    request = false;
  }

  return request; // Return both the pool and request objects
}

create_sql_connection();

module.exports = create_sql_connection;
