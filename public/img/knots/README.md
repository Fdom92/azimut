# Knot illustrations

A knot diagram that is subtly wrong teaches the wrong knot, and reads as
authoritative while doing it — so these are sourced and checked by a person
rather than generated.

## What is here

Eight of the ten knots have a diagram, all from Wikimedia Commons, all
downloaded at reduced size and committed. Attribution lives in
`public/js/data/knots.js` and is rendered in the app under every figure.

| Knot | File | Licence | Author |
|---|---|---|---|
| Ballestrinque | `ballestrinque.jpg` | Public domain | Anon., *Encyclopædia Britannica* 1911 |
| Mariposa alpina | `mariposa.png` | Public domain | LadyofHats |
| Pescador doble | `pescador-doble.png` | Public domain | uncredited |
| Ocho de unión | `ocho-union.png` | CC0 | Jeroen van der Vegt |
| As de guía | `as-de-guia.png` | CC BY 3.0 | Lucasbosch |
| Prusik | `prusik.jpg` | Public domain | AnticheSere |
| Machard | `machard.jpg` | Public domain | Alan W. Grogono |
| Nudo dinámico | `dinamico.jpg` | Public domain | Mark in the wiki (de.wikipedia) |

`as-de-guia.png` is the only file carrying an attribution obligation. The app
credits it, with a link to the source, in the figure caption.

Two are still missing, and both were rejected rather than left unsearched:

- **Nudo de ocho.** Commons has `EB1911 - Knot - Fig. 2 - Figure-of-Eight`, but
  that is the figure-eight *stopper*. The card describes the figure-eight
  *loop* — the tie-in knot. Different knot, so it was not used. Everything else
  the search returned under that name was the mathematical figure-eight knot
  from knot theory, which is unrelated.
- **Nudo taz.** No candidate on Commons under any spelling tried.

## Requirements for a file to go in here

**Licence.** Prefer public domain or CC0. CC BY and CC BY-SA are usable but
BY-SA carries a share-alike obligation, so check it against the repo licence
before committing one. Do not use anything with an **ND** (NoDerivatives)
clause if the image needs cropping, recolouring or any other adaptation —
that is exactly what ND forbids.

**Attribution.** Every image records `file`, `title`, `author`, `license` and
`source` in `public/js/data/knots.js`. The test suite fails if an image is
added without all five, so the credit cannot be lost by accident.

**Bundled, not linked.** Commit the file here, and add it to `ASSETS` in
`public/sw.js` — a test checks that every declared image is precached, because
an image that is merely committed still fails in the place the module is for.

**Small.** Fetch through Commons' thumbnailer rather than downloading the
original: append `?width=400` to a `Special:FilePath` URL. Originals run to
megabytes; the whole app is a few hundred kilobytes. Line art belongs in PNG —
re-encoding these diagrams as JPEG made them *larger* as well as worse.

**Verified.** Set `reviewed: true` only after a person has confirmed the
diagram shows the knot it claims to show, and the steps match it. Every file
here is currently `reviewed: false` and the app says so on each card.

## Where to look

Wikimedia Commons has large, well-catalogued knot categories. Licences vary
per file, not per category — check each one individually. Its search is poor
for climbing terms: queries for specific knots return period books about
figure skating, and the knot-theory articles collide with the practical ones.
Browsing the categories works better than searching.

- https://commons.wikimedia.org/wiki/Category:Knots_by_name
- https://commons.wikimedia.org/wiki/Category:Knot_diagrams
