import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { rounded } from '../styles/theme';

interface PronunciationButtonProps {
  audioUrl: string | null;
  onPress: () => void;
  isPlaying?: boolean;   // true = audio is actively playing → show pause icon
  isPaused?: boolean;    // true = audio is loaded but paused
  isLoading?: boolean;   // true = buffering
  size?: number;
}

export const PronunciationButton: React.FC<PronunciationButtonProps> = ({
  audioUrl,
  onPress,
  isPlaying = false,
  isPaused = false,
  isLoading = false,
  size = 44,
}) => {
  const { themeColors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const isDisabled = !audioUrl;

  // Pulse ring animation: runs only when idle (not playing, not loading, not disabled)
  useEffect(() => {
    if (!isDisabled && !isLoading && !isPlaying) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
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
  }, [isDisabled, isLoading, isPlaying]);

  const handlePress = () => {
    if (!isDisabled && !isLoading) {
      onPress();
    }
  };

  // Icon logic:
  //  - Loading → ActivityIndicator
  //  - Playing → pause icon (user can pause)
  //  - Paused / Idle → volume-up icon (user can play/resume)
  //  - Disabled → volume-off icon (greyed)
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

  const iconColor = isDisabled
    ? themeColors.outline
    : isPlaying
    ? themeColors.tertiary
    : themeColors.tertiary;

  return (
    <View style={styles.container}>
      {/* Pulse ring — only visible when idle and audio available */}
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
        accessibilityLabel={
          isPlaying ? 'Pause pronunciation' : 'Play pronunciation'
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled || isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.tertiary} />
        ) : (
          <MaterialIcons
            name={getIcon() as any}
            size={size * 0.52}
            color={iconColor}
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
