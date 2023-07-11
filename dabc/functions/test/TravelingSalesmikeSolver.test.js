/* eslint-disable quote-props */
const {
  findBestRoute,
  remapItemAvailability,
  visitStores,
} = require("../TravelingSalesmikeSolver");

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

test("correctly determins if stores contain all needed items", () => {
  const input = {
    "069420": {
      name: "Sav",
      qty: 36,
      availability: {
        "0001": "42",
        "0002": "47",
      },
    },
    777999: {
      name: "Rioja",
      qty: 20,
      availability: {
        "0002": "20",
        "0008": "18",
      },
    },
    "000666": {
      name: "Wine",
      qty: 10,
      availability: {
        "0001": "12",
        "0002": "4",
      },
    },
  };
  const hasQuant = [
    { name: "Sav", sku: "069420", qty: 1 },
    { name: "Rioja", sku: 777999, qty: 1 },
    { name: "Wine", sku: "000666", qty: 1 },
  ];
  const hasQuantZeros = [
    { name: "Sav", sku: "069420", qty: 0 },
    { name: "Rioja", sku: 777999, qty: 0 },
    { name: "Wine", sku: "000666", qty: 0 },
  ];
  const hasQuantSav = [
    { name: "Sav", sku: "069420", qty: 43 },
    { name: "Rioja", sku: 777999, qty: 1 },
    { name: "Wine", sku: "000666", qty: 1 },
  ];
  const lacksQuant = [
    { name: "Sav", sku: "069420", qty: 1000 },
    { name: "Rioja", sku: 777999, qty: 1000 },
    { name: "Wine", sku: "000666", qty: 1000 },
  ];
  const lacksQuantOneItem = [
    { name: "Sav", sku: "069420", qty: 1 },
    { name: "Rioja", sku: 777999, qty: 1 },
    { name: "Wine", sku: "000666", qty: 1000 },
  ];
  const lacksQuantOffByOne = [
    { name: "Sav", sku: "069420", qty: 48 },
    { name: "Rioja", sku: 777999, qty: 1 },
    { name: "Wine", sku: "000666", qty: 1 },
  ];
  expect(
    visitStores(
      ["0001", "0002", "0008"],
      hasQuant,
      remapItemAvailability(input)
    )
  ).toBe(true);
  expect(
    visitStores(
      ["0001", "0002", "0008"],
      lacksQuant,
      remapItemAvailability(input)
    )
  ).toBe(false);
  expect(
    visitStores(
      ["0001", "0002", "0008"],
      hasQuantZeros,
      remapItemAvailability(input)
    )
  ).toBe(true);
  expect(
    visitStores(
      ["0001", "0002", "0008"],
      lacksQuantOneItem,
      remapItemAvailability(input)
    )
  ).toBe(false);
  expect(
    visitStores(
      ["0001", "0002", "0008"],
      hasQuantSav,
      remapItemAvailability(input)
    )
  ).toBe(true);
  expect(
    visitStores(
      ["0001", "0002", "0008"],
      lacksQuantOffByOne,
      remapItemAvailability(input)
    )
  ).toBe(false);
});
