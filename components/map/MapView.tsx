import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import MapView as RNMapView, { Region, PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SPAIN_REGION, SPAIN_BOUNDS } from '@/constants/map';

export interface SpainMapViewRef {
  resetToSpain: () => void;
  animateToCoordinate: (coordinate: { latitude: number; longitude: number }, zoomLevel?: number) => void;
  getCurrentRegion: () => Region;
}

export interface SpainMapViewProps extends Omit<Partial<MapViewProps>, 'ref'> {
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
   * Map style variant
   */
  mapType?: 'standard' | 'satellite' | 'terrain' | 'hybrid';
  
  /**
   * Whether map is interactive (can be disabled during quiz feedback)
   */
  interactive?: boolean;
  
  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;
}

/**
 * Main map component for Spain geography quiz app
 * 
 * Wraps react-native-maps with Spain-specific defaults and helpers
 */
export const SpainMapView = forwardRef<SpainMapViewRef, SpainMapViewProps>(({
  initialRegion = SPAIN_REGION,
  onMapPress,
  onRegionChange,
  showUserLocation = false,
  mapType = 'standard',
  interactive = true,
  containerStyle,
  style,
  children,
  ...props
}, ref) => {
  const mapRef = useRef<RNMapView>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);

  const handlePress = (event: any) => {
    if (!onMapPress || !interactive) return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onMapPress({ latitude, longitude });
  };

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
    onRegionChange?.(region);
  };

  /**
   * Reset map to show all of Spain
   */
  const resetToSpain = () => {
    mapRef.current?.animateToRegion(SPAIN_REGION, 1000);
  };

  /**
   * Animate to a specific coordinate
   */
  const animateToCoordinate = (
    coordinate: { latitude: number; longitude: number },
    zoomLevel?: number
  ) => {
    const region: Region = zoomLevel
      ? {
          ...coordinate,
          latitudeDelta: zoomLevel,
          longitudeDelta: zoomLevel,
        }
      : currentRegion;

    mapRef.current?.animateToRegion(region, 1000);
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    resetToSpain,
    animateToCoordinate,
    getCurrentRegion: () => currentRegion,
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      <RNMapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={[styles.map, style]}
        initialRegion={initialRegion}
        onPress={handlePress}
        onRegionChangeComplete={handleRegionChange}
        mapType={mapType}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        showsCompass={true}
        showsScale={true}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={false}
        minZoomLevel={5}
        maxZoomLevel={18}
        {...props}
      >
        {children}
      </RNMapView>
    </View>
  );
});

SpainMapView.displayName = 'SpainMapView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});

// Re-export useful types and components
export { RNMapView };
export type { Region } from 'react-native-maps';
