import { MapControls, SpainMapView, SpainMapViewRef } from "@/components/map";
import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const mapRef = useRef<SpainMapViewRef>(null);

  const handleMapPress = (coordinate: {
    latitude: number;
    longitude: number;
  }) => {
    console.log("Map pressed at:", coordinate);
  };

  const handleReset = () => {
    mapRef.current?.resetToSpain();
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spain Geography Quiz</Text>
        <Text style={styles.subtitle}>Tap on the map to get started</Text>
      </View>

      <View style={styles.mapContainer}>
        <SpainMapView
          ref={mapRef}
          onMapPress={handleMapPress}
          showUserLocation={false}
          mapType="standard"
        />

        <MapControls
          onReset={handleReset}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  mapContainer: {
    flex: 1,
  },
});
