import { DEFAULT_ZOOM, SPAIN_CENTER } from "@/constants/map";
import {
    Camera,
    MapView as MLMapView,
    UserLocation,
    type CameraRef,
    type MapViewRef,
    type PressEvent,
    type ViewStateChangeEvent,
} from "@maplibre/maplibre-react-native";
import React, {
    forwardRef,
    useEffect,
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
    const styleCacheRef = useRef<Record<string, Record<string, unknown>>>({});
    const [styleNoLabels, setStyleNoLabels] = useState<Record<
      string,
      unknown
    > | null>(null);

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

    const handlePress = (event: NativeSyntheticEvent<PressEvent>) => {
      if (!onMapPress || !interactive) return;

      const { latitude, longitude } = event.nativeEvent;
      onMapPress({ latitude, longitude });
    };

    const handleRegionDidChange = (
      event: NativeSyntheticEvent<ViewStateChangeEvent>,
    ) => {
      const { latitude, longitude, zoom, bounds } = event.nativeEvent;
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
