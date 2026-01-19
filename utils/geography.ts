/**
 * Geography utility functions
 */

import { Location } from '@/types/geography';
import { TOLERANCES } from '@/constants/map';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  point1: [number, number], // [longitude, latitude]
  point2: [number, number]  // [longitude, latitude]
): number {
  const R = 6371000; // Earth's radius in meters
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate if a user's point answer is within tolerance of correct location
 */
export function validatePointAnswer(
  userPoint: [number, number], // [longitude, latitude]
  correctLocation: Location,
  tolerance?: number
): boolean {
  const defaultTolerance = getDefaultTolerance(correctLocation.type);
  const distance = calculateDistance(userPoint, correctLocation.coordinates);
  return distance <= (tolerance || defaultTolerance);
}

/**
 * Get default tolerance for a location type
 */
export function getDefaultTolerance(locationType: Location['type']): number {
  switch (locationType) {
    case 'region':
      return TOLERANCES.region;
    case 'province':
      return TOLERANCES.province;
    case 'city':
      return TOLERANCES.city;
    case 'municipality':
      return TOLERANCES.municipality;
    case 'river':
      return TOLERANCES.river;
    case 'mountain':
    case 'mountain-range':
      return TOLERANCES.mountain;
    case 'lake':
      return TOLERANCES.lake;
    default:
      return TOLERANCES.city;
  }
}

/**
 * Check if a point is within Spain's bounds
 */
export function isWithinSpainBounds(
  point: [number, number] // [longitude, latitude]
): boolean {
  const [longitude, latitude] = point;
  return (
    latitude >= 36.0 &&
    latitude <= 44.0 &&
    longitude >= -9.5 &&
    longitude <= 4.5
  );
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
