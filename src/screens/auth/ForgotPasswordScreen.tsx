import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import {
  useAuth,
  getAuthErrorMessage,
  showAuthAlert,
} from '../../context/AuthContext';
import { AuthGlassCard } from '../../components/auth/AuthGlassCard';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { rounded, spacing, typography } from '../../styles/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const insets = useSafeAreaInsets();
  const { requestPasswordReset, completePasswordReset } = useAuth();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      await requestPasswordReset(email);
      showAuthAlert(
        'Check Your Email',
        `If an account exists for ${email.trim()}, recovery instructions have been sent. For this demo, continue to set a new password below.`
      );
      setStep('reset');
    } catch (e) {
      showAuthAlert('Recovery Failed', getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await completePasswordReset(email, newPassword);
      showAuthAlert('Password Updated', 'Your password has been reset. Please sign in.');
      navigation.navigate('Login');
    } catch (e) {
      showAuthAlert('Reset Failed', getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>

        <AuthGlassCard>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryContainer + '30' }]}>
            <MaterialIcons name="lock-reset" size={32} color={themeColors.primary} />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: themeColors.onSurface,
                fontSize: typography.sectionHeading.fontSize * 0.7 * fontSizeMultiplier,
              },
            ]}
          >
            {step === 'request' ? 'Forgot password?' : 'Set a new password'}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
            {step === 'request'
              ? 'Enter your email and we will help you recover your account.'
              : 'Choose a strong new password for your Verba account.'}
          </Text>

          <AuthTextField
            label="Email Address"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={step === 'request'}
          />

          {step === 'reset' ? (
            <AuthTextField
              label="New Password"
              icon="lock"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 6 characters"
              secureTextEntry
            />
          ) : null}

          <TouchableOpacity
            onPress={step === 'request' ? handleRequest : handleReset}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: themeColors.secondary }]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {step === 'request' ? 'Send Recovery Link' : 'Update Password'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: themeColors.secondary }]}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </AuthGlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.containerPadding,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.stackMd,
    lineHeight: 20,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: rounded.xl,
    marginTop: 4,
  },
  primaryBtnText: {
    fontFamily: 'Inter',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
  },
});
