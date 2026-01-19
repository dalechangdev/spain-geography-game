# Spain Geography App - Implementation Guide

This guide provides step-by-step instructions to start building your Spain Geography Quiz App.

## Quick Start Checklist

### Phase 1: Setup & Dependencies (Day 1)

- [ ] Install required dependencies
- [ ] Configure React Native Maps in `app.json`
- [ ] Set up basic project structure
- [ ] Create initial map component

### Phase 2: Data Collection (Days 2-3)

- [ ] Download autonomous regions GeoJSON
- [ ] Download provinces GeoJSON
- [ ] Download major cities coordinates
- [ ] Download rivers GeoJSON
- [ ] Download mountains/peaks data
- [ ] Process and optimize all GeoJSON files

### Phase 3: Core Features (Days 4-7)

- [ ] Implement map view with basic overlays
- [ ] Create quiz state management
- [ ] Build question generation system
- [ ] Implement multiple choice quiz
- [ ] Implement point-and-identify quiz
- [ ] Add scoring system

### Phase 4: Polish & Testing (Days 8-10)

- [ ] Add progress tracking
- [ ] Implement study mode
- [ ] Add animations and feedback
- [ ] Test on devices
- [ ] Performance optimization

## Step 1: Install Dependencies

Run these commands in your project root:

```bash
npx expo install react-native-maps
npx expo install expo-location
npm install react-native-svg zustand @react-native-async-storage/async-storage
```

## Step 2: Configure Maps

Update your `app.json` to include maps configuration:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      [
        "react-native-maps",
        {
          "androidApiKey": "YOUR_GOOGLE_MAPS_API_KEY", // Optional for Android
          "iosApiKey": "YOUR_GOOGLE_MAPS_API_KEY"      // Optional for iOS
        }
      ]
    ]
  }
}
```

**Note**: Google Maps API keys are optional but recommended for better map quality. You can also use OpenStreetMap via Mapbox or other providers.

## Step 3: Create Basic Map Component

Create `components/map/MapView.tsx`:

```typescript
import React from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

const SPAIN_REGION: Region = {
  latitude: 40.4168,
  longitude: -3.7038,
  latitudeDelta: 8.0,
  longitudeDelta: 8.0,
};

export function SpainMapView() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={SPAIN_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Markers will go here */}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
```

## Step 4: Data Collection Priority

### Priority 1: Essential Data (Get these first)
1. **Autonomous Regions** - From GADM or mapSpain
   - 17 regions + 2 autonomous cities
   - Polygon boundaries as GeoJSON
   - Names in Spanish

2. **Provincial Capitals** - Coordinates only initially
   - 50 cities with [lon, lat] coordinates
   - Can start with hardcoded data

3. **Major Cities** - Top 20-30 cities
   - Coordinates from GeoNames or hardcoded

### Priority 2: Important Data
4. **Provinces** - Polygon boundaries
   - 50 provinces from GADM

5. **Major Rivers** - LineString features
   - Ebro, Tagus, Guadalquivir, Douro
   - From Natural Earth or OpenStreetMap

### Priority 3: Enhanced Features
6. **Mountain Ranges** - Polygon or simplified shapes
7. **Notable Peaks** - Points with elevation
8. **Lakes** - Polygon features
9. **Municipalities** - Large dataset, use simplified versions

## Step 5: Recommended Data Sources

### For Quick Start (Recommended Order):

1. **mapSpain** (R package) → Export to GeoJSON
   - URL: https://ropenspain.github.io/mapSpain/
   - Best for: Autonomous regions, provinces, municipalities
   - Format: Can export to GeoJSON via R

2. **es-atlas** (GitHub) → Ready GeoJSON/TopoJSON
   - URL: https://github.com/martgnz/es-atlas
   - Best for: Pre-processed Spanish geography data
   - License: CC-BY 4.0

3. **GeoNames API** → City coordinates
   - URL: http://www.geonames.org/
   - Best for: City locations, mountain peaks
   - Free tier available

4. **GADM** → Administrative boundaries
   - URL: https://gadm.org/download_country.html
   - Best for: High-quality administrative boundaries

### Data Processing Commands:

```bash
# If you have shapefiles, convert to GeoJSON
ogr2ogr -f GeoJSON autonomous-regions.json spain_regions.shp

# Simplify GeoJSON to reduce file size
mapshaper autonomous-regions.json -simplify 10% -o simplified.json

# Validate GeoJSON
geojsonhint autonomous-regions.json
```

## Step 6: Project Structure Setup

Create these directories:

```bash
mkdir -p components/map
mkdir -p components/quiz
mkdir -p components/ui
mkdir -p data/geojson
mkdir -p data/quiz-data
mkdir -p hooks
mkdir -p utils
mkdir -p app/(tabs)
```

## Step 7: Initial Data Files

Create `data/quiz-data/locations.ts` with a few hardcoded locations to start:

```typescript
import { Location } from '@/types/geography';

export const sampleLocations: Location[] = [
  {
    id: 'madrid',
    name: 'Madrid',
    nameEs: 'Madrid',
    type: 'city',
    coordinates: [-3.7038, 40.4168],
    region: 'madrid',
    metadata: { population: 3223334 },
  },
  // Add more...
];
```

## Step 8: Testing Your Setup

1. **Test Map Rendering**:
   - Run `npm start`
   - Check that map loads correctly
   - Verify you can pan and zoom

2. **Test Marker Rendering**:
   - Add a test marker to MapView
   - Verify it appears at correct location

3. **Test GeoJSON Overlay** (when ready):
   - Load a simple GeoJSON file
   - Render as polygon on map
   - Verify performance is acceptable

## Common Issues & Solutions

### Issue: Maps not loading on iOS
**Solution**: Ensure you've configured the maps plugin in `app.json` and run `npx expo prebuild` if using bare workflow.

### Issue: Maps not loading on Android
**Solution**: You may need to add a Google Maps API key in `app.json`. Alternatively, use a different map provider.

### Issue: GeoJSON files too large
**Solution**: 
- Simplify geometries using mapshaper
- Split into smaller files by region
- Lazy load based on zoom level

### Issue: Poor performance with many markers
**Solution**:
- Use clustering (react-native-maps supports clustering)
- Only show markers at appropriate zoom levels
- Optimize marker rendering with React.memo

## Next Steps

1. Start with the map component and verify it works
2. Add a few hardcoded locations for testing
3. Implement a simple multiple-choice quiz
4. Gradually add more data and features
5. Iterate based on testing

## Resources

- **React Native Maps Docs**: https://github.com/react-native-maps/react-native-maps
- **Expo Maps Guide**: https://docs.expo.dev/versions/latest/sdk/map-view/
- **GeoJSON Spec**: https://geojson.org/
- **mapSpain Tutorial**: https://ropenspain.github.io/mapSpain/articles/mapSpain.html
- **es-atlas**: https://github.com/martgnz/es-atlas

## Support

For questions about:
- **Expo**: Check Expo documentation and Discord
- **React Native Maps**: Check their GitHub issues
- **GeoJSON Data**: Refer to DATA_SOURCES.md
- **App Architecture**: Refer to APP_DESIGN.md
