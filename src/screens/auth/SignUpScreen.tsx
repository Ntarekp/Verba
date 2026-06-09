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
import { useAuth, getAuthErrorMessage, showAuthAlert } from '../../context/AuthContext';
import { AuthGlassCard } from '../../components/auth/AuthGlassCard';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { rounded, spacing, typography } from '../../styles/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const insets = useSafeAreaInsets();
  const { signUp, loginAsGuest } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsGuest();
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (e) {
      const msg = getAuthErrorMessage(e);
      setError(msg);
      showAuthAlert('Guest Access Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signUp(name, email, password);
      showAuthAlert('Welcome to Verba', 'Your account has been created successfully.');
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (e) {
      const msg = getAuthErrorMessage(e);
      setError(msg);
      showAuthAlert('Sign Up Failed', msg);
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>

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
            Create your account
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
            Start building your personal vocabulary library.
          </Text>

          <AuthTextField
            label="Full Name"
            icon="person"
            value={name}
            onChangeText={setName}
            placeholder="Language Explorer"
            autoCapitalize="words"
          />
          <AuthTextField
            label="Email Address"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AuthTextField
            label="Password"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
          />

          {error ? (
            <Text style={[styles.formError, { color: themeColors.error }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: themeColors.secondary }]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Create Account</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGuestLogin}
            disabled={loading}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: themeColors.outlineVariant,
                marginTop: 12,
              },
            ]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="person-outline" size={20} color={themeColors.onSurface} />
            <Text style={[styles.primaryBtnText, { color: themeColors.onSurface }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <Text style={[styles.footer, { color: themeColors.onSurfaceVariant }]}>
            Already have an account?{' '}
            <Text
              style={{ color: themeColors.secondary, fontWeight: '700' }}
              onPress={() => navigation.navigate('Login')}
            >
              Sign in
            </Text>
          </Text>
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
  footer: {
    fontFamily: 'Inter',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
