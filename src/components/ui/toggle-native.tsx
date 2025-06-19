import * as React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

// Helper function for merging styles
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

// Toggle variants and sizes
type ToggleVariant = "default" | "outline" | "filled";
type ToggleSize = "sm" | "md" | "lg";

// Toggle props
interface ToggleProps {
  /**
   * Controlled pressed state
   */
  pressed?: boolean;
  /**
   * Default pressed state when uncontrolled
   */
  defaultPressed?: boolean;
  /**
   * Called when the pressed state changes
   */
  onPressedChange?: (pressed: boolean) => void;
  /**
   * Whether the toggle is disabled
   */
  disabled?: boolean;
  /**
   * The toggle variant
   */
  variant?: ToggleVariant;
  /**
   * The toggle size
   */
  size?: ToggleSize;
  /**
   * Container styles
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Text styles
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Toggle icon/text
   */
  children?: React.ReactNode;
  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

// Get styles based on variant
const getToggleVariantStyles = (
  variant: ToggleVariant = "default", 
  pressed: boolean
): {
  container: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
} => {
  switch (variant) {
    case "outline":
      return {
        container: pressed 
          ? mergeStyles(styles.container, styles.outlinePressedContainer) 
          : mergeStyles(styles.container, styles.outlineContainer),
        text: pressed 
          ? styles.outlinePressedText 
          : styles.outlineText,
      };
    case "filled":
      return {
        container: pressed 
          ? mergeStyles(styles.container, styles.filledPressedContainer) 
          : mergeStyles(styles.container, styles.filledContainer),
        text: pressed 
          ? styles.filledPressedText 
          : styles.filledText,
      };
    default:
      return {
        container: pressed 
          ? mergeStyles(styles.container, styles.defaultPressedContainer) 
          : styles.container,
        text: pressed 
          ? styles.defaultPressedText 
          : styles.defaultText,
      };
  }
};

// Get styles based on size
const getToggleSizeStyles = (size: ToggleSize = "md"): {
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
    default:
      return {
        container: styles.containerMd,
        text: styles.textMd,
      };
  }
};

