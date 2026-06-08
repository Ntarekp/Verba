import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { OnboardingSearchSlide } from '../components/onboarding/OnboardingSearchSlide';
import { OnboardingAudioSlide } from '../components/onboarding/OnboardingAudioSlide';
import { OnboardingOfflineSlide } from '../components/onboarding/OnboardingOfflineSlide';
import { OnboardingFinalSlide } from '../components/onboarding/OnboardingFinalSlide';
import { rounded, spacing, typography } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FIRST_LAUNCH_KEY = 'verba_first_launch_done';

const SLIDES = [
  {
    key: 'search',
    title: 'Instant Intelligence',
    description:
      'Search millions of words with lightning speed and deep contextual insights.',
    Illustration: OnboardingSearchSlide,
    showSkipInHeader: true,
    footer: 'next-full' as const,
  },
  {
    key: 'audio',
    title: 'Perfect Pronunciation',
    description:
      'Master pronunciation with crystal-clear native audio and detailed phonetic transcriptions.',
    Illustration: OnboardingAudioSlide,
    showSkipInHeader: false,
    footer: 'skip-next' as const,
  },
  {
    key: 'offline',
    title: 'Learn Anywhere',
    description:
      'Access your vocabulary library and essential definitions without an internet connection.',
    Illustration: OnboardingOfflineSlide,
    showSkipInHeader: false,
    footer: 'skip-next' as const,
  },
  {
    key: 'final',
    title: 'Ready to begin?',
    description: 'Join the future of language intelligence.',
    Illustration: OnboardingFinalSlide,
    showSkipInHeader: false,
    footer: 'get-started' as const,
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentStep < SLIDES.length - 1) {
      const nextIndex = currentStep + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setCurrentStep(nextIndex);
    }
  };

  const handleSkip = () => {
    const finalIndex = SLIDES.length - 1;
    scrollViewRef.current?.scrollTo({ x: finalIndex * SCREEN_WIDTH, animated: true });
    setCurrentStep(finalIndex);
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      navigation.replace('Auth', { screen: 'Login' });
    } catch {
      navigation.replace('Auth', { screen: 'Login' });
    }
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index >= 0 && index < SLIDES.length) {
      setCurrentStep(index);
    }
  };

  const slide = SLIDES[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.brand, { color: themeColors.primary }]}>Verba</Text>
        {slide.showSkipInHeader ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: themeColors.onSurfaceVariant + '99' }]}>
              Skip
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.topSpacer} />
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
      >
        {SLIDES.map((item) => {
          const SlideIllustration = item.Illustration;
          return (
            <View key={item.key} style={styles.slide}>
              <SlideIllustration />
              <View style={styles.textBlock}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: themeColors.onSurface,
                      fontSize: typography.sectionHeading.fontSize * fontSizeMultiplier,
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.desc,
                    {
                      color: themeColors.onSurfaceVariant,
                      fontSize: typography.definitionBody.fontSize * 0.9 * fontSizeMultiplier,
                    },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentStep === index ? themeColors.secondary : themeColors.outlineVariant,
                  width: currentStep === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {slide.footer === 'get-started' ? (
          <TouchableOpacity
            onPress={handleGetStarted}
            style={[styles.getStartedBtn, { backgroundColor: themeColors.primary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : slide.footer === 'next-full' ? (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.fullNextBtn, { backgroundColor: themeColors.secondary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.fullNextText}>Next</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.dualFooter}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={[styles.footerSkip, { color: themeColors.onSurfaceVariant }]}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.pillNext, { backgroundColor: themeColors.secondary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.pillNextText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 8,
    height: 48,
  },
  brand: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  topSpacer: { width: 40 },
  skipText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
  },
  carousel: { flex: 1 },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.stackSm,
    justifyContent: 'center',
    overflow: 'visible',
  },
  textBlock: {
    alignItems: 'center',
    marginTop: spacing.stackLg,
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.stackSm,
    letterSpacing: -0.3,
  },
  desc: {
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 28,
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    alignItems: 'center',
  },
  dot: { height: 8, borderRadius: 4 },
  fullNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: rounded.xl,
  },
  fullNextText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dualFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerSkip: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  pillNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: rounded.full,
  },
  pillNextText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: rounded.xl,
  },
  getStartedText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
