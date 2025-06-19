import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { X } from "lucide-react-native";

// First we need to create a use-toast equivalent for React Native
// Let's define the toast types and context

// Toast types for different variants
type ToastVariant = "default" | "destructive" | "success";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
};

type ToasterProps = {
  toastPosition?: "top" | "bottom";
  toastOffset?: number;
  toastStyle?: StyleProp<ViewStyle>;
  toastTextStyle?: StyleProp<TextStyle>;
};

// Create context for managing toasts
type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Toast>) => void;
};

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => "",
  removeToast: () => {},
  updateToast: () => {},
});

// Custom hook for using toast
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

// Toast Provider component
export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  
  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...toast };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);
  
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  
  const updateToast = React.useCallback((id: string, toast: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);
  
  const contextValue = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      updateToast,
    }),
    [toasts, addToast, removeToast, updateToast]
  );
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

// ToastView component to display a single toast
const ToastView: React.FC<{
  toast: Toast;
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}> = ({ toast, onDismiss, style, textStyle }) => {
  // Animation for fade in/out
  const opacity = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDismiss = () => {
    // Fade out
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };
  
  // Get variant styles
  const getVariantStyle = () => {
    switch (toast.variant) {
      case "destructive":
        return styles.destructive;
      case "success":
        return styles.success;
      default:
        return {};
    }
  };
  
  return (
    <Animated.View style={[styles.toast, getVariantStyle(), { opacity }, style]}>
      <View style={styles.contentContainer}>
        {toast.title && (
          <Text style={[styles.title, textStyle]}>{toast.title}</Text>
        )}
        {toast.description && (
          <Text style={[styles.description, textStyle]}>{toast.description}</Text>
        )}
      </View>
      
      <View style={styles.actions}>
        {toast.action}
        
        <TouchableOpacity 
          onPress={handleDismiss}
          style={styles.closeButton}
          accessibilityLabel="Dismiss toast"
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <X size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Main Toaster component
export const Toaster: React.FC<ToasterProps> = ({
  toastPosition = "bottom",
  toastOffset = 16,
  toastStyle,
  toastTextStyle,
}) => {
  const { toasts, removeToast } = useToast();
  
  if (!toasts.length) return null;
  
  const positionStyle = {
    [toastPosition]: toastOffset,
  };
  
  return (
    <View style={[styles.container, positionStyle]}>
      {toasts.map((toast) => (
        <ToastView
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
          style={toastStyle}
          textStyle={toastTextStyle}
        />
      ))}  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
  },
  toast: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#94a3b8", // slate-400
  },
  destructive: {
    borderLeftColor: "#ef4444", // red-500
  },
  success: {
    borderLeftColor: "#10b981", // emerald-500
  },
  contentContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    color: "#0f172a", // slate-900
  },
  description: {
    fontSize: 12,
    color: "#64748b", // slate-500
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    padding: 4,
  },
});

Toaster.displayName = "Toaster";
