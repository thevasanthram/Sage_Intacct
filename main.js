/**
 * Copyright 2020 Sage Intacct, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

gettingStarted();

async function gettingStarted() {
  const bootstrap = require("./bootstrap");
  const IA = require("@intacct/intacct-sdk");

  try {
    const client = bootstrap.client();

    let read = new IA.Functions.Common.Read();
    read.objectName = "CUSTOMER";
    // read.fields = ["RECORDNO", "CUSTOMERID", "NAME"];
    read.fields = ["*"];
    // read.keys = [
    //   33, // Replace with the record number of a customer in your company
    // ];

    read.keys = [23];

    read.returnFormat = "json";

    const response = await client.execute(read);
    console.log(response);
    const result = response.getResult();

    let json_data = result.data;

    console.log("Result:");
    console.log(JSON.stringify(json_data));
  } catch (ex) {
    console.log("Error from main: ", ex);
  }
}
