const functions = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { scrapeStoreInfoForItem } = require("./scraper");
const { testInputs, testOutputs } = require("./testData");
const { findBestRoute } = require("./TravelingSalesmikeSolver");
const DEV_MODE = true;

exports.getItemAvailability = functions.https.onRequest(
  async (request, response) => {
    // When ready, you can swap the hardcoded SKU for request.query.ids
    // Then make the request with
    // firebase emulators:start
    // then in your browser,
    // http://127.0.0.1:5001/get-that-booze-mike/us-central1/getItemAvailability?ids=12&ids=123
    const output = {};
    if (DEV_MODE) {
      for (const item of testInputs) {
        const sku = item[0];
        const name = item[1];
        const qty = item[2];
        const message = await scrapeStoreInfoForItem(sku);
        output[sku] = { name: name, qty: qty, availability: message };
      }
    }
    response.status(200).send(output);
  }
);

exports.runTestMode = functions.https.onRequest(async (request, response) => {
  // http://127.0.0.1:5001/get-that-booze-mike/us-central1/runTestMode
  let output = [];
  if (DEV_MODE) {
    output = findBestRoute(testInputs, testOutputs);
  }
  response.status(200).send(output);
});

exports.runOnNewData = onDocumentCreated("forms/{id}", async (event) => {
  const data = event.data.data();
  const quantitiesNeeded = data.input;
  const storeAvailability = {};
  if (DEV_MODE) {
    // TODO(nick): Change the output format to be an object like so
    return event.data.ref.update({
      output: {
        topStores: ["0015"],
        stores2: ["0015", "0023"],
        stores3: ["0043", "0025", "0001"],
      },
      scrapingCompleted: true,
    });
  }
  for (const item of quantitiesNeeded) {
    const message = await scrapeStoreInfoForItem(item.SKU);
    storeAvailability[item.SKU] = {
      name: item.name,
      qty: item.quantity,
      availability: message,
    };
  }
  const output = findBestRoute(quantitiesNeeded, storeAvailability);
  return event.data.ref.update({ output: output, scrapingCompleted: true });
});
