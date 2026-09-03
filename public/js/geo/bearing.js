// Great-circle distance and bearing between two points.
//
// This is what answers the question someone actually has when they are lost,
// which is not "where am I" but "how do I get back". A bearing and a distance
// need no map and no network: the phone knows where it is from GPS, you told
// it where the car was, and the compass module already knows how to make you
// walk a bearing.

const EARTH_RADIUS_M = 6371008.8; // IUGG mean radius

const rad = Math.PI / 180;
const deg = 180 / Math.PI;

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

// Haversine. Accurate to a few metres over the distances anyone walks, and it
// stays well conditioned for the short ones, which is where the simpler
// spherical law of cosines loses precision.
export function distanceMetres(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const dPhi = (lat2 - lat1) * rad;
  const dLambda = (lon2 - lon1) * rad;

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// The bearing to set off on. It is not constant along a great circle — walk
// far enough and it drifts — but over the distances this app deals with the
// change is negligible, and the initial bearing is the one you steer.
export function initialBearing(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const dLambda = (lon2 - lon1) * rad;

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

  return normalizeDegrees(Math.atan2(y, x) * deg);
}

// Where you end up walking a bearing for a distance. Not used by the panel —
// it exists so the tests can go out and come back, which checks distance and
// bearing against each other rather than against numbers I typed in.
export function destinationPoint(lat, lon, bearing, metres) {
  const delta = metres / EARTH_RADIUS_M;
  const theta = bearing * rad;
  const phi1 = lat * rad;
  const lambda1 = lon * rad;

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
      Math.cos(phi1) * Math.sin(delta) * Math.cos(theta)
  );
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
    );

  return {
    latitude: phi2 * deg,
    // Keep longitude in -180..180 rather than letting it run away.
    longitude: normalizeDegrees(lambda2 * deg + 180) - 180,
  };
}

// The bearing you would walk to come back.
export function reciprocal(bearing) {
  return normalizeDegrees(bearing + 180);
}

export function formatDistance(metres) {
  if (metres < 1000) return `${Math.round(metres)} m`;
  if (metres < 10000) return `${(metres / 1000).toFixed(2)} km`;
  return `${(metres / 1000).toFixed(1)} km`;
}
