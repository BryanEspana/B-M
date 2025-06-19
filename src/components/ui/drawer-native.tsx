import * as React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  TextStyle,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

// Drawer Context
type DrawerContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animatedPosition: Animated.Value;
  animatedOpacity: Animated.Value;
};

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);

function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within a Drawer component");
  }
  return context;
}

// Drawer Root
interface DrawerProps {
  /**
   * Whether the drawer is open
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
   * Whether to scale the background when drawer is open
   */
  shouldScaleBackground?: boolean;
  /**
   * Children of the drawer
   */
  children: React.ReactNode;
}

const Drawer = ({
  open,
  onOpenChange,
  defaultOpen = false,
  shouldScaleBackground = true,
  children,
}: DrawerProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const animatedPosition = React.useRef(new Animated.Value(0)).current;
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;
  
  // Background scale animation
  const backgroundScale = shouldScaleBackground
    ? animatedPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.93],
      })
    : 1;
  
  // Handle controlled vs uncontrolled
  const openState = open !== undefined ? open : isOpen;

  // Animate when openState changes
  React.useEffect(() => {
    if (openState) {
      Animated.parallel([
        Animated.spring(animatedPosition, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 5,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedPosition, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [openState, animatedPosition, animatedOpacity]);

  // Handle open state changes
  const handleOpenChange = (value: React.SetStateAction<boolean>) => {
    // Handle both direct value and function update patterns
    const newValue = typeof value === "function" 
      ? value(openState) 
      : value;

    if (open === undefined) {
      setIsOpen(newValue);
    }

    onOpenChange?.(newValue);
  };

  return (
    <DrawerContext.Provider
      value={{
        open: openState,
        setOpen: handleOpenChange,
        animatedPosition,
        animatedOpacity,
      }}
    >
      <View style={styles.container}>
        {shouldScaleBackground && (
          <Animated.View
            style={[
              styles.scaleContainer,
              {
                transform: [
                  { scale: backgroundScale },
                ],
              },
            ]}
          >
            <View style={styles.backgroundContent}>
              {children}
            </View>
          </Animated.View>
        )}
        
        {!shouldScaleBackground && children}
      </View>
    </DrawerContext.Provider>
  );
};

// Drawer Trigger
interface DrawerTriggerProps {
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
  /**
   * Whether to disable the trigger
   */
  disabled?: boolean;
}

const DrawerTrigger = ({
  children,
  style,
  onPress,
  disabled = false,
  ...props
}: DrawerTriggerProps) => {
  const { open, setOpen } = useDrawerContext();

  const handlePress = () => {
    if (disabled) return;
    
    // Toggle open state
    setOpen(!open);
    
    // Call custom press handler if provided
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={mergeStyles(styles.trigger, style)}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// Drawer Portal (Modal)
interface DrawerPortalProps {
  /**
   * Children of the portal
   */
  children: React.ReactNode;
}

const DrawerPortal = ({ children }: DrawerPortalProps) => {
  const { open } = useDrawerContext();
  
  return (
    <Modal
      transparent={true}
      visible={open}
      animationType="none"
      statusBarTranslucent
    >
      {children}
    </Modal>
  );
};

// Drawer Overlay
interface DrawerOverlayProps {
  /**
   * Style for the overlay
   */
  style?: StyleProp<ViewStyle>;
}

const DrawerOverlay = ({ style }: DrawerOverlayProps) => {
  const { animatedOpacity, setOpen } = useDrawerContext();

  return (
    <TouchableWithoutFeedback onPress={() => setOpen(false)}>
      <Animated.View
        style={[
          styles.overlay,
          { opacity: animatedOpacity },
          style,
        ]}
      />
    </TouchableWithoutFeedback>
  );
};

// Drawer Close
interface DrawerCloseProps {
  /**
   * Children of the close button
   */
  children?: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom press handler
   */
  onPress?: () => void;
}

const DrawerClose = ({
  children,
  style,
  onPress,
  ...props
}: DrawerCloseProps) => {
  const { setOpen } = useDrawerContext();

  const handlePress = () => {
    // Close the drawer
    setOpen(false);
    
    // Call custom press handler if provided
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={mergeStyles(styles.close, style)}
      onPress={handlePress}
      accessibilityRole="button"
      {...props}
    >
      {children || <Text style={styles.closeText}>Close</Text>}
    </TouchableOpacity>
  );
};

// Drawer Content
interface DrawerContentProps {
  /**
   * Children of the content
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const DrawerContent = ({ children, style, ...props }: DrawerContentProps) => {
  const { animatedPosition, setOpen } = useDrawerContext();
  const { height: screenHeight } = Dimensions.get('window');
  
  // Configure pan responder for swipe gestures
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          const newValue = 1 - (gestureState.dy / (screenHeight / 2));
          animatedPosition.setValue(Math.max(0, Math.min(1, newValue)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped down far enough, close the drawer
        if (gestureState.dy > screenHeight * 0.2 || gestureState.vy > 0.5) {
          setOpen(false);
        } else {
          // Otherwise, snap back to open position
          Animated.spring(animatedPosition, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 5,
          }).start();
        }
      },
    })
  ).current;

  // Interpolate position for the drawer
  const translateY = animatedPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ translateY }],
          },
          style,
        ]}
        {...panResponder.panHandlers}
        {...props}
      >
        <View style={styles.dragIndicator} />
        {children}
      </Animated.View>
    </DrawerPortal>
  );
};

// Drawer Header
interface DrawerHeaderProps {
  /**
   * Children of the header
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const DrawerHeader = ({ children, style, ...props }: DrawerHeaderProps) => (
  <View style={mergeStyles(styles.header, style)} {...props}>
    {children}
  </View>
);

// Drawer Footer
interface DrawerFooterProps {
  /**
   * Children of the footer
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const DrawerFooter = ({ children, style, ...props }: DrawerFooterProps) => (
  <View style={mergeStyles(styles.footer, style)} {...props}>
    {children}
  </View>
);

// Drawer Title
interface DrawerTitleProps {
  /**
   * Content of the title
   */
  children: React.ReactNode;
  /**
   * Style for the text
   */
  style?: StyleProp<TextStyle>;
}

const DrawerTitle = ({ children, style, ...props }: DrawerTitleProps) => (
  <Text style={mergeStyles(styles.title, style)} {...props}>
    {children}
  </Text>
);

// Drawer Description
interface DrawerDescriptionProps {
  /**
   * Content of the description
   */
  children: React.ReactNode;
  /**
   * Style for the text
   */
  style?: StyleProp<TextStyle>;
}

const DrawerDescription = ({ children, style, ...props }: DrawerDescriptionProps) => (
  <Text style={mergeStyles(styles.description, style)} {...props}>
    {children}
  </Text>
);

// Styles
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scaleContainer: {
    flex: 1,
  },
  backgroundContent: {
    flex: 1,
  },
  trigger: {
    // Add your trigger styles here
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  contentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 20, // Extra padding for iOS home indicator
  },
  dragIndicator: {
    width: 50,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  close: {
    alignSelf: "flex-end",
    padding: 12,
  },
  closeText: {
    color: "#6b7280",
    fontWeight: "500",
  },
  header: {
    padding: 16,
    borderBottomColor: "#f3f4f6",
    borderBottomWidth: 1,
  },
  footer: {
    padding: 16,
    borderTopColor: "#f3f4f6",
    borderTopWidth: 1,
    marginTop: "auto",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
  },
});

// Set display names
Drawer.displayName = "Drawer";
DrawerTrigger.displayName = "DrawerTrigger";
DrawerPortal.displayName = "DrawerPortal";
DrawerOverlay.displayName = "DrawerOverlay";
DrawerContent.displayName = "DrawerContent";
DrawerClose.displayName = "DrawerClose";
DrawerHeader.displayName = "DrawerHeader";
DrawerFooter.displayName = "DrawerFooter";
DrawerTitle.displayName = "DrawerTitle";
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
