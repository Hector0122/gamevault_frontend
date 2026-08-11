import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { radius } from '../theme/tokens';
import Button from '../components/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  emailInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
  },
  passwordInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 24,
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginPromptText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  loginLinkText: {
    color: colors.primary,
  },
});

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Completa todos los campos', position: 'bottom', visibilityTime: 2000 });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'La contraseña debe tener al menos 6 caracteres', position: 'bottom', visibilityTime: 2000 });
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err instanceof Error ? err.message : 'Error al registrarse', position: 'bottom', visibilityTime: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 80 }]}>
      <Text style={styles.title}>
        GameVault
      </Text>
      <Text style={styles.subtitle}>
        Crea tu cuenta
      </Text>

      <TextInput
        style={styles.emailInput}
        placeholder="Email"
        placeholderTextColor={colors.textTertiary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.passwordInput}
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor={colors.textTertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Crear cuenta" onPress={handleRegister} loading={loading} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLinkContainer}>
        <Text style={styles.loginPromptText}>
          ¿Ya tienes cuenta?{' '}
          <Text style={styles.loginLinkText}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
