import React from 'react';
import { Marker, MarkerProps } from 'react-native-maps';
import { Location } from '@/types/geography';

export interface QuizMarkerProps extends Partial<MarkerProps> {
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
  pinColor?: 'red' | 'green' | 'blue' | 'purple';
}

/**
 * Marker component for quiz locations
 * 
 * Renders a map marker with location data and optional quiz feedback styling
 */
export function QuizMarker({
  location,
  isCorrect = false,
  isUserAnswer = false,
  showTitle = false,
  pinColor,
  ...props
}: QuizMarkerProps) {
  // Determine pin color based on quiz state
  const getPinColor = (): 'red' | 'green' | 'blue' | 'purple' => {
    if (pinColor) return pinColor;
    if (isCorrect) return 'green';
    if (isUserAnswer && !isCorrect) return 'red';
    return 'blue';
  };

  const [longitude, latitude] = location.coordinates;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      title={showTitle ? location.name : undefined}
      description={showTitle ? location.nameEs : undefined}
      pinColor={getPinColor()}
      {...props}
    />
  );
}
