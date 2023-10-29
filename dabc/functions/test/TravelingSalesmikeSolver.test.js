/* eslint-disable quote-props */
const {
  findBestRoute,
  remapItemAvailability,
  visitStores,
} = require("../TravelingSalesmikeSolver");
const { testOutputs, testInputs } = require("../testData");

test("Correctly remaps item availability", () => {
  const input = {
    1: {
      name: "Sav",
      qty: 36,
      availability: {
        "0001": "42",
        "0002": "47",
      },
    },
    4: {
      name: "Rioja",
      qty: 24,
      availability: {
        "0002": "20",
        "0008": "18",
      },
    },
    9: {
      name: "Wine",
      qty: 12,
      availability: {
        "0001": "12",
        "0002": "4",
      },
    },
  };
  const expected = {
    "0001": { 1: 42, 9: 12 },
    "0002": { 1: 47, 4: 20, 9: 4 },
    "0008": { 4: 18 },
  };
  expect(remapItemAvailability(input)).toStrictEqual(expected);
});

// test("correctly determine if stores contain all needed items", () => {
//   const input = {
//     "069420": {
//       name: "Sav",
//       qty: 36,
//       availability: {
//         "0001": "42",
//         "0002": "47",
//       },
//     },
//     777999: {
//       name: "Rioja",
//       qty: 20,
//       availability: {
//         "0002": "20",
//         "0008": "18",
//       },
//     },
//     "000666": {
//       name: "Wine",
//       qty: 10,
//       availability: {
//         "0001": "12",
//         "0002": "4",
//       },
//     },
//   };
//   const hasQuant = [
//     { name: "Sav", sku: "069420", qty: 1 },
//     { name: "Rioja", sku: 777999, qty: 1 },
//     { name: "Wine", sku: "000666", qty: 1 },
//   ];
//   const hasQuantZeros = [
//     { name: "Sav", sku: "069420", qty: 0 },
//     { name: "Rioja", sku: 777999, qty: 0 },
//     { name: "Wine", sku: "000666", qty: 0 },
//   ];
//   const hasQuantSav = [
//     { name: "Sav", sku: "069420", qty: 43 },
//     { name: "Rioja", sku: 777999, qty: 1 },
//     { name: "Wine", sku: "000666", qty: 1 },
//   ];
//   const lacksQuant = [
//     { name: "Sav", sku: "069420", qty: 1000 },
//     { name: "Rioja", sku: 777999, qty: 1000 },
//     { name: "Wine", sku: "000666", qty: 1000 },
//   ];
//   const lacksQuantOneItem = [
//     { name: "Sav", sku: "069420", qty: 1 },
//     { name: "Rioja", sku: 777999, qty: 1 },
//     { name: "Wine", sku: "000666", qty: 1000 },
//   ];
//   const lacksQuantOffByOne = [
//     { name: "Sav", sku: "069420", qty: 48 },
//     { name: "Rioja", sku: 777999, qty: 1 },
//     { name: "Wine", sku: "000666", qty: 1 },
//   ];
//   expect(
//     visitStores(
//       ["0001", "0002", "0008"],
//       hasQuant,
//       remapItemAvailability(input)
//     )
//   ).toBe(true);
//   expect(
//     visitStores(
//       ["0001", "0002", "0008"],
//       lacksQuant,
//       remapItemAvailability(input)
//     )
//   ).toBe(false);
//   expect(
//     visitStores(
//       ["0001", "0002", "0008"],
//       hasQuantZeros,
//       remapItemAvailability(input)
//     )
//   ).toBe(true);
//   expect(
//     visitStores(
//       ["0001", "0002", "0008"],
//       lacksQuantOneItem,
//       remapItemAvailability(input)
//     )
//   ).toBe(false);
//   expect(
//     visitStores(
//       ["0001", "0002", "0008"],
//       hasQuantSav,
//       remapItemAvailability(input)
//     )
//   ).toBe(true);
//   expect(
//     visitStores(
//       ["0001", "0002", "0008"],
//       lacksQuantOffByOne,
//       remapItemAvailability(input)
//     )
//   ).toBe(true);
// });

