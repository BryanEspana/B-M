import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
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

// Tab context types
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: "horizontal" | "vertical";
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// Root component
interface TabsProps {
  /**
   * The controlled value of the tab to activate
   */
  value?: string;
  /**
   * The default value of the tab to activate (uncontrolled)
   */
  defaultValue?: string;
  /**
   * Callback when the active tab changes
   */
  onValueChange?: (value: string) => void;
  /**
   * The orientation of the tabs
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Children components
   */
  children: React.ReactNode;
}

const Tabs = React.forwardRef<View, TabsProps>((
  {
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    style,
    children,
  },
  ref
) => {
  // State for uncontrolled usage
  const [tabValue, setTabValue] = React.useState<string>(defaultValue || "");
  
  // Controlled or uncontrolled value
  const activeValue = value !== undefined ? value : tabValue;
  
  // Handle tab change
  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setTabValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);
  
  // Context value
  const contextValue = React.useMemo(() => ({
    value: activeValue,
    onValueChange: handleValueChange,
    orientation,
  }), [activeValue, handleValueChange, orientation]);

  return (
    <TabsContext.Provider value={contextValue}>
      <View 
        ref={ref} 
        style={mergeStyles(
          styles.container,
          orientation === "vertical" && styles.verticalContainer,
          style
        )}
      >
        {children}
      </View>
    </TabsContext.Provider>
  );
});

Tabs.displayName = "Tabs";

// Tab list component
interface TabsListProps {
  /**
   * Custom style for the tab list
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Whether to make tabs scrollable horizontally
   */
  scrollable?: boolean;
  /**
   * Children components
   */
  children: React.ReactNode;
}

// Using any for the ref type to accommodate both ScrollView and View
const TabsList = React.forwardRef<any, TabsListProps>((
  {
    style,
    scrollable = true,
    children,
  },
  ref
) => {
  const { orientation } = useTabsContext();

  // Render content based on orientation and scrollable prop
  const content = (
    <View 
      style={mergeStyles(
        styles.list,
        orientation === "vertical" && styles.verticalList,
        style
      )}
    >
      {children}
    </View>
  );

  // Wrap in ScrollView if scrollable
  if (scrollable && orientation === "horizontal") {
    return (
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View ref={ref}>
      {content}
    </View>
  );
});

TabsList.displayName = "TabsList";

// Tab trigger component
interface TabsTriggerProps {
  /**
   * Value of this trigger's tab
   */
  value: string;
  /**
   * Whether the trigger is disabled
   */
  disabled?: boolean;
  /**
   * Custom style for the trigger
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Active style for the trigger when selected
   */
  activeStyle?: StyleProp<ViewStyle>;
  /**
   * Text style
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Active text style when selected
   */
  activeTextStyle?: StyleProp<TextStyle>;
  /**
   * Whether to show an animated indicator
   */
  showIndicator?: boolean;
  /**
   * Custom indicator style
   */
  indicatorStyle?: StyleProp<ViewStyle>;
  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;
  /**
   * Tab content
   */
  children: React.ReactNode;
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, TabsTriggerProps>((
  {
    value,
    disabled = false,
    style,
    activeStyle,
    textStyle,
    activeTextStyle,
    showIndicator = true,
    indicatorStyle,
    leftIcon,
    rightIcon,
    children,
  },
  ref
) => {
  const { value: activeValue, onValueChange, orientation } = useTabsContext();
  const isActive = activeValue === value;
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const indicatorAnim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;
  
  // Update animation when active state changes
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(indicatorAnim, {
        toValue: isActive ? 1 : 0,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      })
    ]).start();
  }, [isActive, fadeAnim, indicatorAnim]);
  
  // Handle press
  const handlePress = () => {
    if (disabled) return;
    onValueChange(value);
  };
  
  // Indicator position based on orientation
  const indicatorPosition = {
    width: orientation === "horizontal" ? indicatorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    }) : 3,
    height: orientation === "vertical" ? indicatorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    }) : 3,
    [orientation === "horizontal" ? "bottom" : "right"]: 0,
    [orientation === "horizontal" ? "left" : "top"]: 0,
    backgroundColor: "#0ea5e9", // primary color
  };

  return (
    <TouchableOpacity
      ref={ref}
      style={mergeStyles(
        styles.trigger,
        orientation === "vertical" && styles.verticalTrigger,
        isActive && styles.activeTrigger,
        disabled && styles.disabledTrigger,
        style,
        isActive && activeStyle
      )}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive, disabled }}
    >
      <View style={styles.triggerContent}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        {typeof children === "string" ? (
          <Text
            style={mergeStyles(
              styles.triggerText,
              textStyle,
              isActive && styles.activeTriggerText,
              isActive && activeTextStyle
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      
      {showIndicator && isActive && (
        <Animated.View
          style={mergeStyles(
            styles.indicator,
            orientation === "vertical" && styles.verticalIndicator,
            indicatorPosition,
            indicatorStyle
          )}
        />
      )}
    </TouchableOpacity>
  );
});

TabsTrigger.displayName = "TabsTrigger";

// Tab content component
interface TabsContentProps {
  /**
   * Value of the tab this content belongs to
   */
  value: string;
  /**
   * Whether to force render even when not active
   */
  forceMount?: boolean;
  /**
   * Custom style for the content container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Content
   */
  children: React.ReactNode;
}

const TabsContent = React.forwardRef<View, TabsContentProps>((
  {
    value,
    forceMount = false,
    style,
    children,
  },
  ref
) => {
  const { value: activeValue } = useTabsContext();
  const isActive = activeValue === value;
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const translateAnim = React.useRef(new Animated.Value(isActive ? 0 : 10)).current;
  
  // Update animation when active state changes
  React.useEffect(() => {
    if (isActive || forceMount) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: isActive ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: isActive ? 0 : 10,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isActive, fadeAnim, translateAnim, forceMount]);
  
  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <Animated.View
      ref={ref}
      style={mergeStyles(
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
          display: isActive ? "flex" : "none",
        },
        style
      )}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      {children}
    </Animated.View>
  );
});

TabsContent.displayName = "TabsContent";

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verticalContainer: {
    flexDirection: "row",
  },
  list: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0", // border color
  },
  verticalList: {
    flexDirection: "column",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0", // border color
    borderBottomWidth: 0,
    width: 150, // Default width for vertical tabs list
  },
  scrollContainer: {
    flexGrow: 1,
  },
  trigger: {
    padding: 12,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  verticalTrigger: {
    alignItems: "flex-start",
    minWidth: 120,
    width: "100%",
  },
  activeTrigger: {
    backgroundColor: "transparent",
  },
  disabledTrigger: {
    opacity: 0.5,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#64748b", // muted foreground
  },
  activeTriggerText: {
    fontWeight: "500",
    color: "#0f172a", // foreground
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    backgroundColor: "#0ea5e9", // primary color
    height: 3,
    left: 0,
    right: 0,
    bottom: 0,
  },
  verticalIndicator: {
    height: "auto",
    width: 3,
    top: 0,
    bottom: 0,
    left: "auto",
    right: 0,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
});

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};

export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
};
