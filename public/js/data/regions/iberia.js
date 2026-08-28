// Region-scoped data. Universal content (sun, moon, knots, distress) lives
// outside this directory, so adding a region is a new file rather than a
// refactor of the modules.

export const region = {
  id: "iberia",
  name: "Península Ibérica",

  // Magnetic declination varies across the peninsula and drifts year to year.
  // This is a single approximate figure for the whole region, good enough to
  // orient a walk and not good enough for surveying. Real values:
  // https://www.ncei.noaa.gov/products/world-magnetic-model
  magneticDeclination: {
    approxDegrees: -1, // negative = west
    note: "Aproximado para el conjunto de la península en 2026. Varía por provincia y cambia con los años.",
    source: "https://www.ncei.noaa.gov/products/world-magnetic-model",
  },

  emergencyNumber: "112",

  // Fauna and flora entries are deliberately absent until sourced. See
  // docs/azimut-design.md: this module is a reference, not an identifier,
  // and its content has to come from an authority rather than from memory.
  nature: [],
};
