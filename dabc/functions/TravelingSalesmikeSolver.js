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

const { logger } = require("firebase-functions/v1");

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
  // TODO: Output some info about how much booze to get from which stores.
  // eg. If Mike only needs 1 bottle of Jim Beam from 0004, maybe he
  // decides not to go there at all.
  const output = {};
  if (outputStores.length >= 1) {
    output["topStores"] = outputStores[0];
  } else {
    output["topStores"] = ["NONE"];
  }
  if (outputStores.length >= 2) {
    output["stores2"] = outputStores[1];
  } else {
    output["stores2"] = ["NONE"];
  }
  if (outputStores.length >= 3) {
    output["stores3"] = outputStores[2];
  } else {
    output["stores3"] = ["NONE"];
  }
  return output;
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
      console.log(storesToCheck.join(", "));
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
  const aStores = ["0015", "0029", "0016", "0033"];
  const bStores = ["0025", "0041", "0035", "0013"];
  const cStores = ["0002", "0004", "0009", "0051", "0003"];
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
exports.getStoresToCheck = getStoresToCheck;
