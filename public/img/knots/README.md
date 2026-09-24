# Knot illustrations

A knot diagram that is subtly wrong teaches the wrong knot, and reads as
authoritative while doing it — so these are sourced and checked by a person
rather than generated.

## What is here

All ten knots have a diagram, every one from Wikimedia Commons, downloaded at
reduced size and committed. Attribution lives in `public/js/data/knots.js` and
is rendered in the app under every figure, linking back to the source file.

| Knot | File | Licence | Author |
|---|---|---|---|
| Nudo de ocho | `ocho.jpg` | CC BY-SA 3.0 | Satsun (en.wikipedia) |
| Ballestrinque | `ballestrinque.jpg` | Public domain | Anon., *Encyclopædia Britannica* 1911 |
| Mariposa alpina | `mariposa.png` | Public domain | LadyofHats |
| Pescador doble | `pescador-doble.png` | Public domain | uncredited |
| Ocho de unión | `ocho-union.png` | CC0 | Jeroen van der Vegt |
| As de guía | `as-de-guia.png` | CC BY 3.0 | Lucasbosch |
| Prusik | `prusik.jpg` | Public domain | AnticheSere |
| Machard | `machard.jpg` | Public domain | Alan W. Grogono |
| Nudo dinámico | `dinamico.jpg` | Public domain | Mark in the wiki (de.wikipedia) |
| Nudo taz | `taz.jpg` | CC BY-SA 4.0 | Zaripov999 |

### On the three that carry obligations

`as-de-guia.png` (CC BY 3.0), `ocho.jpg` (CC BY-SA 3.0) and `taz.jpg`
(CC BY-SA 4.0) are the files with conditions attached. All three are credited
in the app with author, licence and a link to the source.

The share-alike clause on the last two does not reach the rest of the repo.
Bundling an unmodified image next to unrelated code is aggregation, not
adaptation: each image keeps its own CC BY-SA licence, the code stays MIT.
Resizing is the only change made to any of them, and a resized copy stays
under the same licence, which is what the table above records. Do not crop,
recolour or redraw these three without keeping the result CC BY-SA and saying
so here.

### Two that took a second search

**Nudo de ocho.** The first Commons hit, `EB1911 - Knot - Fig. 2 -
Figure-of-Eight`, is the figure-eight *stopper*; the card describes the
figure-eight *loop*, which is a different knot, so it was rejected. Searching
under that English name mostly returns the mathematical figure-eight knot from
knot theory, which is unrelated again. The file in use came from the Spanish
Wikipedia article instead.

**Nudo taz.** That name is largely Spanish. Everywhere else the knot is the
*mule knot*, and on a Munter it is the *Munter mule* — which is what the file
is called and why the first searches found nothing but pack mules.

## Requirements for a file to go in here

**Licence.** Prefer public domain or CC0. CC BY and CC BY-SA are usable but
BY-SA carries a share-alike obligation, so check it against the repo licence
before committing one, and record the conclusion above. Do not use anything
with an **ND** (NoDerivatives) clause if the image needs cropping, recolouring
or any other adaptation — that is exactly what ND forbids.

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
diagram shows the knot it claims to show, and the steps match it.

## Where to look

Wikimedia Commons has large, well-catalogued knot categories. Licences vary
per file, not per category — check each one individually. Its search is poor
for climbing terms: queries for specific knots return period books about
figure skating, and the knot-theory articles collide with the practical ones.
Browsing the categories works better, and so does starting from the Wikipedia
article in any language and following its images back to Commons — that is
how two of these were found after direct search failed.

- https://commons.wikimedia.org/wiki/Category:Knots_by_name
- https://commons.wikimedia.org/wiki/Category:Knot_diagrams
