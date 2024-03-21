const IA = require("@intacct/intacct-sdk");
let clientConfig = new IA.ClientConfig(); // Create the config and set a session ID
clientConfig.sessionId = "SomeSessionFromTheInternet..";

const client = new IA.OnlineClient(clientConfig); // Construct the client with the config

// --=====================================

const IA = require("@intacct/intacct-sdk");
let requestConfig = new IA.RequestConfig(); // Create the request config and set a control ID
requestConfig.controlId = "testing123";

const response = await client.execute(query, requestConfig); // Execute the request and await the response

// --=====================================

controlId = Date.now().toString();
encoding = "utf-8";
maxRetries = 5;
maxTimeout = 30000; // milliseconds
noRetryServerErrorCodes = [524]; // CDN cut the connection, but the system is still processing
policyId = "";
transaction = false;
uniqueId = false;

// --=====================================
