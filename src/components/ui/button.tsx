import * as React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  TouchableOpacityProps,
} from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

// Button variants and sizes
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

// Create functions that return different styles based on variant and size (similar to cva)
const getButtonVariantStyles = (variant: ButtonVariant = "default"): {
  container: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
} => {
  const baseContainerStyle = styles.container;
  const baseTextStyle = styles.text;
  
  switch (variant) {
    case "destructive":
      return {
        container: mergeStyles(baseContainerStyle, styles.destructiveContainer),
        text: mergeStyles(baseTextStyle, styles.destructiveText),
      };
    case "outline":
      return {
        container: mergeStyles(baseContainerStyle, styles.outlineContainer),
        text: mergeStyles(baseTextStyle, styles.outlineText),
      };
    case "secondary":
      return {
        container: mergeStyles(baseContainerStyle, styles.secondaryContainer),
        text: mergeStyles(baseTextStyle, styles.secondaryText),
      };
    case "ghost":
      return {
        container: mergeStyles(baseContainerStyle, styles.ghostContainer),
        text: mergeStyles(baseTextStyle, styles.ghostText),
      };
    case "link":
      return {
        container: mergeStyles(baseContainerStyle, styles.linkContainer),
        text: mergeStyles(baseTextStyle, styles.linkText),
      };
    default:
      return {
        container: baseContainerStyle,
        text: baseTextStyle,
      };
  }
};

const getButtonSizeStyles = (size: ButtonSize = "default"): {
  container: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
} => {
  switch (size) {
    case "sm":
      return {
        container: styles.containerSm,
        text: styles.textSm,
      };
    case "lg":
      return {
        container: styles.containerLg,
        text: styles.textLg,
      };
    case "icon":
      return {
        container: styles.containerIcon,
        text: {},
      };
    default:
      return {
        container: {},
        text: {},
      };
  }
};

// Component Types
type ButtonProps = TouchableOpacityProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
};

// Button component
const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>((
  {
    variant = "default",
    size = "default",
    style,
    textStyle,
    disabled = false,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    onPress,
    children,
    ...props
  },
  ref
) => {
  const variantStyles = getButtonVariantStyles(variant);
  const sizeStyles = getButtonSizeStyles(size);
  
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      ref={ref}
      style={mergeStyles(
        variantStyles.container,
        sizeStyles.container,
        isDisabled && styles.disabled,
        style
      )}
      activeOpacity={0.8}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === "outline" ? "#0f172a" : "#ffffff"} 
          />
          {loadingText && (
            <Text style={mergeStyles(variantStyles.text, sizeStyles.text, styles.loadingText, textStyle)}>
              {loadingText}
            </Text>
          )}
        </View>
      )}
      
      {!loading && (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          
          {typeof children === 'string' ? (
            <Text style={mergeStyles(variantStyles.text, sizeStyles.text, textStyle)}>
              {children}
            </Text>
          ) : (
            children
          )}
          
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    height: 40,
    backgroundColor: '#0ea5e9', // primary color
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff', // primary-foreground
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Variant styles
  destructiveContainer: {
    backgroundColor: '#ef4444', // destructive color
  },
  destructiveText: {
    color: '#ffffff', // destructive-foreground
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0', // border color
  },
  outlineText: {
    color: '#0f172a', // foreground color
  },
  secondaryContainer: {
    backgroundColor: '#f1f5f9', // secondary color
  },
  secondaryText: {
    color: '#0f172a', // secondary-foreground
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8, 
  },
  ghostText: {
    color: '#0f172a', // foreground color
  },
  linkContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 'auto',
  },
  linkText: {
    color: '#0ea5e9', // primary color
    textDecorationLine: 'none', // We'll add hover effect with state
  },
  
  // Size styles
  containerSm: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  textSm: {
    fontSize: 13,
  },
  containerLg: {
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  textLg: {
    fontSize: 15,
  },
  containerIcon: {
    height: 40,
    width: 40,
    paddingHorizontal: 0,
    borderRadius: 6,
  },
});

Button.displayName = "Button";

export { Button };
export type { ButtonVariant, ButtonSize, ButtonProps };
