const axios = require("axios");
const xml2js = require("xml2js");

// Function to get the current timestamp
const getTimestamp = () => new Date().toISOString();

// Function to generate a unique control ID
const generateControlId = () => `control-${Date.now()}`;

const generateApiSession = async () => {
  const url = "https://api.intacct.com/ia/xml/xmlgw.phtml";

  // Replace these placeholders with your actual credentials
  const senderId = "pinnacle-mep";
  const senderPassword = "Y52!po29@LngT";
  const userId = "vjoshi";
  const companyId = "pinnacle-mep";
  const userPassword = "TestRed@01";

  // Generate unique control ID and timestamp
  const controlId = generateControlId();
  const timestamp = getTimestamp();

  // Construct XML request body
  const xmlBody = `
    <?xml version="1.0" encoding="UTF-8"?>
    <request>
      <control>
        <senderid>${senderId}</senderid>
        <password>${senderPassword}</password>
        <controlid>${timestamp}</controlid>
        <uniqueid>false</uniqueid>
        <dtdversion>3.0</dtdversion>
      </control>
      <operation>
        <authentication>
          <login>
            <userid>${userId}</userid>
            <companyid>${companyId}</companyid>
            <password>${userPassword}</password>
          </login>
        </authentication>
        <content>
          <function controlid="${controlId}">
            <!-- Use the correct API function -->
            <get_trialbalance>
          <reportingperiodname>Calendar Year Ended December 2022</reportingperiodname>
          <showzerobalances>false</showzerobalances>
          <showdeptdetail>false</showdeptdetail>
          <showlocdetail>false</showlocdetail>
          <debitcreditbalance>true</debitcreditbalance>
        </get_trialbalance>
          </function>
        </content>
      </operation>
    </request>
  `;

  try {
    // Make the API request
    const response = await axios.post(url, xmlBody, {
      headers: {
        "Content-Type": "application/xml",
      },
    });

    // Parse XML response to JSON
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);

    // Extract and print the API session ID
    if (
      result &&
      result.response &&
      result.response.control &&
      result.response.control[0].status[0] === "success"
    ) {
      const sessionId = result.response.control[0].sessionid[0];
      console.log("API Session ID:", sessionId);
    } else {
      console.error("Failed to generate API session:", result);
    }
  } catch (error) {
    console.error(
      "Error generating API session:",
      error.response ? error.response.data : error.message
    );
  }
};

generateApiSession();
