import * as React from "react";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";

interface LabelProps {
  /**
   * Text content of the label
   */
  children?: React.ReactNode;
  /**
   * Optional styles to apply to the label
   */
  style?: StyleProp<TextStyle>;
  /**
   * For accessibility
   */
  nativeID?: string;
  /**
   * Whether the label is disabled
   */
  disabled?: boolean;
}

/**
 * Label component for React Native
 */
const Label = React.forwardRef<Text, LabelProps>(
  ({ children, style, disabled, nativeID, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        style={[
          styles.label,
          disabled && styles.disabled,
          style,
        ]}
        nativeID={nativeID}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

Label.displayName = "Label";

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.7,
  },
});

export { Label };
