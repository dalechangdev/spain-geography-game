import React from 'react';
import { Polygon, Polyline, Circle } from 'react-native-maps';
import { GeoJSON as GeoJSONType } from 'geojson';

export interface MapLayerProps {
  /**
   * GeoJSON feature collection
   */
  geojson: GeoJSONType;
  
  /**
   * Fill color for polygons
   */
  fillColor?: string;
  
  /**
   * Stroke color for polygons and lines
   */
  strokeColor?: string;
  
  /**
   * Stroke width
   */
  strokeWidth?: number;
  
  /**
   * Fill opacity (0-1)
   */
  fillOpacity?: number;
  
  /**
   * Callback when a feature is pressed
   */
  onFeaturePress?: (featureId: string, feature: GeoJSONType.Feature) => void;
}

/**
 * Renders GeoJSON features as map overlays
 * 
 * Supports:
 * - Polygon features (regions, municipalities, lakes)
 * - LineString features (rivers, roads)
 * - Point features (cities, peaks) - use QuizMarker instead
 */
export function MapLayers({
  geojson,
  fillColor = 'rgba(100, 150, 255, 0.2)',
  strokeColor = 'rgba(100, 150, 255, 0.8)',
  strokeWidth = 2,
  fillOpacity = 0.3,
  onFeaturePress,
}: MapLayerProps) {
  if (!geojson || geojson.type !== 'FeatureCollection') {
    return null;
  }

  return (
    <>
      {geojson.features.map((feature, index) => {
        const geometry = feature.geometry;
        const featureId = feature.id || `feature-${index}`;

        // Handle Polygon features
        if (geometry.type === 'Polygon') {
          const coordinates = geometry.coordinates[0].map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));

          return (
            <Polygon
              key={featureId}
              coordinates={coordinates}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              tappable={!!onFeaturePress}
              onPress={() => onFeaturePress?.(featureId.toString(), feature)}
            />
          );
        }

        // Handle MultiPolygon features
        if (geometry.type === 'MultiPolygon') {
          return (
            <React.Fragment key={featureId}>
              {geometry.coordinates.map((polygon, polyIndex) => {
                const coords = polygon[0].map(([lng, lat]) => ({
                  latitude: lat,
                  longitude: lng,
                }));

                return (
                  <Polygon
                    key={`${featureId}-${polyIndex}`}
                    coordinates={coords}
                    fillColor={fillColor}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    tappable={!!onFeaturePress}
                    onPress={() => onFeaturePress?.(featureId.toString(), feature)}
                  />
                );
              })}
            </React.Fragment>
          );
        }

        // Handle LineString features (rivers, roads)
        if (geometry.type === 'LineString') {
          const coordinates = geometry.coordinates.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));

          return (
            <Polyline
              key={featureId}
              coordinates={coordinates}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              tappable={!!onFeaturePress}
              onPress={() => onFeaturePress?.(featureId.toString(), feature)}
            />
          );
        }

        // Handle MultiLineString features
        if (geometry.type === 'MultiLineString') {
          return (
            <React.Fragment key={featureId}>
              {geometry.coordinates.map((line, lineIndex) => {
                const coords = line.map(([lng, lat]) => ({
                  latitude: lat,
                  longitude: lng,
                }));

                return (
                  <Polyline
                    key={`${featureId}-${lineIndex}`}
                    coordinates={coords}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    tappable={!!onFeaturePress}
                    onPress={() => onFeaturePress?.(featureId.toString(), feature)}
                  />
                );
              })}
            </React.Fragment>
          );
        }

        // Point features should use QuizMarker component instead
        return null;
      })}
    </>
  );
}
