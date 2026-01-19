# Map Components

This directory contains map-related components for the Spain Geography Quiz App.

## Components

### `MapView.tsx` - Main Map Component
The primary map component that wraps `react-native-maps` with Spain-specific defaults.

**Features:**
- Pre-configured with Spain's bounds
- Tap to get coordinates
- Reset to Spain view
- Animate to coordinates
- Configurable map types (standard, satellite, terrain, hybrid)
- Interactive/non-interactive modes

**Usage:**
```tsx
import { SpainMapView } from '@/components/map';

<SpainMapView
  onMapPress={(coordinate) => console.log(coordinate)}
  showUserLocation={false}
  mapType="standard"
/>
```

### `QuizMarker.tsx` - Location Markers
Markers for displaying quiz locations with visual feedback.

**Features:**
- Color-coded pins (red/green/blue/purple)
- Shows correct/incorrect answers
- Optional title display

**Usage:**
```tsx
import { QuizMarker } from '@/components/map';

<QuizMarker
  location={location}
  isCorrect={true}
  isUserAnswer={false}
  showTitle={true}
/>
```

### `MapLayers.tsx` - GeoJSON Overlays
Renders GeoJSON features (polygons, lines) as map overlays.

**Features:**
- Supports Polygon, MultiPolygon, LineString, MultiLineString
- Customizable colors and opacity
- Tap callbacks for features

**Usage:**
```tsx
import { MapLayers } from '@/components/map';

<MapLayers
  geojson={regionsGeoJSON}
  fillColor="rgba(100, 150, 255, 0.2)"
  strokeColor="rgba(100, 150, 255, 0.8)"
  onFeaturePress={(id, feature) => console.log(feature)}
/>
```

### `MapControls.tsx` - Control Buttons
Floating control buttons for map navigation.

**Features:**
- Reset to Spain view
- Zoom in/out
- Customizable visibility

**Usage:**
```tsx
import { MapControls } from '@/components/map';

<MapControls
  onReset={() => mapRef.current?.resetToSpain()}
  onZoomIn={() => {}}
  onZoomOut={() => {}}
/>
```

## Setup

Before using these components, install the required dependency:

```bash
npx expo install react-native-maps
```

For iOS, you may also need to configure the maps plugin in `app.json` (optional for better map quality).

## Notes

- These components use `react-native-maps` which requires native modules
- On iOS, you may need to run `npx expo prebuild` if using a development build
- Google Maps API keys are optional but recommended for production
