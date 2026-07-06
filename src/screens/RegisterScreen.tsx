import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34d399',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  emailInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  passwordInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#34d399',
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
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.passwordInput}
        placeholder="Contraseña (mín. 6 caracteres)"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={styles.registerButton}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear cuenta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLinkContainer}>
        <Text style={styles.loginPromptText}>
          ¿Ya tienes cuenta?{' '}
          <Text style={styles.loginLinkText}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
