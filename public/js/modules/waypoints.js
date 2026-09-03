import {
  distanceMetres,
  initialBearing,
  formatDistance,
} from "../geo/bearing.js";
import { compassPoint } from "./sunMoon.js";

// Saved points, seen from wherever you are standing.
//
// These reuse the same store the sun panel already saves places into, because
// a saved place is a saved place: somewhere you look up sunset for and
// somewhere you walk back to are the same record, and splitting them would
// mean saving the camp twice.

export function describe(waypoint, from) {
  if (!from) {
    return { ...waypoint, distance: null, bearing: null };
  }

  const metres = distanceMetres(from.lat, from.lon, waypoint.lat, waypoint.lon);
  const bearing = initialBearing(from.lat, from.lon, waypoint.lat, waypoint.lon);

  return {
    ...waypoint,
    distance: metres,
    distanceText: formatDistance(metres),
    bearing,
    compass: compassPoint(bearing),
    // Below a few metres the bearing is noise: GPS scatter alone will swing it
    // through every point of the compass, so pointing somewhere is worse than
    // saying you have arrived.
    arrived: metres < 15,
  };
}

// Nearest first: when several points are saved, the useful one is almost
// always the closest.
export function sortedByDistance(waypoints, from) {
  const described = waypoints.map((waypoint) => describe(waypoint, from));
  if (!from) return described;
  return described.sort((a, b) => a.distance - b.distance);
}
