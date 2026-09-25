// Spanish names for the stars the chart labels.
//
// Positions and names in stars.js come from the Yale catalogue, which is in
// English. Everything the user reads in this app is in Spanish, including the
// constellation stories, which talk about Arturo and Régulo and Sirio — while
// the chart beside them said Arcturus, Regulus and Sirius. Same stars, two
// languages, one screen.
//
// Only the difference is recorded. A star whose name is the same in both —
// Vega, Rigel, Deneb, Altair, Capella, Antares — is absent on purpose, so this
// file stays a list of exceptions rather than a second catalogue to keep in
// step with the first.

const SPANISH = {
  Sirius: "Sirio",
  Canopus: "Canopo",
  Arcturus: "Arturo",
  // Better known here by its system than by the traditional name.
  "Rigil Kentaurus": "Alfa Centauri",
  Procyon: "Proción",
  Aldebaran: "Aldebarán",
  Spica: "Espiga",
  Pollux: "Pólux",
  Regulus: "Régulo",
  Castor: "Cástor",
  Bellatrix: "Bellatrix",
  Polaris: "Polar",
};

export function spanishStarName(name) {
  return SPANISH[name] ?? name;
}

export const TRANSLATED = SPANISH;
