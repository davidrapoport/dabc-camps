const functions = require("firebase-functions");
const { scrapeStoreInfoForItem } = require("./scraper");
const { testInputs } = require("./testData");
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
