import * as React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
  Keyboard,
} from "react-native";

// Create a context to manage OTP state
interface OTPContextType {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  activeInput: number;
  setActiveInput: React.Dispatch<React.SetStateAction<number>>;
  maxLength: number;
}

const OTPContext = React.createContext<OTPContextType | undefined>(undefined);

// Hook to use OTP context
const useOTPContext = () => {
  const context = React.useContext(OTPContext);
  if (!context) {
    throw new Error("OTP components must be used within an OTP provider");
  }
  return context;
};

interface InputOTPProps {
  /**
   * Maximum length of the OTP
   */
  maxLength?: number;
  /**
   * Value of the OTP
   */
  value?: string;
  /**
   * Callback when the OTP value changes
   */
  onChange?: (value: string) => void;
  /**
   * Style for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Style for individual inputs
   */
  style?: StyleProp<TextStyle>;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Children to render
   */
  children?: React.ReactNode;
}

// Main OTP Input component
const InputOTP = React.forwardRef<View, InputOTPProps>(
  ({
    maxLength = 4,
    value: propValue,
    onChange,
    containerStyle,
    style,
    disabled,
    children,
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string>(propValue || "");
    const [activeInput, setActiveInput] = React.useState<number>(0);
    const inputRef = React.useRef<TextInput>(null);
    
    const value = propValue !== undefined ? propValue : internalValue;
    
    // Handle value change
    const handleChange = React.useCallback(
      (valueOrFn: React.SetStateAction<string>) => {
        // Handle both direct value and function cases
        const newValue = typeof valueOrFn === 'function'
          ? valueOrFn(value) // Pass current value to the function
          : valueOrFn;
          
        const sanitizedValue = newValue.replace(/[^0-9]/g, "").slice(0, maxLength);
        
        if (propValue === undefined) {
          setInternalValue(sanitizedValue);
        }
        
        onChange?.(sanitizedValue);
        
        if (sanitizedValue.length < maxLength) {
          setActiveInput(sanitizedValue.length);
        } else {
          setActiveInput(maxLength - 1);
          Keyboard.dismiss();
        }
      },
      [maxLength, onChange, propValue, value]
    );

    // Focus hidden input when component is focused
    React.useEffect(() => {
      if (activeInput >= 0 && !disabled) {
        inputRef.current?.focus();
      } else {
        inputRef.current?.blur();
      }
    }, [activeInput, disabled]);

    return (
      <OTPContext.Provider
        value={{
          value,
          setValue: handleChange,
          activeInput,
          setActiveInput,
          maxLength,
        }}
      >
        <View ref={ref} style={[styles.container, containerStyle]}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={maxLength}
            editable={!disabled}
            caretHidden
          />
          {children}
        </View>
      </OTPContext.Provider>
    );
  }
);

InputOTP.displayName = "InputOTP";

// Group component for OTP slots
interface InputOTPGroupProps {
  /**
   * Children to render
   */
  children?: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const InputOTPGroup = React.forwardRef<View, InputOTPGroupProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View ref={ref} style={[styles.group, style]} {...props}>
        {children}
      </View>
    );
  }
);

InputOTPGroup.displayName = "InputOTPGroup";

// Individual slot for each digit
interface InputOTPSlotProps {
  /**
   * Index of the slot
   */
  index: number;
  /**
   * Style for the slot
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style for the text
   */
  textStyle?: StyleProp<TextStyle>;
}

const InputOTPSlot = React.forwardRef<View, InputOTPSlotProps>(
  ({ index, style, textStyle, ...props }, ref) => {
    const { value, activeInput } = useOTPContext();
    const isFocused = activeInput === index;
    const char = value[index] || "";

    // Setup blinking caret animation
    const caretOpacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (isFocused && !char) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(caretOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(caretOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        caretOpacity.setValue(0);
      }
      
      return () => {
        caretOpacity.setValue(0);
      };
    }, [isFocused, char, caretOpacity]);

    return (
      <View
        ref={ref}
        style={[
          styles.slot,
          isFocused && styles.slotFocused,
          style,
        ]}
        {...props}
      >
        <View style={styles.slotContent}>
          {char ? (
            <Animated.Text style={[styles.slotText, textStyle]}>
              {char}
            </Animated.Text>
          ) : (
            <Animated.View
              style={[
                styles.caret,
                { opacity: caretOpacity },
              ]}
            />
          )}
        </View>
      </View>
    );
  }
);

InputOTPSlot.displayName = "InputOTPSlot";

// Separator between slots
interface InputOTPSeparatorProps {
  /**
   * Children to render
   */
  children?: React.ReactNode;
  /**
   * Style for the separator
   */
  style?: StyleProp<ViewStyle>;
}

const InputOTPSeparator = React.forwardRef<View, InputOTPSeparatorProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[styles.separator, style]}
        accessibilityRole="none"
        {...props}
      >
        {children || <View style={styles.dot} />}
      </View>
    );
  }
);

InputOTPSeparator.displayName = "InputOTPSeparator";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
  },
  slot: {
    height: 40,
    width: 40,
    borderWidth: 1,
    borderColor: "#E5E7EB", // border-input equivalent
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  slotFocused: {
    borderColor: "#000", // ring-ring equivalent
    elevation: 2,
    zIndex: 10,
  },
  slotContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  slotText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  caret: {
    height: 16,
    width: 2,
    backgroundColor: "#000", // foreground color
  },
  separator: {
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6B7280", // subtle color
  },
});

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
