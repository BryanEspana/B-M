import * as React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  Easing,
} from "react-native";
import { Check } from "lucide-react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

interface CheckboxProps {
  /**
   * Whether the checkbox is checked or not
   */
  checked?: boolean;
  /**
   * Default checked state when uncontrolled
   */
  defaultChecked?: boolean;
  /**
   * Function called when the state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  /**
   * Optional ID for accessibility
   */
  id?: string;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style for the checkbox itself
   */
  checkboxStyle?: StyleProp<ViewStyle>;
  /**
   * Size of the checkbox in pixels
   */
  size?: number;
  /**
   * Color of the checkbox when checked
   */
  activeColor?: string;
  /**
   * Color of the check icon
   */
  checkColor?: string;
  /**
   * Border color when unchecked
   */
  borderColor?: string;
  /**
   * Optional accessibility label
   */
  accessibilityLabel?: string;
}

const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    id,
    style,
    checkboxStyle,
    size = 16,
    activeColor = "#111827", // primary color
    checkColor = "#FFFFFF", // primary-foreground
    borderColor = "#111827", // primary
    accessibilityLabel = "Checkbox",
    ...props
  }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked);
    const animatedScale = React.useRef(new Animated.Value(0)).current;
    
    // Handle controlled vs uncontrolled
    const checkedState = checked !== undefined ? checked : isChecked;
    
    // Animation when checked state changes
    React.useEffect(() => {
      Animated.timing(animatedScale, {
        toValue: checkedState ? 1 : 0,
        duration: 100,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    }, [checkedState, animatedScale]);
    
    // Handle press event
    const handlePress = () => {
      if (disabled) return;
      
      const newCheckedValue = !checkedState;
      
      if (checked === undefined) {
        setIsChecked(newCheckedValue);
      }
      
      if (onCheckedChange) {
        onCheckedChange(newCheckedValue);
      }
    };
    
    return (
      <TouchableOpacity
        style={mergeStyles(styles.container, style)}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: checkedState, disabled }}
        accessibilityLabel={accessibilityLabel}
        {...props}
      >
        <View 
          ref={ref}
          style={mergeStyles(
            styles.checkbox,
            {
              width: size,
              height: size,
              borderColor: borderColor,
              backgroundColor: checkedState ? activeColor : "transparent",
              opacity: disabled ? 0.5 : 1,
            },
            checkboxStyle
          )}
        >
          <Animated.View
            style={{
              transform: [{ scale: animatedScale }],
              opacity: animatedScale,
            }}
          >
            <Check 
              width={size * 0.75} 
              height={size * 0.75} 
              color={checkColor} 
              strokeWidth={3}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }
);

Checkbox.displayName = "Checkbox";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 24,
    minHeight: 24,
  },
  checkbox: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
  },
});

export { Checkbox };
