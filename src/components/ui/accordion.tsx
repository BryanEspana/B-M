import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { ChevronDown } from "lucide-react-native";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

// Types
type AccordionProps = {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
};

type AccordionItemProps = {
  value: string;
  children: React.ReactNode;
  style?: any;
};

type AccordionTriggerProps = {
  children: React.ReactNode;
  style?: any;
  activeStyle?: any;
};

type AccordionContentProps = {
  children: React.ReactNode;
  style?: any;
};

// Context to manage accordion state
const AccordionContext = React.createContext<{
  value: string | string[];
  toggleItem: (itemValue: string) => void;
  isItemOpen: (itemValue: string) => boolean;
} | null>(null);

const AccordionItemContext = React.createContext<{
  itemValue: string;
  isOpen: boolean;
} | null>(null);

// Main Components
const Accordion: React.FC<AccordionProps> = ({
  type = "single",
  defaultValue = type === "single" ? "" : [],
  value: controlledValue,
  onValueChange,
  children,
}) => {
  const [value, setValue] = React.useState<string | string[]>(defaultValue);
  
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : value;
  
  const isItemOpen = React.useCallback((itemValue: string) => {
    if (Array.isArray(currentValue)) {
      return currentValue.includes(itemValue);
    }
    return currentValue === itemValue;
  }, [currentValue]);
  
  const toggleItem = React.useCallback((itemValue: string) => {
    const newValue = (() => {
      if (type === "single") {
        return currentValue === itemValue ? "" : itemValue;
      } else {
        if (Array.isArray(currentValue)) {
          return currentValue.includes(itemValue)
            ? currentValue.filter(v => v !== itemValue)
            : [...currentValue, itemValue];
        }
        return [itemValue];
      }
    })();
    
    if (!isControlled) {
      setValue(newValue);
    }
    
    onValueChange?.(newValue);
    
    // Apply layout animation for smooth transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [currentValue, type, isControlled, onValueChange]);
  
  return (
    <AccordionContext.Provider value={{ value: currentValue, toggleItem, isItemOpen }}>
      <View>{children}</View>
    </AccordionContext.Provider>
  );
};

const AccordionItem: React.FC<AccordionItemProps> = ({ value: itemValue, children, style }) => {
  const context = React.useContext(AccordionContext);
  
  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion");
  }
  
  const isOpen = context.isItemOpen(itemValue);
  
  return (
    <AccordionItemContext.Provider value={{ itemValue, isOpen }}>
      <View style={mergeStyles(styles.item, style)}>
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ children, style, activeStyle }) => {
  const accordionContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!accordionContext || !itemContext) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }
  
  const { toggleItem } = accordionContext;
  const { itemValue, isOpen } = itemContext;
  
  // Animation for rotation
  const rotateAnimation = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotateAnimation]);
  
  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => toggleItem(itemValue)}
      style={mergeStyles(
        styles.trigger,
        style,
        isOpen && activeStyle
      )}
    >
      <View style={styles.triggerContent}>
        {typeof children === 'string' ? (
          <Text style={styles.triggerText}>{children}</Text>
        ) : (
          children
        )}
        <Animated.View style={animatedStyle}>
          <ChevronDown size={18} color="#666" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const AccordionContent: React.FC<AccordionContentProps> = ({ children, style }) => {
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }
  
  const { isOpen } = itemContext;
  const [height] = React.useState(new Animated.Value(0));
  const [contentHeight, setContentHeight] = React.useState<number | null>(null);
  
  // This is the collapsible content section
  if (!isOpen) {
    return null;
  }
  
  return (
    <View 
      style={mergeStyles(styles.content, style)}
      onLayout={(event) => {
        if (contentHeight === null) {
          setContentHeight(event.nativeEvent.layout.height);
        }
      }}
    >
      <View style={styles.contentInner}>
        {children}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  trigger: {
    paddingVertical: 16,
  },
  triggerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    overflow: 'hidden',
  },
  contentInner: {
    paddingBottom: 16,
  },
});

// Add display names for debugging
AccordionItem.displayName = "AccordionItem";
AccordionTrigger.displayName = "AccordionTrigger";
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };