import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MapControlsProps {
  /**
   * Callback when reset button is pressed
   */
  onReset?: () => void;
  
  /**
   * Callback when zoom in button is pressed
   */
  onZoomIn?: () => void;
  
  /**
   * Callback when zoom out button is pressed
   */
  onZoomOut?: () => void;
  
  /**
   * Whether controls are visible
   */
  visible?: boolean;
  
  /**
   * Custom container style
   */
  style?: any;
}

/**
 * Map control buttons for reset, zoom in, zoom out
 */
export function MapControls({
  onReset,
  onZoomIn,
  onZoomOut,
  visible = true,
  style,
}: MapControlsProps) {
  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      {onReset && (
        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Ionicons name="home" size={24} color="#333" />
        </TouchableOpacity>
      )}
      
      {onZoomIn && (
        <TouchableOpacity style={styles.button} onPress={onZoomIn}>
          <Ionicons name="add" size={24} color="#333" />
        </TouchableOpacity>
      )}
      
      {onZoomOut && (
        <TouchableOpacity style={styles.button} onPress={onZoomOut}>
          <Ionicons name="remove" size={24} color="#333" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  button: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
