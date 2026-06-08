import React, { useEffect, useState } from 'react';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, lastMessage, clearMessage } = useAuth();

  const [email, setEmail] = useState('demo@verba.app');
  const [password, setPassword] = useState('Verba2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lastMessage) {
      showAuthAlert('Verba', lastMessage);
      clearMessage();
    }
  }, [lastMessage, clearMessage]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (e) {
      const msg = getAuthErrorMessage(e);
      setError(msg);
      showAuthAlert('Sign In Failed', msg);
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
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.brand, { color: themeColors.primary }]}>Verba</Text>
        <Text
          style={[
            styles.tagline,
            { color: themeColors.onSurfaceVariant, fontSize: 15 * fontSizeMultiplier },
          ]}
        >
          Master your vocabulary with intelligent precision.
        </Text>

        <AuthGlassCard>
          <Text
            style={[
              styles.title,
              {
                color: themeColors.onSurface,
                fontSize: typography.sectionHeading.fontSize * 0.75 * fontSizeMultiplier,
              },
            ]}
          >
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
            Please enter your details to sign in.
          </Text>

          <AuthTextField
            label="Email Address"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthTextField
            label="Password"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            rightAction={
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={[styles.forgotLink, { color: themeColors.secondary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            }
          />

          {error ? (
            <Text style={[styles.formError, { color: themeColors.error }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: themeColors.secondary }]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Sign in</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.outlineVariant + '50' }]} />
            <Text style={[styles.dividerText, { color: themeColors.outline }]}>OR CONTINUE WITH</Text>
            <View style={[styles.dividerLine, { backgroundColor: themeColors.outlineVariant + '50' }]} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: themeColors.outlineVariant }]}
              onPress={() =>
                showAuthAlert(
                  'Google Sign-In',
                  'Social sign-in is not configured in this demo. Use demo@verba.app / Verba2024 or create an account.'
                )
              }
            >
              <MaterialIcons name="public" size={20} color={themeColors.onSurface} />
              <Text style={[styles.socialText, { color: themeColors.onSurface }]}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: themeColors.outlineVariant }]}
              onPress={() =>
                showAuthAlert(
                  'GitHub Sign-In',
                  'Social sign-in is not configured in this demo. Use email and password instead.'
                )
              }
            >
              <MaterialIcons name="code" size={20} color={themeColors.onSurface} />
              <Text style={[styles.socialText, { color: themeColors.onSurface }]}>GitHub</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: themeColors.onSurfaceVariant }]}>
            Don't have an account?{' '}
            <Text
              style={{ color: themeColors.secondary, fontWeight: '700' }}
              onPress={() => navigation.navigate('SignUp')}
            >
              Sign up for free
            </Text>
          </Text>
        </AuthGlassCard>

        <Text style={[styles.demoHint, { color: themeColors.outline }]}>
          Demo: demo@verba.app / Verba2024
        </Text>
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
  brand: {
    fontFamily: 'Inter',
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: spacing.stackLg,
    lineHeight: 22,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginBottom: spacing.stackMd,
  },
  forgotLink: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  formError: {
    fontFamily: 'Inter',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 8,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: rounded.xl,
  },
  socialText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    fontFamily: 'Inter',
    fontSize: 14,
    textAlign: 'center',
  },
  demoHint: {
    fontFamily: 'Inter',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.stackMd,
  },
});
