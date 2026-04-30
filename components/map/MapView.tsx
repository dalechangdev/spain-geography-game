import { DEFAULT_ZOOM, SPAIN_CENTER } from "@/constants/map";
import spainAdminData from "@/data/spain-administrative-0.json";
import spainAdminData1 from "@/data/spain-administrative-1.json";
import spainAdminData2 from "@/data/spain-administrative-2.json";
import spainAdminData3 from "@/data/spain-administrative-3.json";
import spainAdminData4 from "@/data/spain-administrative-4.json";
import {
    Camera,
    FillLayer,
    LineLayer,
    MapView as MLMapView,
    ShapeSource,
    UserLocation,
    type CameraRef,
    type MapViewRef,
    type PressEvent,
    type ViewStateChangeEvent,
} from "@maplibre/maplibre-react-native";
import type { Feature } from "geojson";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    Animated,
    Easing,
    NativeSyntheticEvent,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

const RIPPLE_DIAMETER = 72;

function PressRipple({ x, y }: { x: number; y: number }) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 360,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          left: x - RIPPLE_DIAMETER / 2,
          top: y - RIPPLE_DIAMETER / 2,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

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
  clearSelection: () => void;
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
   * Callback when user taps a geographic feature on the map.
   * Called with null when a feature is deselected or admin level changes.
   */
  onFeaturePress?: (properties: Record<string, any> | null) => void;

  /**
   * Children components (markers, layers, etc.)
   */
  children?: React.ReactNode;
}

// ICGC (Institut Cartogràfic i Geològic de Catalunya) style URLs – same as MapICGC GL JS
// https://github.com/OpenICGC/mapicgc-gl-js – use style URLs with MapLibre (no web library in RN)
const ICGC_STYLES = {
  standard: "https://geoserveis.icgc.cat/styles/icgc_mapa_base_topografic.json",
  satellite: "https://geoserveis.icgc.cat/styles/icgc_orto_estandard.json",
  hybrid: "https://geoserveis.icgc.cat/styles/icgc_orto_hibrida.json",
  terrain: "https://geoserveis.icgc.cat/styles/icgc_mapa_base_topografic.json",
} as const;

const BOUNDARY_LAYER_PATTERNS = [
  "admin",
  "boundary",
  "border",
  "limit",
  "frontier",
  "frontera",
  "administratiu",
  "administratius",
  "limits",
  "perimetre",
  "country",
  "state",
  "region",
  "comarca",
];

function isBoundaryLayer(layer: {
  id?: string;
  type?: string;
  "source-layer"?: string;
}): boolean {
  const id = (layer.id ?? "").toLowerCase();
  const sourceLayer = (layer["source-layer"] ?? "").toLowerCase();
  const combined = `${id} ${sourceLayer}`;
  return BOUNDARY_LAYER_PATTERNS.some((p) => combined.includes(p));
}

const ROAD_LAYER_PATTERNS = [
  "road",
  "highway",
  "street",
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "path",
  "via",
  "carretera",
  "carrer",
  "xarxa",
  "viaria",
  "transport",
];

function isRoadLayer(layer: {
  id?: string;
  type?: string;
  "source-layer"?: string;
}): boolean {
  const id = (layer.id ?? "").toLowerCase();
  const sourceLayer = (layer["source-layer"] ?? "").toLowerCase();
  const combined = `${id} ${sourceLayer}`;
  return ROAD_LAYER_PATTERNS.some((p) => combined.includes(p));
}

function getAdminLevelForZoom(zoom: number): number {
  if (zoom < 3) return 0;
  if (zoom < 5) return 1;
  if (zoom < 7) return 2;
  if (zoom < 9) return 3;
  return 4;
}

function getFeatureGid(properties: Record<string, any>): string | null {
  return (
    properties.GID_4 ??
    properties.GID_3 ??
    properties.GID_2 ??
    properties.GID_1 ??
    properties.GID_0 ??
    null
  );
}

