import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { rounded } from '../styles/theme';

interface PronunciationButtonProps {
  audioUrl: string | null;
  onPress: () => void;
  isLoading?: boolean;
  size?: number;
}

export const PronunciationButton: React.FC<PronunciationButtonProps> = ({ 
  audioUrl, 
  onPress, 
  isLoading = false,
  size = 44
}) => {
  const { themeColors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isDisabled = !audioUrl;

  useEffect(() => {
    if (!isDisabled && !isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isDisabled, isLoading]);

  const handlePress = () => {
    if (!isDisabled && !isLoading) {
      onPress();
    }
  };

  const dynamicStyles = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: isDisabled 
      ? 'rgba(119, 117, 135, 0.15)' 
      : themeColors.tertiaryFixedDim + '20', // transparent technical accent cyan
  };

  return (
    <View style={styles.container}>
      {!isDisabled && !isLoading && (
        <Animated.View style={[
          styles.pulseRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: themeColors.tertiaryFixedDim + '12',
            transform: [{ scale: pulseAnim }]
          }
        ]} />
      )}
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled || isLoading}
        style={[styles.button, dynamicStyles]}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.tertiary} />
        ) : (
          <MaterialIcons 
            name="volume-up" 
            size={size * 0.55} 
            color={isDisabled ? themeColors.outline : themeColors.tertiary} 
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    zIndex: 0,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
