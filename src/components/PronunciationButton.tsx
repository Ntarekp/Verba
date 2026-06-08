import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface PronunciationButtonProps {
  audioUrl: string | null;
  onPress: () => void;
  isPlaying?: boolean;
  isPaused?: boolean;
  isLoading?: boolean;
  size?: number;
  /** Allow interaction even when audioUrl is missing (e.g. lazy lookup). */
  forceEnabled?: boolean;
}

const MIN_TOUCH = 44;

export const PronunciationButton: React.FC<PronunciationButtonProps> = ({
  audioUrl,
  onPress,
  isPlaying = false,
  isPaused = false,
  isLoading = false,
  size = 48,
  forceEnabled = false,
}) => {
  const { themeColors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const isDisabled = !forceEnabled && !audioUrl;
  const slotSize = Math.max(size * 1.35, MIN_TOUCH + 8);

  useEffect(() => {
    if (!isDisabled && !isLoading && !isPlaying) {
      pulseRef.current = Animated.loop(
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
      );
      pulseRef.current.start();
    } else {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
    }

    return () => {
      pulseRef.current?.stop();
    };
  }, [isDisabled, isLoading, isPlaying, pulseAnim]);

  const handlePress = () => {
    if (!isDisabled && !isLoading) {
      onPress();
    }
  };

  const getIcon = () => {
    if (isDisabled) return 'volume-off';
    if (isPlaying) return 'pause';
    return 'volume-up';
  };

  const buttonBg = isDisabled
    ? 'rgba(119, 117, 135, 0.15)'
    : isPlaying
      ? themeColors.tertiary + '30'
      : themeColors.tertiaryFixedDim + '20';

  const iconColor = isDisabled ? themeColors.outline : themeColors.tertiary;

  return (
    <View style={[styles.slot, { width: slotSize, height: slotSize }]}>
      {!isDisabled && !isLoading && !isPlaying && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: themeColors.tertiaryFixedDim + '14',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled || isLoading}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: buttonBg,
          },
        ]}
        activeOpacity={0.8}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        accessibilityLabel={isPlaying ? 'Pause pronunciation' : 'Play pronunciation'}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled || isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.tertiary} />
        ) : (
          <MaterialIcons name={getIcon() as any} size={Math.round(size * 0.5)} color={iconColor} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  pulseRing: {
    position: 'absolute',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
