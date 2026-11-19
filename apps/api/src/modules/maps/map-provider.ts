export interface MapLocation {
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface MapRoute {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: Array<[number, number]>;
}

export interface MapProvider {
  geocode(query: string): Promise<MapLocation>;
  reverseGeocode(latitude: number, longitude: number): Promise<MapLocation>;
  route(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
  ): Promise<MapRoute>;
}

export const MAP_PROVIDER = Symbol('MAP_PROVIDER');
