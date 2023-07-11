const {
  findBestRoute,
  remapItemAvailability,
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
    "0008": { 4: 24 },
  };
  expect(remapItemAvailability(input)).toBe(expected);
});
