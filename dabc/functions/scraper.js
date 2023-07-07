const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");
const DOMParser = require("xmldom").DOMParser;

exports.scrapeStoreInfoForItem = async function (sku) {
  const response = await makeDABSRequest(sku);
  return parseDABSResponse(response);
};

async function makeDABSRequest(sku) {
  const filterCookie = await getFilterCookie(sku);
  const aspCookie = await getAspCookie(sku, filterCookie);
  const tableResponse = await fetch(DATA_URL, {
    method: "GET",
    headers: { Cookie: filterCookie + " " + aspCookie },
  });
  if (tableResponse.status !== 200) {
    const message =
      "Data request failed for item " +
      sku +
      " with status " +
      tableResponse.status;
    logger.error(message);
    throw new Error(message);
  }
  const responseBody = await tableResponse.text();
  return responseBody;
}

const ASP_COOKIE_URL =
  "https://webapps2.abc.utah.gov/ProdApps/ProductLocatorCore/Products/GetDetailUrl?sku=";

const DATA_URL =
  "https://webapps2.abc.utah.gov/ProdApps/ProductLocatorCore/ProductDetail/Index";

// The URL and url-encoded JSON data needed to get the filter cookie
const FILTER_COOKIE_URL =
  "https://webapps2.abc.utah.gov/ProdApps/ProductLocatorCore/Products/LoadProductTable";
const SKU_PLACEHOLDER = "SKU_PLACEHOLDER";
const REQUEST_JSON =
  "draw=3&columns%5B0%5D%5Bdata%5D=name&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=sku&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=displayGroup&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=status&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=warehouseQty&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=storeQty&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=onOrderQty&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=currentPrice&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&length=50&search%5Bvalue%5D=&search%5Bregex%5D=false&item_code=" +
  SKU_PLACEHOLDER +
  "&item_name=&category=&sub_category=&price_min=&price_max=&on_spa=false&new_items=false&in_stock=false&status=";

// Takes a 6 digit SKU string and returns a string of format
// 'filter=.....' that can be used in the following web requests
async function getFilterCookie(sku) {
  const filterHeaderResponse = await fetch(FILTER_COOKIE_URL, {
    method: "POST",
    body: REQUEST_JSON.replace(SKU_PLACEHOLDER, sku),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (filterHeaderResponse.status !== 200) {
    const message =
      "Filter request failed for item " +
      sku +
      " with status " +
      filterHeaderResponse.status;
    logger.error(message);
    throw new Error(message);
  }
  return parseFilterCookie(filterHeaderResponse.headers.get("set-cookie"));
}

function parseFilterCookie(responseHeader) {
  return /filter=([^;]*);/gm.exec(responseHeader)[0];
}

async function getAspCookie(sku, filterCookie) {
  const aspHeaderResponse = await fetch(ASP_COOKIE_URL + sku, {
    method: "GET",
    headers: { Cookie: filterCookie },
  });
  if (aspHeaderResponse.status !== 200) {
    const message =
      "ASP request failed for item " +
      sku +
      " with status " +
      aspHeaderResponse.status;
    logger.error(message);
    throw new Error(message);
  }

  return parseASPCookie(aspHeaderResponse.headers.get("set-cookie"));
}

function parseASPCookie(responseHeader) {
  return /.AspNetCore.Mvc.CookieTempDataProvider=([^;]*);/gm.exec(
    responseHeader
  )[0];
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
