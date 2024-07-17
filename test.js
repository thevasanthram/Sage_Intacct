const create_sql_connection = require("./modules/create_sql_connection");

async function test() {
  // creating a client for azure sql database operations
  let sql_request = "";
  do {
    sql_request = await create_sql_connection();
  } while (!sql_request);

  const GLENTRY_query = await sql_request.query("SELECT * FROM GLENTRY;");
  const GLENTRY = GLENTRY_query.recordset;

  console.log("GLENTRY batchno: ");

  const GLBATCH_query = await sql_request.query("SELECT * FROM GLBATCH;");
  const GLBATCH = GLBATCH_query.recordset;

  const GLENTRY_batches = {};
  GLENTRY.map((entry_record) => {
    GLENTRY_batches[entry_record["BATCHNO"]] = "present";
  });

  console.log("unique GLENTRY_batches: ", Object.keys(GLENTRY_batches).length);

  const GLBATCH_record_no = {};
  const GLBATCH_batch_no = {};
  GLBATCH.map((batch_record) => {
    GLBATCH_batch_no[batch_record["BATCHNO"]] = "present";
    GLBATCH_record_no[batch_record["RECORDNO"]] = "present";
  });

  console.log(
    "unique GLBATCH_record_no: ",
    Object.keys(GLBATCH_record_no).length
  );
  console.log(
    "unique GLBATCH_batch_no: ",
    Object.keys(GLBATCH_batch_no).length
  );

  const record_no_count = 0;
  const batch_no_count = 0;
  Object.keys(GLENTRY_batches).map((batch_no) => {
    if (GLBATCH_record_no[batch_no]) {
      record_no_count = record_no_count + 1;
    }

    if (GLBATCH_batch_no[batch_no]) {
      batch_no_count = batch_no_count + 1;
    }
  });

  console.log("matching record count: ", record_no_count);
  console.log("matching batch count: ", batch_no_count);
}

test();