/** Fetches a MapLibre style and returns a copy with symbol (label), boundary, and road layers removed. */
async function fetchStyleNoLabels(
  styleUrl: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(styleUrl);
  if (!res.ok) throw new Error(`Style fetch failed: ${res.status}`);
  const style = (await res.json()) as Record<string, unknown>;
  const base = styleUrl.replace(/[^/]+$/, "");
  const resolve = (v: string) =>
    v.startsWith("http") ? v : new URL(v, base).href;

  if (style.sprite && typeof style.sprite === "string") {
    style.sprite = resolve(style.sprite);
  }
  if (style.glyphs && typeof style.glyphs === "string") {
    style.glyphs = resolve(style.glyphs);
  }

  const layers =
    (style.layers as {
      type?: string;
      id?: string;
      "source-layer"?: string;
    }[]) ?? [];
  style.layers = layers.filter(
    (layer) =>
      layer.type !== "symbol" && !isBoundaryLayer(layer) && !isRoadLayer(layer),
  );
  return style;
}

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
      onFeaturePress,
      children,
    },
    ref,
  ) => {
    const mapRef = useRef<MapViewRef>(null);
    const cameraRef = useRef<CameraRef>(null);
    const [currentRegion, setCurrentRegion] = useState<Region>({
      latitude: SPAIN_CENTER.latitude,
      longitude: SPAIN_CENTER.longitude,
      latitudeDelta: 8.0,
      longitudeDelta: 8.0,
    });
    const zoomRef = useRef(DEFAULT_ZOOM);
    const lastAdminLevelRef = useRef(getAdminLevelForZoom(DEFAULT_ZOOM));
    const styleCacheRef = useRef<Record<string, Record<string, unknown>>>({});
    const [styleNoLabels, setStyleNoLabels] = useState<Record<
      string,
      unknown
    > | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

    const styleUrl = ICGC_STYLES[mapType];
    useEffect(() => {
      const cached = styleCacheRef.current[styleUrl];
      if (cached) {
        setStyleNoLabels(cached);
        return;
      }
      let cancelled = false;
      fetchStyleNoLabels(styleUrl)
        .then((style) => {
          if (!cancelled) {
            styleCacheRef.current[styleUrl] = style;
            setStyleNoLabels(style);
          }
        })
        .catch(() => {
          if (!cancelled) setStyleNoLabels(null);
        });
      return () => {
        cancelled = true;
      };
    }, [styleUrl]);

    const handlePress = async (event: NativeSyntheticEvent<PressEvent>) => {
      if (!interactive) return;

      const { latitude, longitude, locationX, locationY } = event.nativeEvent;

      setRipple({ x: locationX, y: locationY, key: Date.now() });
      setTimeout(() => setRipple(null), 500);

      onMapPress?.({ latitude, longitude });

      if (!onFeaturePress) return;
      const result = await mapRef.current?.queryRenderedFeatures(
        { longitude, latitude },
        { layers: ["spain-admin-fill"] },
      );
      const features = result?.features ?? [];
      if (features.length === 0) {
        setSelectedFeature(null);
        onFeaturePress(null);
        return;
      }
      const feature = features[0] as Feature;
      const gid = getFeatureGid(feature.properties ?? {});
      const currentGid = selectedFeature
        ? getFeatureGid(selectedFeature.properties ?? {})
        : null;
      if (gid && gid === currentGid) {
        setSelectedFeature(null);
        onFeaturePress(null);
      } else {
        setSelectedFeature(feature);
        onFeaturePress(feature.properties ?? {});
      }
    };

    const handleRegionDidChange = (
      event: NativeSyntheticEvent<ViewStateChangeEvent>,
    ) => {
      const { latitude, longitude, zoom, bounds } = event.nativeEvent;
      const newAdminLevel = getAdminLevelForZoom(zoom);
      if (newAdminLevel !== lastAdminLevelRef.current) {
        lastAdminLevelRef.current = newAdminLevel;
        setSelectedFeature(null);
        onFeaturePress?.(null);
      }
      zoomRef.current = zoom;
      const [west, south, east, north] = bounds;
      setCurrentRegion({
        latitude,
        longitude,
        latitudeDelta: north - south,
        longitudeDelta: east - west,
      });
      onRegionChange?.({
        latitude,
        longitude,
        latitudeDelta: north - south,
        longitudeDelta: east - west,
      });
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
      const zoom = zoomRef.current;
      const nextZoom = Math.min(zoom + 1, MAX_ZOOM);
      if (nextZoom > zoom) {
        cameraRef.current?.zoomTo(nextZoom, { duration: 200 });
      }
    };

    const zoomOut = () => {
      const zoom = zoomRef.current;
      const nextZoom = Math.max(zoom - 1, MIN_ZOOM);
      if (nextZoom < zoom) {
        cameraRef.current?.zoomTo(nextZoom, { duration: 200 });
      }
    };

    const getAdminDataForZoom = (zoom: number) => {
      if (zoom < 3) return spainAdminData;
      if (zoom < 5) return spainAdminData1;
      if (zoom < 7) return spainAdminData2;
      if (zoom < 9) return spainAdminData3;
      return spainAdminData4;
    };

    const clearSelection = () => {
      setSelectedFeature(null);
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      resetToSpain,
      animateToCoordinate,
      getCurrentRegion: () => currentRegion,
      zoomIn,
      zoomOut,
      clearSelection,
    }));

    return (
      <View style={[styles.container, containerStyle]}>
        <MLMapView
          ref={mapRef}
          style={[styles.map, style]}
          mapStyle={(styleNoLabels ?? styleUrl) as string | object}
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

          <ShapeSource
            id="spain-admin"
            shape={getAdminDataForZoom(zoomRef.current) as any}
          >
            <FillLayer
              id="spain-admin-fill"
              style={{ fillColor: "#088", fillOpacity: 0.1 }}
            />
          </ShapeSource>

          {selectedFeature && (
            <ShapeSource id="selected-feature" shape={selectedFeature as any}>
              <FillLayer
                id="selected-feature-fill"
                style={{ fillColor: "#1E40AF", fillOpacity: 0.35 }}
              />
              <LineLayer
                id="selected-feature-outline"
                style={{ lineColor: "#1E40AF", lineWidth: 2 }}
              />
            </ShapeSource>
          )}

          {showUserLocation && <UserLocation visible={true} />}

          {children}
        </MLMapView>

        {ripple && <PressRipple key={ripple.key} x={ripple.x} y={ripple.y} />}
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
  ripple: {
    position: "absolute",
    width: RIPPLE_DIAMETER,
    height: RIPPLE_DIAMETER,
    borderRadius: RIPPLE_DIAMETER / 2,
    backgroundColor: "#1E40AF",
    pointerEvents: "none",
  },
});

// Re-export MapLibre components for use in other components
export * from "@maplibre/maplibre-react-native";
