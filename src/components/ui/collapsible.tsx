import * as React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  LayoutChangeEvent,
  ViewProps,
} from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

type CollapsibleContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentHeight: number;
  setContentHeight: React.Dispatch<React.SetStateAction<number>>;
  animatedHeight: Animated.Value;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(
  undefined
);

function useCollapsibleContext() {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error(
      "Collapsible components must be used within a Collapsible component"
    );
  }
  return context;
}

interface CollapsibleProps {
  /**
   * Whether the collapsible is open
   */
  open?: boolean;
  /**
   * Function called when the open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Default open state when uncontrolled
   */
  defaultOpen?: boolean;
  /**
   * Whether to disable the collapsible
   */
  disabled?: boolean;
  /**
   * Children of the collapsible
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const Collapsible = React.forwardRef<View, CollapsibleProps>(
  (
    {
      open,
      onOpenChange,
      defaultOpen = false,
      disabled = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const [contentHeight, setContentHeight] = React.useState(0);
    const animatedHeight = React.useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

    // Handle controlled vs uncontrolled
    const openState = open !== undefined ? open : isOpen;

    // Update animation value when open state changes
    React.useEffect(() => {
      Animated.timing(animatedHeight, {
        toValue: openState ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [openState, animatedHeight]);

    // Handle open state changes
    const handleOpenChange = (value: React.SetStateAction<boolean>) => {
      if (disabled) return;

      const newValue = typeof value === 'function' 
        ? value(openState) 
        : value;

      if (open === undefined) {
        setIsOpen(newValue);
      }

      onOpenChange?.(newValue);
    };

    return (
      <CollapsibleContext.Provider
        value={{
          open: openState,
          setOpen: handleOpenChange,
          contentHeight,
          setContentHeight,
          animatedHeight,
        }}
      >
        <View
          ref={ref}
          style={mergeStyles(
            styles.container,
            style
          )}
          {...props}
        >
          {children}
        </View>
      </CollapsibleContext.Provider>
    );
  }
);

Collapsible.displayName = "Collapsible";

interface CollapsibleTriggerProps {
  /**
   * Whether to disable the trigger
   */
  disabled?: boolean;
  /**
   * Children of the trigger
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom press handler
   */
  onPress?: () => void;
}

const CollapsibleTrigger = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, CollapsibleTriggerProps>(
  ({ disabled = false, children, style, onPress, ...props }, ref) => {
    const { open, setOpen } = useCollapsibleContext();

    const handlePress = () => {
      if (disabled) return;
      
      // Toggle open state
      setOpen(!open);
      
      // Call custom press handler if provided
      onPress?.();
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={mergeStyles(styles.trigger, style)}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

CollapsibleTrigger.displayName = "CollapsibleTrigger";

interface CollapsibleContentProps extends ViewProps {
  /**
   * Children of the content
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Duration of the animation
   */
  animationDuration?: number;
}

const CollapsibleContent = React.forwardRef<View, CollapsibleContentProps>(
  ({ children, style, animationDuration = 200, ...props }, ref) => {
    const { open, setContentHeight, animatedHeight, contentHeight } = useCollapsibleContext();
    const contentRef = React.useRef<View>(null);

    // Combine refs
    const combinedRef = React.useMemo(() => {
      if (ref && typeof ref === 'function') {
        return (node: View | null) => {
          contentRef.current = node;
          ref(node);
        };
      } else if (ref) {
        return (node: View | null) => {
          contentRef.current = node;
          (ref as React.MutableRefObject<View | null>).current = node;
        };
      }
      return (node: View | null) => {
        contentRef.current = node;
      };
    }, [ref]);

    // Measure content height when layout changes
    const handleLayout = (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setContentHeight(height);
    };

    // Interpolate height for animation
    const height = animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, contentHeight],
    });

    return (
      <Animated.View
        style={[
          styles.contentWrapper,
          { height },
          !open && styles.contentHidden,
        ]}
      >
        <View
          ref={combinedRef}
          style={mergeStyles(styles.content, style)}
          onLayout={handleLayout}
          accessibilityLiveRegion="polite"
          {...props}
        >
          {children}
        </View>
      </Animated.View>
    );
  }
);

CollapsibleContent.displayName = "CollapsibleContent";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  trigger: {
    width: "100%",
  },
  contentWrapper: {
    width: "100%",
    overflow: "hidden",
  },
  contentHidden: {
    opacity: 0,
  },
  content: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
