import React from 'react';
import { MarkerView, Callout } from '@maplibre/maplibre-react-native';
import { View, StyleSheet } from 'react-native';
import { Location } from '@/types/geography';

export type MarkerColor = 'red' | 'green' | 'blue' | 'purple';

export interface QuizMarkerProps {
  /**
   * Unique ID for this marker
   */
  id: string;
  
  /**
   * Location data for the marker
   */
  location: Location;
  
  /**
   * Whether this marker represents the correct answer
   */
  isCorrect?: boolean;
  
  /**
   * Whether this marker represents the user's answer
   */
  isUserAnswer?: boolean;
  
  /**
   * Whether to show the location name as title
   */
  showTitle?: boolean;
  
  /**
   * Custom pin color
   */
  pinColor?: MarkerColor;
  
  /**
   * Callback when marker is pressed
   */
  onPress?: () => void;
}

const COLOR_MAP: Record<MarkerColor, string> = {
  red: '#E53935',
  green: '#43A047',
  blue: '#1E88E5',
  purple: '#8E24AA',
};

/**
 * Marker component for quiz locations
 * 
 * Renders a map marker with location data and optional quiz feedback styling
 */
export function QuizMarker({
  id,
  location,
  isCorrect = false,
  isUserAnswer = false,
  showTitle = false,
  pinColor,
  onPress,
}: QuizMarkerProps) {
  // Determine pin color based on quiz state
  const getColor = (): string => {
    if (pinColor) return COLOR_MAP[pinColor];
    if (isCorrect) return COLOR_MAP.green;
    if (isUserAnswer && !isCorrect) return COLOR_MAP.red;
    return COLOR_MAP.blue;
  };

  const [longitude, latitude] = location.coordinates;
  const color = getColor();

  return (
    <MarkerView
      coordinate={[longitude, latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View 
        style={[styles.marker, { backgroundColor: color }]}
        onTouchEnd={onPress}
      >
        <View style={styles.markerInner} />
      </View>
      {showTitle && (
        <Callout title={location.name}>
          <View style={styles.callout}>
            {/* Callout content handled by MapLibre */}
          </View>
        </Callout>
      )}
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  callout: {
    padding: 8,
  },
});
