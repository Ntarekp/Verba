import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const SplashScreen: React.FC = () => {
  const { themeColors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle fade in after logo settles
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={themeColors.background}
        translucent={false}
      />

      {/* Atmospheric background blobs */}
      <View
        style={[
          styles.blobTopLeft,
          { backgroundColor: themeColors.primaryContainer + '22' },
        ]}
      />
      <View
        style={[
          styles.blobBottomRight,
          { backgroundColor: themeColors.tertiaryFixedDim + '18' },
        ]}
      />

      {/* Animated logo group */}
      <Animated.View
        style={[
          styles.logoGroup,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App icon circle */}
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: themeColors.primaryContainer,
              shadowColor: themeColors.primary,
            },
          ]}
        >
          <Text style={[styles.iconLetter, { color: themeColors.onPrimaryContainer }]}>
            V
          </Text>
        </View>

        {/* Brand name */}
        <Text style={[styles.brandName, { color: themeColors.primary }]}>
          Verba
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          {
            color: themeColors.onSurfaceVariant,
            opacity: subtitleAnim,
          },
        ]}
      >
        INTELLIGENCE
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobTopLeft: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    left: -80,
  },
  blobBottomRight: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -60,
    right: -60,
  },
  logoGroup: {
    alignItems: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  iconLetter: {
    fontFamily: 'Inter',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 56,
  },
  brandName: {
    fontFamily: 'Inter',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  tagline: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 5,
    marginTop: 10,
    textTransform: 'uppercase',
  },
});
