import * as React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Easing,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
} from "react-native";
import { ChevronDown, Check, X } from "lucide-react-native";

// Helper function for merging styles
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

// Types
type SelectItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

interface SelectContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string | undefined;
  onValueChange?: (value: string) => void;
  items: SelectItem[];
  disabled?: boolean;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a SelectProvider");
  }
  return context;
}

// Root component
interface SelectProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  items: SelectItem[];
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

const Select = React.forwardRef<View, SelectProps>((
  {
    open,
    defaultOpen = false,
    onOpenChange,
    value,
    defaultValue,
    onValueChange,
    items = [],
    disabled = false,
    placeholder = "Select an option",
    children,
  },
  ref
) => {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const [valueState, setValueState] = React.useState(defaultValue);
  
  // Controlled vs uncontrolled handling
  const isOpen = open !== undefined ? open : openState;
  const isControlledOpen = open !== undefined;

  const selectedValue = value !== undefined ? value : valueState;
  const isControlledValue = value !== undefined;

  // Update internal state when controlled props change
  React.useEffect(() => {
    if (isControlledOpen) {
      setOpenState(open);
    }
  }, [isControlledOpen, open]);
  
  React.useEffect(() => {
    if (isControlledValue) {
      setValueState(value);
    }
  }, [isControlledValue, value]);
  
  // Handle open state changes
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (!isControlledOpen) {
      setOpenState(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlledOpen, onOpenChange]);

  // Handle value changes
  const handleValueChange = React.useCallback((newValue: string) => {
    if (!isControlledValue) {
      setValueState(newValue);
    }
    onValueChange?.(newValue);
    handleOpenChange(false); // Close the select after selection
  }, [isControlledValue, onValueChange, handleOpenChange]);

  const contextValue = React.useMemo(() => ({
    open: isOpen,
    setOpen: handleOpenChange,
    value: selectedValue,
    onValueChange: handleValueChange,
    items,
    disabled,
    placeholder,
  }), [isOpen, handleOpenChange, selectedValue, handleValueChange, items, disabled, placeholder]);

  return (
    <SelectContext.Provider value={contextValue}>
      <View ref={ref} style={styles.container}>
        {children}
      </View>
    </SelectContext.Provider>
  );
});

Select.displayName = "Select";

// Trigger component
interface SelectTriggerProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<TouchableOpacity, SelectTriggerProps>((
  { style, textStyle, placeholderStyle, children },
  ref
) => {
  const { open, setOpen, value, items, disabled, placeholder } = useSelectContext();
  
  const selectedItem = React.useMemo(() => {
    return items.find(item => item.value === value);
  }, [items, value]);
  
  const handlePress = () => {
    if (disabled) return;
    setOpen(!open);
  };

  return (
    <TouchableOpacity
      ref={ref}
      style={mergeStyles(styles.trigger, disabled && styles.disabled, style)}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled }}
    >
      {children || (
        <View style={styles.triggerContent}>
          {selectedItem ? (
            <Text style={mergeStyles(styles.triggerText, textStyle)}>
              {selectedItem.label}
            </Text>
          ) : (
            <Text style={mergeStyles(styles.placeholder, placeholderStyle)}>
              {placeholder}
            </Text>
          )}
          <ChevronDown 
            width={16} 
            height={16} 
            color="#64748b" 
            style={{ 
              transform: [{ rotate: open ? '180deg' : '0deg' }] 
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
});

SelectTrigger.displayName = "SelectTrigger";

// Value component
interface SelectValueProps {
  placeholder?: string;
  style?: StyleProp<TextStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
}

const SelectValue = React.forwardRef<Text, SelectValueProps>((
  { placeholder, style, placeholderStyle },
  ref
) => {
  const { value, items } = useSelectContext();
  const selectedItem = React.useMemo(() => {
    return items.find(item => item.value === value);
  }, [items, value]);

  return (
    <Text ref={ref} numberOfLines={1} style={mergeStyles(styles.value, style)}>
      {selectedItem ? (
        selectedItem.label
      ) : (
        <Text style={mergeStyles(styles.placeholder, placeholderStyle)}>
          {placeholder || "Select an option"}
        </Text>
      )}
    </Text>
  );
});

SelectValue.displayName = "SelectValue";

// Content component
interface SelectContentProps {
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const SelectContent: React.FC<SelectContentProps> = ({
  style,
  itemStyle,
  itemTextStyle,
  children,
}) => {
  const { open, setOpen, items, value, onValueChange } = useSelectContext();
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (open) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [open, animatedValue]);

  if (!open) {
    return null;
  }

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity, transform: [{ translateY }] },
            style,
          ]}
        >
          {children || (
            <View style={styles.innerContent}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Select an option</Text>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <X width={20} height={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={items}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <SelectItem
                    value={item.value}
                    disabled={item.disabled}
                    style={itemStyle}
                    textStyle={itemTextStyle}
                  >
                    <View style={styles.itemContent}>
                      {item.icon && <View style={styles.itemIcon}>{item.icon}</View>}
                      <Text style={mergeStyles(styles.itemText, itemTextStyle)}>
                        {item.label}
                      </Text>
                      {value === item.value && (
                        <Check width={16} height={16} color="#0ea5e9" />
                      )}
                    </View>
                  </SelectItem>
                )}
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

SelectContent.displayName = "SelectContent";

// Item component
interface SelectItemProps {
  value: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const SelectItem = React.forwardRef<TouchableOpacity, SelectItemProps>((
  { value, disabled = false, style, textStyle, children },
  ref
) => {
  const { onValueChange, value: selectedValue } = useSelectContext();
  const isSelected = selectedValue === value;
  
  const handlePress = () => {
    if (disabled) return;
    onValueChange?.(value);
  };

  return (
    <TouchableOpacity
      ref={ref}
      style={mergeStyles(
        styles.item,
        isSelected && styles.selectedItem,
        disabled && styles.disabledItem,
        style
      )}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled, selected: isSelected }}
    >
      {children || (
        <Text 
          style={mergeStyles(
            styles.itemText,
            isSelected && styles.selectedItemText,
            disabled && styles.disabledItemText,
            textStyle
          )}
        >
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
});

SelectItem.displayName = "SelectItem";

// Styles
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const CONTENT_MAX_HEIGHT = WINDOW_HEIGHT * 0.7;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    minHeight: 44,
  },
  triggerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    fontSize: 14,
    color: "#0f172a",
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  value: {
    fontSize: 14,
    color: "#0f172a",
    flex: 1,
  },
  placeholder: {
    color: "#94a3b8",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 8,
    maxHeight: CONTENT_MAX_HEIGHT,
    width: WINDOW_WIDTH,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  innerContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 16, // Extra padding for iOS home indicator
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  selectedItem: {
    backgroundColor: "rgba(14, 165, 233, 0.1)",
  },
  disabledItem: {
    opacity: 0.5,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#0f172a",
    flex: 1,
  },
  selectedItemText: {
    color: "#0ea5e9",
    fontWeight: "500",
  },
  disabledItemText: {
    color: "#94a3b8",
  },
});

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};

export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectContentProps,
  SelectItemProps,
  SelectItem as SelectItemType,
};
