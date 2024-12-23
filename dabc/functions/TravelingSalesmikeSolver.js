// inputs:
// quantitiesNeeded:[{name, sku, quantity}]
// itemAvailability:{sku: {
//    name, quantityNeeded, availability {
//      storeId: quantityAvailable
//  }
// }
//}
//
// Returns a list (max 5 entries) of options for getting all the inventory,
// sorted based on Mike's priority list.
const findBestRoute = function (quantitiesNeeded, itemAvailability) {
  // Remap to key by storeId for convenience.
  const storeQuantities = remapItemAvailability(itemAvailability);

  // Returns a list of store groupings to check to see if together they contain
  // all the needed inventory.
  const storesToCheck = getStoresToCheck();
  let i = 0;
  const outputStores = [];
  while (i < storesToCheck.length && outputStores.length < 3) {
    if (visitStores(storesToCheck[i], quantitiesNeeded, storeQuantities)) {
      outputStores.push(storesToCheck[i]);
    }
    i++;
  }
  return generateOutputObject(outputStores, quantitiesNeeded, itemAvailability);
};

const generateOutputObject = function (
  outputStores,
  quantitiesNeeded,
  itemAvailability
) {
  // You can't add an array of arrays in firebase.
  const output = {
    recommendedStores: outputStores.map((stores) => stores.join(",")),
  };
  const topStores = [];
  for (const storeList of outputStores) {
    for (const store of storeList) {
      if (topStores.includes(store)) {
        continue;
      }
      topStores.push(store);
    }
  }
  output["topStores"] = topStores;
  output["debugData"] = itemAvailability;
  // A match wasn't found. Use the A stores to populate the
  // item missing table, and output the problematic items.
  if (!topStores.length) {
    topStores.push(...["0015", "0029", "0016", "0033"]);
    output["problemItems"] = findProblemItems(itemAvailability);
  }
  const outputData = [];
  for (const item of quantitiesNeeded) {
    const outputItem = Object.assign({}, item);
    const sku = item["sku"];
    const amountNeeded = item["quantity"];
    const missingFromStore = [];
    for (const store of topStores) {
      const availability = itemAvailability[sku].availability;
      if (store in availability) {
        missingFromStore.push(Math.max(0, amountNeeded - availability[store]));
      } else {
        missingFromStore.push(amountNeeded);
      }
    }
    outputItem["storeData"] = missingFromStore;
    outputData.push(outputItem);
  }
  output["outputData"] = outputData;
  return output;
};

const findProblemItems = function (itemAvailability) {
  const problemItems = [];
  for (const sku in itemAvailability) {
    const stores = [];
    for (const store in itemAvailability[sku]["availability"]) {
      if (parseInt(itemAvailability[sku]["availability"][store]) > 0) {
        stores.push(store);
      }
    }
    if (stores.length < 3) {
      problemItems.push({
        sku: sku,
        name: itemAvailability[sku]["name"],
        stores: stores,
      });
    }
  }
  return problemItems;
};

// input:
// itemAvailability:{sku: {
//    name, quantityNeeded, availability {
//      storeId: quantityAvailable
//  }
// }
//}
//
// Returns: {storeId: {sku: quantityAvailable}}
const remapItemAvailability = function (itemAvailability) {
  const storeIdObj = {};
  for (const sku in itemAvailability) {
    for (const store in itemAvailability[sku]["availability"]) {
      if (storeIdObj[store]) {
        storeIdObj[store] = {
          ...storeIdObj[store],
          [sku]: parseInt(itemAvailability[sku]["availability"][store]),
        };
      } else {
        storeIdObj[store] = {
          [sku]: parseInt(itemAvailability[sku]["availability"][store]),
        };
      }
    }
  }
  return storeIdObj;
};

// input:
// storesToCheck: [storeId]
// quantitiesNeeded:[{name, sku, quantity}]
// storeQuantities: {storeId: {sku: quantityAvailable}}
//
// returns: bool
const visitStores = function (
  storesToCheck,
  quantitiesNeeded,
  storeQuantities
) {
  // We need to make a deep copy to ensure that we don't mutate the original.
  let quantitiesCopy = JSON.parse(JSON.stringify(quantitiesNeeded));
  for (const storeId of storesToCheck) {
    // Some stores in our store list may have no inventory.
    if (!storeQuantities[storeId]) {
      return;
    }
    for (let i = 0; i < quantitiesCopy.length; i++) {
      let item = quantitiesCopy[i];
      const sku = item.sku;
      if (storeQuantities[storeId][sku]) {
        item.quantity -= storeQuantities[storeId][sku];
      }
    }
    let gotEm = true;
    for (const item of quantitiesCopy) {
      if (item.quantity > 0) {
        gotEm = false;
        break;
      }
    }
    if (gotEm) return true;
  }
  return false;
};

// returns: [[storeId]] ordered based on Mike's priority list
// Currently returns 467 different combinations of stores.
// This should be feasible to bruteforce without much issue.
function getStoresToCheck() {
  const aStores = ["0015", "0029", "0052", "0016", "0041", "0025"];
  const bStores = ["0033", "0035", "0002", "0031", "0051", "0013", "0026"];
  const cStores = ["0009", "0014", "0004", "0003", "0040", "0046", "0048"];
  //   const dStores = [
  //     "0034",
  //     "0036",
  //     "0037",
  //     "0038",
  //     "0001",
  //     "0012",
  //     "0014",
  //     "0026",
  //     "0046",
  //   ];
  let storesToCheck = [];
  storesToCheck.push(...aStores.map((store) => [store]));
  storesToCheck.push(...combinationLengthTwo(aStores));
  storesToCheck.push(...bStores.map((store) => [store]));
  storesToCheck.push(...combinationLengthTwo(aStores.concat(bStores)));
  storesToCheck.push(...combinationLengthThree(aStores.concat(bStores)));
  storesToCheck.push(...cStores.map((store) => [store]));
  storesToCheck.push(
    ...combinationLengthTwo(aStores.concat(bStores).concat(cStores))
  );
  storesToCheck.push(
    ...combinationLengthThree(aStores.concat(bStores).concat(cStores))
  );

  const dedupedStores = [];
  const deduper = new Set();
  for (const store of storesToCheck) {
    const key = store.join(",");
    if (!deduper.has(key)) {
      dedupedStores.push(store);
      deduper.add(key);
    }
  }

  return dedupedStores;
}

function combinationLengthTwo(list) {
  const output = [];
  if (list.length < 2) {
    return output;
  }
  for (let i = 0; i < list.length - 1; i++) {
    for (let j = i + 1; j < list.length; j++) {
      output.push([list[i], list[j]]);
    }
  }
  return output;
}

function combinationLengthThree(list) {
  const output = [];
  if (list.length < 3) {
    return output;
  }
  for (let i = 0; i < list.length - 2; i++) {
    for (let j = i + 1; j < list.length - 1; j++) {
      for (let k = j + 1; k < list.length; k++) {
        output.push([list[i], list[j], list[k]]);
      }
    }
  }
  return output;
}

exports.findBestRoute = findBestRoute;
exports.remapItemAvailability = remapItemAvailability;
exports.visitStores = visitStores;
