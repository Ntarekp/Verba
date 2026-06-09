import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatMillis } from '../../utils/pronunciationHelpers';
import { rounded, typography } from '../../styles/theme';

interface AudioProgressBarProps {
  positionMillis: number;
  durationMillis: number;
  isLoading?: boolean;
}

export const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  positionMillis,
  durationMillis,
  isLoading = false,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  const progress =
    durationMillis > 0
      ? Math.min(1, Math.max(0, positionMillis / durationMillis))
      : isLoading
        ? 0.15
        : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text
          style={[
            styles.time,
            {
              color: themeColors.onSurfaceVariant,
              fontSize: typography.caption.fontSize * fontSizeMultiplier,
            },
          ]}
        >
          {formatMillis(positionMillis)}
        </Text>
        <Text
          style={[
            styles.time,
            {
              color: themeColors.onSurfaceVariant,
              fontSize: typography.caption.fontSize * fontSizeMultiplier,
            },
          ]}
        >
          {formatMillis(durationMillis)}
        </Text>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: themeColors.surfaceVariant ?? themeColors.surfaceContainerHigh },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: themeColors.primary,
            },
          ]}
        />
        {progress > 0 && progress < 1 ? (
          <View
            style={[
              styles.thumb,
              {
                left: `${progress * 100}%`,
                backgroundColor: themeColors.surfaceContainerLowest,
                borderColor: themeColors.primary,
              },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 8,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontFamily: 'Inter',
  },
  track: {
    height: 8,
    borderRadius: rounded.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: rounded.full,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    width: 12,
    height: 12,
    marginTop: -6,
    marginLeft: -6,
    borderRadius: 6,
    borderWidth: 2,
  },
});