// Toggle component implementation
const Toggle = React.forwardRef<TouchableOpacity, ToggleProps>((
  {
    pressed,
    defaultPressed = false,
    onPressedChange,
    disabled = false,
    variant = "default",
    size = "md",
    style,
    textStyle,
    children,
    leftIcon,
    rightIcon,
    accessibilityLabel = "Toggle",
    ...props
  },
  ref
) => {
  // State for uncontrolled usage
  const [isPressedState, setIsPressedState] = React.useState(defaultPressed);
  
  // Animation value for press effect
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Determine if controlled or uncontrolled
  const isPressedValue = pressed !== undefined ? pressed : isPressedState;
  
  // Animation when pressed state changes
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isPressedValue ? 1 : 0,
      duration: 100,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: false, // Need to animate backgroundColor
    }).start();
  }, [isPressedValue, fadeAnim]);
  
  // Handle press
  const handlePress = () => {
    if (disabled) return;
    
    const newValue = !isPressedValue;
    
    if (pressed === undefined) {
      setIsPressedState(newValue);
    }
    
    onPressedChange?.(newValue);
  };
  
  // Get styles based on variant and size
  const variantStyles = getToggleVariantStyles(variant, isPressedValue);
  const sizeStyles = getToggleSizeStyles(size);
  
  // Calculate animated styles
  const animatedContainerStyle = {
    opacity: fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.9], // Slight opacity change for visual feedback
    }),
  };
  
  return (
    <Animated.View style={animatedContainerStyle}>
      <TouchableOpacity
        ref={ref}
        style={mergeStyles(
          variantStyles.container,
          sizeStyles.container,
          disabled && styles.disabled,
          style
        )}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ 
          selected: isPressedValue,
          disabled 
        }}
        accessibilityLabel={accessibilityLabel}
        {...props}
      >
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          
          {typeof children === "string" ? (
            <Text 
              style={mergeStyles(
                variantStyles.text,
                sizeStyles.text,
                textStyle
              )}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Toggle group context
interface ToggleGroupContextValue {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  variant?: ToggleVariant;
  size?: ToggleSize;
  type: "single" | "multiple";
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | undefined>(undefined);

function useToggleGroupContext() {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup");
  }
  return context;
}

// Toggle group props
interface ToggleGroupProps {
  /**
   * The value of the selected items
   */
  value?: string[];
  /**
   * Default value when uncontrolled
   */
  defaultValue?: string[];
  /**
   * Called when the value changes
   */
  onValueChange?: (value: string[]) => void;
  /**
   * Group type - single allows only one selection
   */
  type?: "single" | "multiple";
  /**
   * Whether the group is disabled
   */
  disabled?: boolean;
  /**
   * The variant for all toggle items
   */
  variant?: ToggleVariant;
  /**
   * The size for all toggle items
   */
  size?: ToggleSize;
  /**
   * Container styles
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Toggle item children
   */
  children: React.ReactNode;
}

// Toggle group component
const ToggleGroup = React.forwardRef<View, ToggleGroupProps>((
  {
    value,
    defaultValue = [],
    onValueChange,
    type = "multiple",
    disabled = false,
    variant = "default",
    size = "md",
    style,
    children,
  },
  ref
) => {
  // State for uncontrolled usage
  const [valueState, setValueState] = React.useState<string[]>(defaultValue);
  
  // Determine if controlled or uncontrolled
  const valueArray = value !== undefined ? value : valueState;
  
  // Handle value change
  const handleValueChange = React.useCallback((newValue: string[]) => {
    if (value === undefined) {
      setValueState(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);
  
  // Context value
  const contextValue = React.useMemo(() => ({
    value: valueArray,
    onChange: handleValueChange,
    disabled,
    variant,
    size,
    type,
  }), [valueArray, handleValueChange, disabled, variant, size, type]);
  
  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <View ref={ref} style={mergeStyles(styles.groupContainer, style)}>
        {children}
      </View>
    </ToggleGroupContext.Provider>
  );
});

// Toggle group item props
interface ToggleGroupItemProps {
  /**
   * The value of this item
   */
  value: string;
  /**
   * Whether the item is disabled
   */
  disabled?: boolean;
  /**
   * Container styles
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Text styles
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;
  /**
   * Item content
   */
  children?: React.ReactNode;
}

// Toggle group item component
const ToggleGroupItem = React.forwardRef<TouchableOpacity, ToggleGroupItemProps>((
  {
    value,
    disabled: itemDisabled = false,
    style,
    textStyle,
    leftIcon,
    rightIcon,
    children,
    ...props
  },
  ref
) => {
  const { 
    value: groupValue, 
    onChange, 
    disabled: groupDisabled, 
    variant, 
    size,
    type 
  } = useToggleGroupContext();
  
  // Check if this item is pressed (selected)
  const isPressed = groupValue.includes(value);
  
  // Merge disabled states
  const isDisabled = groupDisabled || itemDisabled;
  
  // Handle press
  const handlePress = () => {
    if (isDisabled) return;
    
    if (type === "single") {
      // For single selection, replace the entire value array
      onChange(isPressed ? [] : [value]);
    } else {
      // For multiple selection, add or remove from array
      if (isPressed) {
        onChange(groupValue.filter(item => item !== value));
      } else {
        onChange([...groupValue, value]);
      }
    }
  };
  
  return (
    <Toggle
      ref={ref}
      pressed={isPressed}
      onPressedChange={handlePress}
      disabled={isDisabled}
      variant={variant}
      size={size}
      style={style}
      textStyle={textStyle}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      {...props}
    >
      {children}
    </Toggle>
  );
});

// Set display names
Toggle.displayName = "Toggle";
ToggleGroup.displayName = "ToggleGroup";
ToggleGroupItem.displayName = "ToggleGroupItem";

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Default variant
  defaultText: {
    color: "#0f172a", // foreground
  },
  defaultPressedContainer: {
    backgroundColor: "#e2e8f0", // accent/muted
  },
  defaultPressedText: {
    color: "#0f172a", // foreground
  },
  
  // Outline variant
  outlineContainer: {
    borderColor: "#e2e8f0", // border
  },
  outlineText: {
    color: "#0f172a", // foreground
  },
  outlinePressedContainer: {
    backgroundColor: "#e2e8f0", // accent/muted
    borderColor: "#e2e8f0", // border
  },
  outlinePressedText: {
    color: "#0f172a", // foreground
  },
  
  // Filled variant
  filledContainer: {
    backgroundColor: "#f1f5f9", // secondary/muted
  },
  filledText: {
    color: "#0f172a", // foreground
  },
  filledPressedContainer: {
    backgroundColor: "#0ea5e9", // primary
  },
  filledPressedText: {
    color: "#ffffff", // primary foreground
  },
  
  // Size variants
  containerSm: {
    height: 34,
    paddingHorizontal: 10,
  },
  textSm: {
    fontSize: 13,
  },
  containerMd: {
    height: 40,
    paddingHorizontal: 12,
  },
  textMd: {
    fontSize: 14,
  },
  containerLg: {
    height: 44,
    paddingHorizontal: 16,
  },
  textLg: {
    fontSize: 16,
  },
  
  // Toggle group styles
  groupContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

export { Toggle, ToggleGroup, ToggleGroupItem };
export type { 
  ToggleProps, 
  ToggleGroupProps, 
  ToggleGroupItemProps, 
  ToggleVariant, 
  ToggleSize 
};
