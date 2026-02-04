import { DEFAULT_ZOOM, SPAIN_CENTER } from "@/constants/map";
import {
    Camera,
    MapView as MLMapView,
    UserLocation,
    type CameraRef,
    type MapViewRef,
    type PressEvent,
} from "@maplibre/maplibre-react-native";
import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    NativeSyntheticEvent,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const MIN_ZOOM = 2;
const MAX_ZOOM = 18;

export interface SpainMapViewRef {
  resetToSpain: () => void;
  animateToCoordinate: (
    coordinate: { latitude: number; longitude: number },
    zoomLevel?: number,
  ) => void;
  getCurrentRegion: () => Region;
  zoomIn: () => void;
  zoomOut: () => void;
}

export interface SpainMapViewProps {
  /**
   * Initial region to display. Defaults to Spain region.
   */
  initialRegion?: Region;

  /**
   * Callback when user taps on the map
   */
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;

  /**
   * Callback when map region changes
   */
  onRegionChange?: (region: Region) => void;

  /**
   * Whether to show user location button
   */
  showUserLocation?: boolean;

  /**
   * Map style variant (standard uses OpenStreetMap)
   */
  mapType?: "standard" | "satellite" | "terrain" | "hybrid";

  /**
   * Whether map is interactive (can be disabled during quiz feedback)
   */
  interactive?: boolean;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom map style
   */
  style?: ViewStyle;

  /**
   * Children components (markers, layers, etc.)
   */
  children?: React.ReactNode;
}

// Free tile style URLs
const MAP_STYLES = {
  standard: "https://demotiles.maplibre.org/style.json", // MapLibre demo tiles
  // Alternative free options:
  // standard: 'https://tiles.openfreemap.org/styles/liberty', // OpenFreeMap
};

/**
 * Main map component for Spain geography quiz app
 *
 * Wraps MapLibre GL with Spain-specific defaults and helpers
 */
export const SpainMapView = forwardRef<SpainMapViewRef, SpainMapViewProps>(
  (
    {
      initialRegion,
      onMapPress,
      onRegionChange,
      showUserLocation = false,
      mapType = "standard",
      interactive = true,
      containerStyle,
      style,
      children,
    },
    ref,
  ) => {
    const mapRef = useRef<MapViewRef>(null);
    const cameraRef = useRef<CameraRef>(null);
    const [currentRegion] = useState<Region>({
      latitude: SPAIN_CENTER.latitude,
      longitude: SPAIN_CENTER.longitude,
      latitudeDelta: 8.0,
      longitudeDelta: 8.0,
    });

    const handlePress = (event: NativeSyntheticEvent<PressEvent>) => {
      if (!onMapPress || !interactive) return;

      const { latitude, longitude } = event.nativeEvent;
      onMapPress({ latitude, longitude });
    };

    const handleRegionDidChange = async () => {
      // MapLibre doesn't provide region directly, we track it via camera
      onRegionChange?.(currentRegion);
    };

    /**
     * Reset map to show all of Spain
     */
    const resetToSpain = () => {
      cameraRef.current?.flyTo({
        center: {
          longitude: SPAIN_CENTER.longitude,
          latitude: SPAIN_CENTER.latitude,
        },
        zoom: DEFAULT_ZOOM,
        duration: 1000,
      });
    };

    /**
     * Animate to a specific coordinate
     */
    const animateToCoordinate = (
      coordinate: { latitude: number; longitude: number },
      zoomLevel?: number,
    ) => {
      cameraRef.current?.flyTo({
        center: {
          longitude: coordinate.longitude,
          latitude: coordinate.latitude,
        },
        zoom: zoomLevel ?? 10,
        duration: 1000,
      });
    };

    const zoomIn = () => {
      mapRef.current?.getZoom().then((zoom) => {
        const nextZoom = Math.min(zoom + 1, MAX_ZOOM);
        if (nextZoom > zoom) {
          cameraRef.current?.zoomTo(nextZoom, { duration: 200 });
        }
      });
    };

    const zoomOut = () => {
      mapRef.current?.getZoom().then((zoom) => {
        const nextZoom = Math.max(zoom - 1, MIN_ZOOM);
        if (nextZoom < zoom) {
          cameraRef.current?.zoomTo(nextZoom, { duration: 200 });
        }
      });
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      resetToSpain,
      animateToCoordinate,
      getCurrentRegion: () => currentRegion,
      zoomIn,
      zoomOut,
    }));

    return (
      <View style={[styles.container, containerStyle]}>
        <MLMapView
          ref={mapRef}
          style={[styles.map, style]}
          mapStyle={MAP_STYLES.standard}
          onPress={handlePress}
          onRegionDidChange={handleRegionDidChange}
          dragPan={interactive}
          touchAndDoubleTapZoom={interactive}
          touchRotate={interactive}
          touchPitch={false}
          attribution={true}
          logo={false}
        >
          <Camera
            ref={cameraRef}
            longitude={SPAIN_CENTER.longitude}
            latitude={SPAIN_CENTER.latitude}
            zoom={DEFAULT_ZOOM}
          />

          {showUserLocation && <UserLocation visible={true} />}

          {children}
        </MLMapView>
      </View>
    );
  },
);

SpainMapView.displayName = "SpainMapView";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});

// Re-export MapLibre components for use in other components
export * from "@maplibre/maplibre-react-native";
