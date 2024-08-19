const {
  Query,
} = require("@intacct/intacct-sdk/dist/Functions/Common/NewQuery");

async function query() {
  const bootstrap = require("./../bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let data_delivery_service =
      new IA.Functions.DataDeliveryService.DdsJobCreate();

    // let data_delivery_service =
    //   new IA.Functions.DataDeliveryService.DdsObjectList();

    data_delivery_service.objectName = "WAREHOUSE";

    // console.log("data_delivery_service: ", data_delivery_service);

    const response = await client.execute(data_delivery_service);

    // console.log("response: ", response);
    console.log("response: ", response._results[0]._data[0]);

    // data_delivery_service:  {
    //     DdsJobCreate: [Getter],
    //     DdsObjectDdlGet: [Getter], // for to fetch data
    //     DdsObjectList: [Getter] // for to get the list of tables that can be pulled through this object
    //   }

    // // Construct the filter for date
    // let filter = new IA.Functions.Common.NewQuery.QueryFilter.Filter(
    //   "WHENCREATED"
    // );

    // // Use ISO 8601 date format
    // filter.greaterThanOrEqualTo("2024-04-01");
    // filter.lessThan("2024-04-15");

    // queryObj.filter = filter;

    // const response = await client.execute(queryObj);
    // const result = response.getResult();
    // let json_data = result.data;

    // console.log("Result:", json_data.length);
    // console.log("First Record Number:", json_data[0]["RECORDNO"]);
    // console.log("First Record Created Date:", json_data[0]["WHENCREATED"]);
    // console.log("Second Record Number:", json_data[1]["RECORDNO"]);
    // console.log("Second Record Created Date:", json_data[1]["WHENCREATED"]);
    // Process retrieved data further as needed
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}

query();
