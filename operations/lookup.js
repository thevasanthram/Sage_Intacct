look_up();

async function look_up() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    console.log(IA.Functions.Common.NewQuery);
    console.log("-------");
    console.log(IA.Functions.Common.NewQuery.QueryFilter.Filter);
    console.log("-------");

    // Common: {
    //   Read: [Getter],
    //   ReadByName: [Getter],
    //   ReadByQuery: [Getter],
    //   ReadMore: [Getter],
    //   Inspect: [Getter],
    //   Lookup: [Getter],
    //   GetList: [Object],
    //   Query: [Object],
    //   NewQuery: [Object]
    // },

    let look_up = new IA.Functions.Common.ReadByQuery();
    look_up.objectName = "ARINVOICE";

    // Construct the filter for date
    let filter = new IA.Functions.Common.NewQuery.QueryFilter.Filter('WHENCREATED');
    let field = new IA.Functions.Common.NewQuery.QuerySelect.Field(
      "WHENCREATED"
    );
    // let greaterThanDate = new IA.Types.GreaterThan("WHENCREATED", "2023-02-22");
    // let lessThanDate = new IA.Types.LessThan("WHENCREATED", "2023-02-24");
    // filter.filter.add(greaterThanDate);
    // filter.add(lessThanDate);

    filter.GREATER_THAN_OR_EQUAL_TO = "2024-02-23T00:00:00";
    filter.LESS_THAN = "2024-02-24T00:00:00";

    look_up.filter = filter;

    const response = await client.execute(look_up);
    console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    console.log("Result:", json_data[0]["RECORDNO"]);
    console.log("Result:", json_data.length);
    // console.log(JSON.stringify(json_data));
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
