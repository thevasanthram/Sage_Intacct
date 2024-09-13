const axios = require("axios");
const xml2js = require("xml2js");
const csv_generator = require("./../../modules/csv_generator");

const generateSessionId = async () => {
  try {
    // Ensure correct format and values for the login request
    const xmlSessionRequest = `
      <request>
        <control>
          <senderid>pinnacle-mep</senderid>
          <password>Y52!po29@LngT</password>
          <controlid>${Date.now()}</controlid>
          <uniqueid>false</uniqueid>
          <dtdversion>3.0</dtdversion>
          <includewhitespace>false</includewhitespace>
        </control>
        <operation>
          <authentication>
            <login>
              <userid>vjoshi</userid>
              <companyid>pinnacle-mep</companyid>
              <password>TestRed@01</password>
            </login>
          </authentication>
          <content>
            <function controlid="generate_session_id">
              <getAPISession />
            </function>
          </content>
        </operation>
      </request>`;

    const response = await axios.post(
      "https://api.intacct.com/ia/xml/xmlgw.phtml",
      xmlSessionRequest,
      {
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );

    // Parse the session ID from the response
    const sessionId = extractSessionIdFromResponse(response.data);
    console.log("Generated Session ID:", sessionId);
    return sessionId;
  } catch (error) {
    console.error("Error response:", error);
  }
};

const extractSessionIdFromResponse = (responseXml) => {
  const regex = /<sessionid>([^<]+)<\/sessionid>/;
  const match = responseXml.match(regex);
  return match ? match[1] : null;
};

// Function to fetch trial balance using session ID
const fetchTrialBalanceWithSession = async (sessionId) => {
  try {
    const xmlTrialBalanceRequest = `
      <request>
        <control>
          <senderid>pinnacle-mep</senderid>
          <password>Y52!po29@LngT</password>
          <controlid>${Date.now()}</controlid> <!-- Unique control ID -->
          <uniqueid>false</uniqueid>
          <dtdversion>3.0</dtdversion>
          <includewhitespace>false</includewhitespace>
        </control>
        <operation>
          <authentication>
            <sessionid>${sessionId}</sessionid>
          </authentication>
          <content>
            <function controlid="get_trial_balance">
              <get_trialbalance>
                
                <reportingperiodname>${"Calendar Year Ended December 2022"}</reportingperiodname>
                <showzerobalances>false</showzerobalances>
                <showdeptdetail>false</showdeptdetail>
                <showlocdetail>false</showlocdetail>
                <debitcreditbalance>true</debitcreditbalance>
              </get_trialbalance>
            </function>
          </content>
        </operation>
      </request>`;

    const response = await axios.post(
      "https://api.intacct.com/ia/xml/xmlgw.phtml",
      xmlTrialBalanceRequest,
      {
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );

    // console.log("Trial Balance Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching trial balance:", error.message);
  }
};

// parsing xml to js object
async function parseXmlToObject(xmlString) {
  const parser = new xml2js.Parser();
  return parser
    .parseStringPromise(xmlString)
    .then((result) => {
      // console.log(result);
      return result;
    })
    .catch((err) => {
      console.error("Error parsing XML:", err);
    });
}

// Execute
(async () => {
  const sessionId = await generateSessionId();

  let xml_data = "";
  if (sessionId) {
    xml_data = await fetchTrialBalanceWithSession(sessionId);
  }

  const json_response = await parseXmlToObject(xml_data);

  console.log("json_response: ", json_response);

  const trial_balance_data =
    json_response.response.operation[0].result[0].data[0].trialbalance;

  console.log("data: ", trial_balance_data.length);
  console.log("sample object: ", trial_balance_data[0]);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Adding 1 since months are 0-indexed
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${year}_${month}_${day}`;

  // generating csv files for this data
  await csv_generator(
    "",
    "",
    trial_balance_data,
    trial_balance_data[0],
    "trial_balance_data" + `_${formattedDate}`,
    true,
    "trial_balance_data"
  );
})();
