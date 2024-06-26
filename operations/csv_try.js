const moment = require("moment");
const IA = require("@intacct/intacct-sdk");
const bootstrap = require("./../bootstrap");

// Function to fetch data recursively
async function fetchData(lastModifiedTime = null, resultId = null) {
  try {
    const client = bootstrap.client();

    // Construct query
    let query = new IA.Functions.Common.ReadByQuery();
    query.objectName = "ARINVOICE";
    query.returnFormat = "json";
    query.pageSize = 1000;
    if (lastModifiedTime) {
      query.modifiedSince = moment(lastModifiedTime).format(
        "YYYY-MM-DDTHH:mm:ss"
      );
    }

    console.log(query.modifiedSince);

    // If resultId exists, use ReadMore
    if (resultId) {
      let readMore = new IA.Functions.Common.ReadMore();
      readMore.resultId = resultId;
      response = await client.execute(readMore);
    } else {
      response = await client.execute(query);
    }

    // Process the response and handle the data

    // Check if there are more results
    let remainingCount = response._results[0]._numRemaining;
    let newResultId = response._results[0]._resultId;

    console.log("remainingCount: ", remainingCount);

    // If there are more results, fetch them recursively
    if (remainingCount > 0) {
      await fetchData(lastModifiedTime, newResultId);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// Call the fetchData function with the last modified time from yesterday
const yesterday = moment().subtract(1, "days").startOf("day");
fetchData(yesterday);
