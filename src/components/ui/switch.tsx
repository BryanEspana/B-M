import * as React from "react";
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";

// Helper function for merging styles
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  thumbStyle?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
};

const Switch: React.FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  style,
  thumbStyle,
  trackStyle,
}) => {
  // State for uncontrolled component
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  
  // Determine if it's controlled or not
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : uncontrolledChecked;
  
  // Animation values
  const thumbPosition = React.useRef(new Animated.Value(checked ? 1 : 0)).current;
  
  // Update animation when checked changes
  React.useEffect(() => {
    Animated.timing(thumbPosition, {
      toValue: checked ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [checked, thumbPosition]);
  
  // Toggle handler
  const handleToggle = React.useCallback(() => {
    if (disabled) return;
    
    const newValue = !checked;
    if (!isControlled) {
      setUncontrolledChecked(newValue);
    }
    onCheckedChange?.(newValue);
  }, [checked, disabled, isControlled, onCheckedChange]);
  
  // Interpolate thumb position
  const thumbLeft = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // Based on the default switch dimensions
  });
  
  // Interpolate track background color
  const trackBgColor = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e2e8f0', '#0ea5e9'], // muted color to primary color
  });
  
  return (
    <TouchableWithoutFeedback
      onPress={handleToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
    >
      <View style={mergeStyles(styles.container, style)}>
        <Animated.View 
          style={[
            styles.track,
            { backgroundColor: trackBgColor },
            disabled && styles.disabledTrack,
            trackStyle
          ]}
        >
          <Animated.View 
            style={[
              styles.thumb,
              { left: thumbLeft },
              disabled && styles.disabledThumb,
              thumbStyle
            ]}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
    justifyContent: 'center',
  },
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  disabledTrack: {
    opacity: 0.5,
  },
  disabledThumb: {
    opacity: 0.5,
  },
});

Switch.displayName = "Switch";

export { Switch };
