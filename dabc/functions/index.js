const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");
const DOMParser = require("xmldom").DOMParser;

const BASE_URL =
  "https://webapps2.abc.utah.gov/ProdApps/ProductLocatorCore/ProductDetail/Index?sku=";

async function makeDABSRequest(sku) {
  const requestUrl = BASE_URL + sku;
  const webResponse = await fetch(requestUrl);
  if (webResponse.status !== 200) {
    const message =
      "Request failed for item " + sku + " with status " + webResponse.status;
    logger.error(message);
    throw new Error(message);
  }
  const responseBody = await webResponse.text();
  return responseBody;
}

function parseDABSResponse(responseText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(responseText, "text/html");
  const tableBodies = doc
    .getElementById("storeTable")
    .getElementsByTagName("tbody");
  if (tableBodies.length === 0) {
    throw new Error("No tbody found in response");
  }
  const tableBody = tableBodies[0];
  const rows = tableBody.getElementsByTagName("tr");
  let itemData = {};
  Array.from(rows).forEach((row) => {
    // tr0 is ID and tr5 is the quantity.
    // TODO: Maybe don't hardcode this and read the th instead?
    const rowData = row.getElementsByTagName("td");
    if (rowData.length < 6) {
      throw new Error("Unexpected number of columns in row " + row.textContent);
    }
    itemData[rowData[0].textContent] = rowData[5].textContent;
    logger.info(itemData);
  });
  return itemData;
}

async function scrapeStoreInfoForItem(sku) {
  const response = await makeDABSRequest(sku);
  return parseDABSResponse(response);
}

exports.getItemAvailability = functions.https.onRequest(
  async (request, response) => {
    // When ready, you can swap the hardcoded SKU for request.query.ids
    // Then make the request with
    // firebase emulators:start
    // then in your browser,
    // http://127.0.0.1:5001/get-that-booze-mike/us-central1/getItemAvailability?ids=12&ids=123
    const message = await scrapeStoreInfoForItem("953959");
    response.status(200).send(message);
  }
);
