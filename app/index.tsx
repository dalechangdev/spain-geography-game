import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { SpainMapView, SpainMapViewRef } from "@/components/map";
import { MapControls } from "@/components/map";
import { useRef } from "react";

export default function Index() {
  const mapRef = useRef<SpainMapViewRef>(null);

  const handleMapPress = (coordinate: { latitude: number; longitude: number }) => {
    console.log("Map pressed at:", coordinate);
  };

  const handleReset = () => {
    mapRef.current?.resetToSpain();
  };

  const handleZoomIn = () => {
    // Zoom in by reducing delta by 50%
    // This is a simple implementation - you can enhance it later
    console.log("Zoom in");
  };

  const handleZoomOut = () => {
    // Zoom out by increasing delta by 50%
    console.log("Zoom out");
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
