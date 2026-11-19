export function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((latitude2 - latitude1) * Math.PI) / 180;
  const longitudeDelta = ((longitude2 - longitude1) * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function isPointInPolygon(
  latitude: number,
  longitude: number,
  geometry: unknown,
): boolean {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) return false;
  const coordinates = getPolygonCoordinates(geometry);
  if (!coordinates || coordinates.length === 0) return false;
  if (!pointInRing(latitude, longitude, coordinates[0])) return false;
  return !coordinates.slice(1).some((ring) => pointInRing(latitude, longitude, ring));
}

function getPolygonCoordinates(value: unknown): number[][][] | undefined {
  let coordinates = value;
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const geometry = value as Record<string, unknown>;
    if (geometry.type !== 'Polygon') return undefined;
    coordinates = geometry.coordinates;
  }
  if (!Array.isArray(coordinates)) return undefined;

  const rings: number[][][] = [];
  for (const ring of coordinates) {
    if (!Array.isArray(ring)) return undefined;
    const points: number[][] = [];
    for (const point of ring) {
      if (
        !Array.isArray(point) ||
        typeof point[0] !== 'number' ||
        typeof point[1] !== 'number'
      ) {
        return undefined;
      }
      points.push([point[0], point[1]]);
    }
    if (points.length < 3) return undefined;
    rings.push(points);
  }
  return rings;
}

function pointInRing(latitude: number, longitude: number, ring: number[][]): boolean {
  let isInside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [currentLongitude, currentLatitude] = ring[current];
    const [previousLongitude, previousLatitude] = ring[previous];
    if (pointOnSegment(
      longitude,
      latitude,
      previousLongitude,
      previousLatitude,
      currentLongitude,
      currentLatitude,
    )) return true;
    const crossesLatitude = (currentLatitude > latitude) !== (previousLatitude > latitude);
    if (
      crossesLatitude &&
      longitude <
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude
    ) {
      isInside = !isInside;
    }
  }
  return isInside;
}

function pointOnSegment(
  longitude: number,
  latitude: number,
  startLongitude: number,
  startLatitude: number,
  endLongitude: number,
  endLatitude: number,
): boolean {
  const cross =
    (longitude - startLongitude) * (endLatitude - startLatitude) -
    (latitude - startLatitude) * (endLongitude - startLongitude);
  if (Math.abs(cross) > 1e-10) return false;
  return (
    longitude >= Math.min(startLongitude, endLongitude) - 1e-10 &&
    longitude <= Math.max(startLongitude, endLongitude) + 1e-10 &&
    latitude >= Math.min(startLatitude, endLatitude) - 1e-10 &&
    latitude <= Math.max(startLatitude, endLatitude) + 1e-10
  );
}
