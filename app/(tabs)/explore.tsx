import { MapControls, SpainMapView, type SpainMapViewRef } from "@/components/map";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RegionInfo {
  name: string;
  details: string[];
}

function getRegionInfo(properties: Record<string, any>): RegionInfo {
  if (properties.NAME_4) {
    return {
      name: properties.NAME_4,
      details: [
        properties.NAME_3,
        properties.NAME_2 && `Province of ${properties.NAME_2}`,
        properties.NAME_1,
      ].filter(Boolean) as string[],
    };
  }
  if (properties.NAME_3) {
    return {
      name: properties.NAME_3,
      details: [
        properties.NAME_2 && `Province of ${properties.NAME_2}`,
        properties.NAME_1,
      ].filter(Boolean) as string[],
    };
  }
  if (properties.NAME_2) {
    return {
      name: properties.NAME_2,
      details: [
        properties.TYPE_2,
        properties.NAME_1,
      ].filter(Boolean) as string[],
    };
  }
  return {
    name: properties.NAME_1 || properties.COUNTRY || "Spain",
    details: [],
  };
}

export default function ExploreScreen() {
  const mapRef = useRef<SpainMapViewRef>(null);
  const [selectedProperties, setSelectedProperties] = useState<Record<
    string,
    any
  > | null>(null);

  const handleFeaturePress = (properties: Record<string, any> | null) => {
    setSelectedProperties(properties);
  };

  const handleDismiss = () => {
    setSelectedProperties(null);
    mapRef.current?.clearSelection();
  };

  const regionInfo = selectedProperties ? getRegionInfo(selectedProperties) : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        <SpainMapView
          ref={mapRef}
          onFeaturePress={handleFeaturePress}
          showUserLocation={false}
          mapType="standard"
        />
        <MapControls
          onReset={() => mapRef.current?.resetToSpain()}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />
        {regionInfo && (
          <View style={styles.infoPanel}>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.regionName}>{regionInfo.name}</Text>
            {regionInfo.details.map((detail, i) => (
              <Text key={i} style={styles.regionDetail}>
                {detail}
              </Text>
            ))}
          </View>
        )}
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
  infoPanel: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dismissButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
  regionName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    paddingRight: 28,
  },
  regionDetail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
});
