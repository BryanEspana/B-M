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
  Pressable,
  Platform,
  TouchableWithoutFeedback,
  TextStyle,
} from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

// Dialog Context
type DialogContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contentHeight: number;
  setContentHeight: React.Dispatch<React.SetStateAction<number>>;
  animatedOpacity: Animated.Value;
  animatedScale: Animated.Value;
};

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog component");
  }
  return context;
}

// Dialog Root
interface DialogProps {
  /**
   * Whether the dialog is open
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
   * Children of the dialog
   */
  children: React.ReactNode;
}

const Dialog = ({
  open,
  onOpenChange,
  defaultOpen = false,
  children,
}: DialogProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [contentHeight, setContentHeight] = React.useState(0);
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;
  const animatedScale = React.useRef(new Animated.Value(0.9)).current;

  // Handle controlled vs uncontrolled
  const openState = open !== undefined ? open : isOpen;

  // Animate when openState changes
  React.useEffect(() => {
    if (openState) {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(animatedScale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 5,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [openState, animatedOpacity, animatedScale]);

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
    <DialogContext.Provider
      value={{
        open: openState,
        setOpen: handleOpenChange,
        contentHeight,
        setContentHeight,
        animatedOpacity,
        animatedScale,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

// Dialog Trigger
interface DialogTriggerProps {
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

const DialogTrigger = ({
  disabled = false,
  children,
  style,
  onPress,
  ...props
}: DialogTriggerProps) => {
  const { open, setOpen } = useDialogContext();

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

// Dialog Portal (Modal)
interface DialogPortalProps {
  /**
   * Children of the portal
   */
  children: React.ReactNode;
}

const DialogPortal = ({ children }: DialogPortalProps) => {
  const { open } = useDialogContext();
  
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

// Dialog Overlay
interface DialogOverlayProps {
  /**
   * Style for the overlay
   */
  style?: StyleProp<ViewStyle>;
}

const DialogOverlay = ({ style }: DialogOverlayProps) => {
  const { animatedOpacity, setOpen } = useDialogContext();

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

// Dialog Content
interface DialogContentProps {
  /**
   * Children of the content
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const DialogContent = ({
  children,
  style,
  ...props
}: DialogContentProps) => {
  const { animatedOpacity, animatedScale } = useDialogContext();

  return (
    <DialogPortal>
      <DialogOverlay />
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedOpacity,
              transform: [{ scale: animatedScale }],
            },
            style,
          ]}
          {...props}
        >
          {children}
        </Animated.View>
      </View>
    </DialogPortal>
  );
};

// Dialog Close
interface DialogCloseProps {
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

const DialogClose = ({
  children,
  style,
  onPress,
  ...props
}: DialogCloseProps) => {
  const { setOpen } = useDialogContext();

  const handlePress = () => {
    // Close the dialog
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
      {children || <Text style={styles.closeIcon}>✕</Text>}
    </TouchableOpacity>
  );
};

// Dialog Header
interface DialogHeaderProps {
  /**
   * Children of the header
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const DialogHeader = ({ children, style, ...props }: DialogHeaderProps) => (
  <View style={mergeStyles(styles.header, style)} {...props}>
    {children}
  </View>
);

// Dialog Footer
interface DialogFooterProps {
  /**
   * Children of the footer
   */
  children: React.ReactNode;
  /**
   * Style for the container
   */
  style?: StyleProp<ViewStyle>;
}

const DialogFooter = ({ children, style, ...props }: DialogFooterProps) => (
  <View style={mergeStyles(styles.footer, style)} {...props}>
    {children}
  </View>
);

// Dialog Title
interface DialogTitleProps {
  /**
   * Content of the title
   */
  children: React.ReactNode;
  /**
   * Style for the text
   */
  style?: StyleProp<TextStyle>;
}

const DialogTitle = ({ children, style, ...props }: DialogTitleProps) => (
  <Text style={mergeStyles(styles.title, style)} {...props}>
    {children}
  </Text>
);

// Dialog Description
interface DialogDescriptionProps {
  /**
   * Content of the description
   */
  children: React.ReactNode;
  /**
   * Style for the text
   */
  style?: StyleProp<TextStyle>;
}

const DialogDescription = ({ children, style, ...props }: DialogDescriptionProps) => (
  <Text style={mergeStyles(styles.description, style)} {...props}>
    {children}
  </Text>
);

// Styles
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    width: screenWidth > 500 ? 480 : screenWidth - 32,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  close: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
});

// Set display names
Dialog.displayName = "Dialog";
DialogTrigger.displayName = "DialogTrigger";
DialogPortal.displayName = "DialogPortal";
DialogOverlay.displayName = "DialogOverlay";
DialogContent.displayName = "DialogContent";
DialogClose.displayName = "DialogClose";
DialogHeader.displayName = "DialogHeader";
DialogFooter.displayName = "DialogFooter";
DialogTitle.displayName = "DialogTitle";
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
