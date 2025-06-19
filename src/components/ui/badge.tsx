import * as React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle, TouchableOpacity } from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

// Badge variants
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Create a function that returns different styles based on variant (similar to cva)
const getBadgeVariantStyles = (variant: BadgeVariant = "default"): {
  container: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
} => {
  const baseContainerStyle = styles.container;
  const baseTextStyle = styles.text;
  
  switch (variant) {
    case "secondary":
      return {
        container: mergeStyles(baseContainerStyle, styles.secondaryContainer),
        text: mergeStyles(baseTextStyle, styles.secondaryText),
      };
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
    default:
      return {
        container: baseContainerStyle,
        text: baseTextStyle,
      };
  }
};

// Component Types
type BadgeProps = {
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  onPress?: () => void;
};

// Badge component
const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  style,
  textStyle,
  children,
  onPress,
}) => {
  const variantStyles = getBadgeVariantStyles(variant);
  
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.8 } : {};
  
  return (
    <Wrapper
      style={mergeStyles(variantStyles.container, style)}
      accessibilityRole="text"
      {...wrapperProps}
    >
      {typeof children === 'string' ? (
        <Text style={mergeStyles(variantStyles.text, textStyle)}>
          {children}
        </Text>
      ) : children}
    </Wrapper>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999, // Full rounded corners
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#0ea5e9', // primary color
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff', // primary-foreground
  },
  secondaryContainer: {
    backgroundColor: '#f1f5f9', // secondary color
  },
  secondaryText: {
    color: '#0f172a', // secondary-foreground
  },
  destructiveContainer: {
    backgroundColor: '#ef4444', // destructive color
  },
  destructiveText: {
    color: '#ffffff', // destructive-foreground
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderColor: '#e2e8f0', // border color
  },
  outlineText: {
    color: '#0f172a', // foreground color
  },
});

// Add display name for debugging
Badge.displayName = "Badge";

export { Badge, getBadgeVariantStyles };
export type { BadgeVariant };
