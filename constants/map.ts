/**
 * Map constants for Spain geography app
 */

/**
 * Spain's approximate geographic bounds
 */
export const SPAIN_BOUNDS = {
  north: 44.0,
  south: 36.0,
  east: 4.5,
  west: -9.5,
};

/**
 * Center of Spain (Madrid area)
 */
export const SPAIN_CENTER = {
  latitude: 40.4168,
  longitude: -3.7038,
};

/**
 * Default zoom level to show all of Spain
 */
export const DEFAULT_ZOOM = 5;

/**
 * Zoom levels for different geographic features
 */
export const ZOOM_LEVELS = {
  country: 6, // Show all of Spain
  region: 7, // Focus on autonomous community level
  province: 8, // Focus on province level
  city: 10, // Focus on city level
  detail: 12, // Detailed view for municipalities
} as const;

/**
 * Distance tolerances for answer validation (in meters)
 */
export const TOLERANCES = {
  region: 100000, // 100km for regions
  province: 75000, // 75km for provinces
  city: 50000, // 50km for cities
  municipality: 25000, // 25km for municipalities
  river: 10000, // 10km for rivers (line features)
  mountain: 5000, // 5km for mountains (point features)
  lake: 30000, // 30km for lakes (polygon features)
} as const;

/**
 * Map style presets
 */
export const MAP_STYLES = {
  standard: undefined, // Default map style
  satellite: 'satellite',
  terrain: 'terrain',
  hybrid: 'hybrid',
} as const;
