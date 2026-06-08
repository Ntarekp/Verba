import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Image,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FIRST_LAUNCH_KEY = 'verba_first_launch_done';

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const steps = [
    {
      title: 'Intelligence at your fingertips',
      description: 'Instant access to deep linguistic insights, comprehensive definitions, and contextual examples.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFldomWRgDKLSgBfQdDzFYd6K50lHWimx6JX58C8HqaLiIU42HVf5cMjsv3cokmWJHKKMlUxex1XGMAABZzy81j9kfZ8_xq1h8jCucXgnGACaJoDEhN84N9-YsX7Vj6nkODqyVVxyNtBGh8sm7QLqnexc3kYsGe462M0kPnyz5kPr9u0M7dMtlksm48F75MQ3irkSI9m9RQMug-4PsjsiW0luvqK0bhImZ9QiBw7O15CUMH8zw8jFpR6lRmHNV26XjJemup6kXbA',
      color: themeColors.primary,
      type: 'intelligence',
    },
    {
      title: 'Perfect Pronunciation',
      description: 'Master pronunciation with crystal-clear native audio and detailed phonetic transcriptions.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQL3vR2NpgAGUqV4erNAttdcBhvrO6c6crNnRl4vYigntwZn-Lf24qCaqB6Xvcxy6_BlDsxnhlrzyQYubcdGQgctTqVjKYm9VPMwOr4sDbu5rWRCQKbGfil6Ravjv3CmP8M6MMkgZVkJhu3hpXHWPhX_BiiWLRymbDHSEgvgbbKVz_PAxhuH3lFDB3cKfU8r_Vsm6DTD8MIHkmuRmE7Z0alox3SmEwgXZFn1AIqeMoXEZhoV1a6ORP6JxilRcZmAWYT043hCEAQ',
      color: themeColors.tertiary,
      type: 'audio',
    },
    {
      title: 'Learn Anywhere',
      description: 'Access your entire vocabulary library and essential definitions without an internet connection.',
      image: '',
      color: themeColors.secondary,
      type: 'learnAnywhere',
    },
    {
      title: 'Ready to begin?',
      description: 'Join the future of language intelligence.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5q_DdqqXAUYuQhYbbS-5T6RDeHPQhVfyR4AsOUd1qwn_8X9rz65y0fBVAynj5hhoZmgix-e-5RIGJBt4C9m9OiyNwpv7rIElXJ_-loiujuNPQP_87NLoIUZn29fjaOPiqArDEa_yCG4fxL_3OzUrDoASGF7vHE9kbtz2qCMb4ixsUHbfP3PyjRHkbv2nnmtZJrs_lM90LTOlQnapGezBuRd_S4jNjesmzVesYQSKX4LhvhRXD8c8IP1l01mKK5Ntwnk0lOGq4xg',
      color: themeColors.primary,
      type: 'final',
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setCurrentStep(nextIndex);
    }
  };

  const handleSkip = () => {
    const finalIndex = steps.length - 1;
    scrollViewRef.current?.scrollTo({ x: finalIndex * SCREEN_WIDTH, animated: true });
    setCurrentStep(finalIndex);
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
      navigation.replace('MainDrawer');
    } catch (e) {
      navigation.replace('MainDrawer');
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Skip button header */}
      <View style={styles.header}>
        {!isLastStep ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: themeColors.onSurfaceVariant, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
              Skip
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
      >
        {steps.map((step, index) => (
          <View key={index} style={styles.slide}>
            {/* Image Container with Ambient Shadow Blob */}
            <View style={styles.imageWrapper}>
              <View style={[styles.blurBlob, { backgroundColor: step.color + '18' }]} />
              
              <View style={[styles.cardContainer, { backgroundColor: themeColors.surfaceContainerLowest }]}>
                {step.type === 'audio' ? (
                  // Soundwave visual overlay mockup
                  <View style={styles.audioMockup}>
                    <View style={styles.waveContainer}>
                      {[1.2, 2.5, 3.8, 5, 3.2, 1.8, 1.2].map((delay, i) => (
                        <View 
                          key={i} 
                          style={[
                            styles.waveBar, 
                            { 
                              backgroundColor: themeColors.tertiary, 
                              height: 12 + i * (i % 2 === 0 ? 12 : 6),
                            }
                          ]} 
                        />
                      ))}
                    </View>
                    <View style={[styles.pronounceBadge, { backgroundColor: themeColors.tertiaryContainer }]}>
                      <MaterialIcons name="volume-up" size={24} color={themeColors.onTertiaryContainer} />
                    </View>
                  </View>
                ) : step.type === 'learnAnywhere' ? (
                  // Learn Anywhere: cloud + arrow + book layout (T4.1)
                  <View style={styles.offlineMockup}>
                    <MaterialIcons name="cloud-download" size={56} color={themeColors.primary} style={{ alignSelf: 'center' }} />
                    <MaterialIcons name="arrow-downward" size={24} color={themeColors.primary + '80'} style={{ alignSelf: 'center' }} />
                    <View style={[styles.mockBento, { backgroundColor: themeColors.surfaceContainerLow, alignSelf: 'center', paddingHorizontal: 24 }]}>
                      <MaterialIcons name="menu-book" size={32} color={themeColors.primary} />
                    </View>
                  </View>
                ) : step.type === 'final' ? (
                  // Final step: shows scroll illustration
                  <Image source={{ uri: step.image }} style={styles.slideImage} />
                ) : (
                  // General screen mockup
                  <Image source={{ uri: step.image }} style={styles.slideImage} />
                )}
              </View>
            </View>

            {/* Title & Desc */}
            <View style={styles.textContainer}>
              <Text style={[
                styles.title, 
                { color: step.color, fontSize: typography.sectionHeading.fontSize * fontSizeMultiplier }
              ]}>
                {step.title}
              </Text>
              <Text style={[
                styles.desc, 
                { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
              ]}>
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Step dots */}
        <View style={styles.dotsRow}>
          {steps.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot,
                { 
                  backgroundColor: currentStep === index 
                    ? steps[currentStep].color 
                    : themeColors.outlineVariant,
                  width: currentStep === index ? 24 : 8,
                }
              ]} 
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          {isLastStep ? (
            <TouchableOpacity
              onPress={handleGetStarted}
              style={[styles.getStartedBtn, { backgroundColor: themeColors.primary }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.getStartedBtnText, { fontSize: typography.buttonText.fontSize * fontSizeMultiplier }]}>
                Get Started
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextBtn, { backgroundColor: themeColors.secondary }]}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.containerPadding,
  },
  skipText: {
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
  },
  imageWrapper: {
    width: '90%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: spacing.stackLg,
  },
  blurBlob: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 999,
  },
  cardContainer: {
    width: '80%',
    height: '80%',
    borderRadius: rounded.xl * 1.5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.9,
  },
  audioMockup: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '70%',
    justifyContent: 'center',
  },
  waveBar: {
    width: 6,
    borderRadius: rounded.full,
  },
  pronounceBadge: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00505f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  offlineMockup: {
    width: '100%',
    padding: spacing.gutter * 1.5,
    gap: 16,
  },
  mockBento: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: rounded.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  mockBentoLines: {
    flex: 1,
    gap: 6,
  },
  mockLineShort: {
    width: '40%',
    height: 6,
    borderRadius: 3,
  },
  mockLineLong: {
    width: '80%',
    height: 5,
    borderRadius: 3,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: spacing.stackSm,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.stackSm,
    letterSpacing: -0.5,
  },
  desc: {
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.85,
  },
  footer: {
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    height: 12,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonRow: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058be',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  getStartedBtn: {
    width: '100%',
    maxWidth: 280,
    height: '100%',
    borderRadius: rounded.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#3525cd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  getStartedBtnText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
  },
});
