import * as React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform
} from "react-native";

// Helper function for style merging (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

// Types
type AlertDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

type AlertDialogTriggerProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type AlertDialogContentProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type AlertDialogHeaderProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type AlertDialogFooterProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type AlertDialogTitleProps = {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type AlertDialogDescriptionProps = {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type AlertDialogActionProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type AlertDialogCancelProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

// Context for managing dialog state
const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ 
  open: false, 
  setOpen: () => {} 
});

// Main components
const AlertDialog: React.FC<AlertDialogProps> = ({ 
  open = false,
  onOpenChange,
  children 
}) => {
  const [isOpen, setIsOpen] = React.useState(open);
  
  // Sync with controlled state
  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  const handleOpenChange = React.useCallback((value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  }, [onOpenChange]);
  
  return (
    <AlertDialogContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({ 
  onPress, 
  style, 
  children 
}) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  
  const handlePress = React.useCallback(() => {
    setOpen(true);
    onPress?.();
  }, [setOpen, onPress]);
  
  return (
    <TouchableOpacity 
      style={style} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ 
  style, 
  children 
}) => {
  const { open, setOpen } = React.useContext(AlertDialogContext);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  
  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [open, fadeAnim, scaleAnim]);

  if (!open) {
    return null;
  }
  
  return (
    <Modal
      transparent
      visible={open}
      animationType="none"
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={() => setOpen(false)}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <Animated.View 
              style={[
                styles.content,
                { transform: [{ scale: scaleAnim }] },
                style
              ]}
            >
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const AlertDialogOverlay: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  return (
    <Animated.View style={[styles.overlay, style]} />
  );
};

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ style, children }) => {
  return (
    <View style={mergeStyles(styles.header, style)}>
      {children}
    </View>
  );
};

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ style, children }) => {
  return (
    <View style={mergeStyles(styles.footer, style)}>
      {children}
    </View>
  );
};

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ style, children }) => {
  return (
    <Text style={mergeStyles(styles.title, style)}>
      {children}
    </Text>
  );
};

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ style, children }) => {
  return (
    <Text style={mergeStyles(styles.description, style)}>
      {children}
    </Text>
  );
};

// Button style helper - similar to buttonVariants
const getButtonStyles = (variant: 'default' | 'outline' = 'default') => {
  if (variant === 'outline') {
    return {
      container: styles.cancelButton,
      text: styles.cancelButtonText,
    };
  }
  return {
    container: styles.actionButton,
    text: styles.actionButtonText,
  };
};

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ 
  onPress, 
  style, 
  textStyle, 
  children 
}) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  
  const handlePress = React.useCallback(() => {
    setOpen(false);
    onPress?.();
  }, [setOpen, onPress]);
  
  const buttonStyles = getButtonStyles('default');
  
  return (
    <TouchableOpacity 
      style={mergeStyles(buttonStyles.container, style)}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <Text style={mergeStyles(buttonStyles.text, textStyle)}>
          {children}
        </Text>
      ) : (children)}
    </TouchableOpacity>
  );
};

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ 
  onPress, 
  style, 
  textStyle, 
  children 
}) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  
  const handlePress = React.useCallback(() => {
    setOpen(false);
    onPress?.();
  }, [setOpen, onPress]);
  
  const buttonStyles = getButtonStyles('outline');
  
  return (
    <TouchableOpacity 
      style={mergeStyles(buttonStyles.container, style)}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <Text style={mergeStyles(buttonStyles.text, textStyle)}>
          {children}
        </Text>
      ) : (children)}
    </TouchableOpacity>
  );
};

// Create an empty component for AlertDialogPortal to maintain API compatibility
const AlertDialogPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Styles
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    width,
    height,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: width - 40,
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
    alignItems: Platform.OS === 'android' ? 'flex-start' : 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  footer: {
    flexDirection: Platform.OS === 'android' ? 'row-reverse' : 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#ec4899', // Pink color from your previous example
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

// Add display names for debugging
AlertDialog.displayName = "AlertDialog";
AlertDialogTrigger.displayName = "AlertDialogTrigger";
AlertDialogContent.displayName = "AlertDialogContent";
AlertDialogOverlay.displayName = "AlertDialogOverlay";
AlertDialogHeader.displayName = "AlertDialogHeader";
AlertDialogFooter.displayName = "AlertDialogFooter";
AlertDialogTitle.displayName = "AlertDialogTitle";
AlertDialogDescription.displayName = "AlertDialogDescription";
AlertDialogAction.displayName = "AlertDialogAction";
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};