test("A Stores preferred", () => {
  testQuantities = [
    { sku: "038177", name: "Titos Handmade Vodka (1L)", quantity: 1 },
    { sku: "089468", name: "Lunazul Tequila Reposado", quantity: 6 },
    { sku: "019067", name: "Jim Beam (1L)", quantity: 12 },
    { sku: "954782", name: "Templin Ferda DBL IPA", quantity: 96 },
  ];
  // '0015' is an A and '0025' is a B store.
  testStoreStock = {
    "038177": { name: "", quantity: 1, availability: { "0015": 1, "0025": 1 } },
    "089468": { name: "", quantity: 6, availability: { "0015": 6, "0025": 6 } },
    "019067": {
      name: "",
      quantity: 12,
      availability: { "0015": 12, "0025": 12 },
    },
    954782: {
      name: "",
      quantity: 96,
      availability: { "0015": 100, "0025": 100 },
    },
  };
  // The store preference list is
  // A stores, Pairs of 2 A stores, B stores, Pairs of 2 A+B, Pairs of 3 A+B
  const output = findBestRoute(testQuantities, testStoreStock);
  expect(output.topStores[0]).toStrictEqual("0015");
});

test("Checks A+B Stores", () => {
  testQuantities = [
    { sku: "038177", name: "Titos Handmade Vodka (1L)", quantity: 1 },
    { sku: "089468", name: "Lunazul Tequila Reposado", quantity: 6 },
    { sku: "019067", name: "Jim Beam (1L)", quantity: 12 },
    { sku: "954782", name: "Templin Ferda DBL IPA", quantity: 96 },
  ];
  // '0015' is an A and '0025' is a B store.
  // Here item 954782 can ONLY be found at store 25,
  // And 019067 can ONLY be found at store 15
  // so we need both stores to find all the inventory
  testStoreStock = {
    "038177": { name: "", quantity: 1, availability: { "0015": 1, "0025": 1 } },
    "089468": { name: "", quantity: 6, availability: { "0015": 6, "0025": 6 } },
    "019067": {
      name: "",
      quantity: 12,
      availability: { "0015": 12, "0025": 1 },
    },
    954782: {
      name: "",
      quantity: 96,
      availability: { "0015": 1, "0025": 100 },
    },
  };
  // The store preference list is
  // A stores, Pairs of 2 A stores, B stores, Pairs of 2 A+B, Pairs of 3 A+B
  const output = findBestRoute(testQuantities, testStoreStock);
  expect(output.topStores).toStrictEqual(["0015", "0025"]);
});

test("Checks C Stores", () => {
  testQuantities = [
    { sku: "038177", name: "Titos Handmade Vodka (1L)", quantity: 1 },
    { sku: "089468", name: "Lunazul Tequila Reposado", quantity: 6 },
    { sku: "019067", name: "Jim Beam (1L)", quantity: 12 },
    { sku: "954782", name: "Templin Ferda DBL IPA", quantity: 96 },
  ];
  // '0015' is an A and '0025' is a B store.
  // '0002' is a C store.
  // Only 0002 can fulfill the requirements here.
  testStoreStock = {
    "038177": {
      name: "",
      quantity: 1,
      availability: { "0015": 1, "0025": 1, "0002": 100 },
    },
    "089468": {
      name: "",
      quantity: 6,
      availability: { "0015": 6, "0025": 6, "0002": 100 },
    },
    "019067": {
      name: "",
      quantity: 12,
      availability: { "0015": 1, "0025": 1, "0002": 100 },
    },
    954782: {
      name: "",
      quantity: 96,
      availability: { "0015": 1, "0025": 1, "0002": 100 },
    },
  };
  // The store preference list is
  // A stores, Pairs of 2 A stores, B stores, Pairs of 2 A+B, Pairs of 3 A+B
  const output = findBestRoute(testQuantities, testStoreStock);
  expect(output.topStores[0]).toStrictEqual("0002");
});
