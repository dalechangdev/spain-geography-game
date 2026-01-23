import React from 'react';
import { ShapeSource, FillLayer, LineLayer } from '@maplibre/maplibre-react-native';
import { FeatureCollection } from 'geojson';

export interface MapLayerProps {
  /**
   * Unique ID for this layer
   */
  id: string;
  
  /**
   * GeoJSON feature collection
   */
  geojson: FeatureCollection;
  
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
  onFeaturePress?: (featureId: string, feature: GeoJSON.Feature) => void;
}

/**
 * Renders GeoJSON features as map overlays using MapLibre
 * 
 * Supports:
 * - Polygon features (regions, municipalities, lakes)
 * - LineString features (rivers, roads)
 * - Point features (cities, peaks) - use QuizMarker instead
 */
export function MapLayers({
  id,
  geojson,
  fillColor = 'rgba(100, 150, 255, 0.3)',
  strokeColor = 'rgba(100, 150, 255, 0.8)',
  strokeWidth = 2,
  fillOpacity = 0.3,
  onFeaturePress,
}: MapLayerProps) {
  if (!geojson || geojson.type !== 'FeatureCollection') {
    return null;
  }

  // Separate features by geometry type
  const polygonFeatures: FeatureCollection = {
    type: 'FeatureCollection',
    features: geojson.features.filter(
      (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
    ),
  };

  const lineFeatures: FeatureCollection = {
    type: 'FeatureCollection',
    features: geojson.features.filter(
      (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
    ),
  };

  return (
    <>
      {/* Polygon fill layer */}
      {polygonFeatures.features.length > 0 && (
        <ShapeSource
          id={`${id}-polygon-source`}
          shape={polygonFeatures}
          onPress={(e) => {
            if (onFeaturePress && e.features?.[0]) {
              const feature = e.features[0];
              const featureId = feature.id?.toString() || feature.properties?.id || 'unknown';
              onFeaturePress(featureId, feature as GeoJSON.Feature);
            }
          }}
        >
          <FillLayer
            id={`${id}-fill`}
            style={{
              fillColor: fillColor,
              fillOpacity: fillOpacity,
            }}
          />
          <LineLayer
            id={`${id}-outline`}
            style={{
              lineColor: strokeColor,
              lineWidth: strokeWidth,
            }}
          />
        </ShapeSource>
      )}

      {/* Line layer */}
      {lineFeatures.features.length > 0 && (
        <ShapeSource
          id={`${id}-line-source`}
          shape={lineFeatures}
          onPress={(e) => {
            if (onFeaturePress && e.features?.[0]) {
              const feature = e.features[0];
              const featureId = feature.id?.toString() || feature.properties?.id || 'unknown';
              onFeaturePress(featureId, feature as GeoJSON.Feature);
            }
          }}
        >
          <LineLayer
            id={`${id}-line`}
            style={{
              lineColor: strokeColor,
              lineWidth: strokeWidth,
            }}
          />
        </ShapeSource>
      )}
    </>
  );
}
