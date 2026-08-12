import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { radius, motion } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
 *
 * Feedback de tap: scale con `motion.spring.press` (Reanimated) — mismo
 * spring en las 6 apps, ver brand-kit/README.md#motion.
 */
export default function Button({ title, onPress, disabled, loading, variant = 'primary', style }: Props) {
  const scale = useSharedValue(1);

  const background =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const textColor = variant === 'ghost' ? colors.textSecondary : '#FFFFFF';
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(0.96, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      style={[
        styles.base,
        { backgroundColor: background },
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </AnimatedPressable>
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
  disabled: {
    opacity: 0.5,
  },
});
