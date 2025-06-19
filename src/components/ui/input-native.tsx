import * as React from "react";
import { 
  TextInput, 
  StyleSheet, 
  StyleProp, 
  TextStyle,
  ViewStyle,
  View 
} from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

interface InputProps {
  /**
   * Style for the input
   */
  style?: StyleProp<TextStyle>;
  /**
   * Style for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Type of input (will be mapped to appropriate keyboard types)
   */
  type?: "text" | "password" | "email" | "number" | "tel" | "url";
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Value of the input
   */
  value?: string;
  /**
   * Callback when value changes
   */
  onChangeText?: (text: string) => void;
  /**
   * Other props
   */
  [key: string]: any;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ 
    style, 
    containerStyle,
    type = "text", 
    disabled, 
    placeholder,
    value,
    onChangeText,
    ...props 
  }, ref) => {
    // Map web input types to React Native keyboard types
    const keyboardTypeMap: Record<string, any> = {
      text: "default",
      password: "default", 
      email: "email-address",
      number: "numeric",
      tel: "phone-pad",
      url: "url",
    };

    return (
      <View style={mergeStyles(styles.container, containerStyle)}>
        <TextInput
          ref={ref}
          style={mergeStyles(
            styles.input,
            disabled && styles.inputDisabled,
            style
          )}
          keyboardType={keyboardTypeMap[type] || "default"}
          secureTextEntry={type === "password"}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af" // Muted foreground
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    height: 40,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e8f0", // Input border color
    borderRadius: 8, // Rounded medium
    backgroundColor: "#ffffff", // Background color
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#000000", // Text color
  },
  inputDisabled: {
    opacity: 0.5,
  }
});

export { Input };
