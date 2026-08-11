import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/tokens';

type ButtonVariant = 'primary' | 'danger' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /**
   * primary (relleno, color de marca) · danger (relleno, semantic.danger) · ghost (texto, sin relleno)
   */
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * Botón estándar — mismo componente (mismo radio, misma curva de esquina)
 * que el de Varo. VaultGaming es solo-oscuro, así que lee `colors` estático
 * en vez de un `useTheme()`. Ver brand-kit/README.md#botones.
 */
export default function Button({ title, onPress, disabled, loading, variant = 'primary', style }: Props) {
  const background =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const textColor = variant === 'ghost' ? colors.textSecondary : '#FFFFFF';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
