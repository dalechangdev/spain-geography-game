/**
 * Map components for Spain Geography Quiz App
 */

export { SpainMapView } from './MapView';
export type { SpainMapViewProps, SpainMapViewRef, Region } from './MapView';

// Re-export MapLibre components for convenience
export * from '@maplibre/maplibre-react-native';

export { QuizMarker } from './QuizMarker';
export type { QuizMarkerProps, MarkerColor } from './QuizMarker';

export { MapLayers } from './MapLayers';
export type { MapLayerProps } from './MapLayers';

export { MapControls } from './MapControls';
export type { MapControlsProps } from './MapControls';
