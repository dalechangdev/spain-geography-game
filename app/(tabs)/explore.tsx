import { FeatureDetailPanel } from "@/components/FeatureDetailPanel";
import {
    MapControls,
    SpainMapView,
    type SpainMapViewRef,
} from "@/components/map";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const mapRef = useRef<SpainMapViewRef>(null);
  const [selectedProperties, setSelectedProperties] = useState<Record<
    string,
    any
  > | null>(null);

  const handleDismiss = () => {
    setSelectedProperties(null);
    mapRef.current?.clearSelection();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        <SpainMapView
          ref={mapRef}
          onFeaturePress={setSelectedProperties}
          showUserLocation={false}
          mapType="standard"
        />
        <MapControls
          onReset={() => mapRef.current?.resetToSpain()}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />
        <FeatureDetailPanel
          properties={selectedProperties}
          onDismiss={handleDismiss}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
  },
});
