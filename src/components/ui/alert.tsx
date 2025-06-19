import * as React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

// Alert variants
type AlertVariant = "default" | "destructive";

// Create a function that returns different styles based on variant (similar to cva)
const getAlertVariantStyles = (variant: AlertVariant = "default"): {
  container: StyleProp<ViewStyle>;
  icon: StyleProp<ViewStyle>;
  content: StyleProp<ViewStyle>;
} => {
  const baseContainerStyle = styles.container;
  const baseIconStyle = styles.icon;
  const baseContentStyle = styles.content;
  
  switch (variant) {
    case "destructive":
      return {
        container: mergeStyles(baseContainerStyle, styles.destructiveContainer),
        icon: mergeStyles(baseIconStyle, styles.destructiveIcon),
        content: baseContentStyle,
      };
    default:
      return {
        container: baseContainerStyle,
        icon: baseIconStyle,
        content: baseContentStyle,
      };
  }
};

// Component Types
type AlertProps = {
  variant?: AlertVariant;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  icon?: React.ReactNode;
};

type AlertTitleProps = {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type AlertDescriptionProps = {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

// Alert Context to handle icon placement
const AlertContext = React.createContext<{
  hasIcon: boolean;
}>({ hasIcon: false });

// Main Components
const Alert: React.FC<AlertProps> = ({ 
  variant = "default", 
  style, 
  children, 
  icon 
}) => {
  const variantStyles = getAlertVariantStyles(variant);
  const hasIcon = !!icon;
  
  return (
    <AlertContext.Provider value={{ hasIcon }}>
      <View
        style={mergeStyles(variantStyles.container, style)}
        accessibilityRole="alert"
      >
        {icon && (
          <View style={variantStyles.icon}>
            {icon}
          </View>
        )}
        <View style={[variantStyles.content, hasIcon && styles.contentWithIcon]}>
          {children}
        </View>
      </View>
    </AlertContext.Provider>
  );
};

const AlertTitle: React.FC<AlertTitleProps> = ({ style, children }) => {
  return (
    <Text style={mergeStyles(styles.title, style)}>
      {children}
    </Text>
  );
};

const AlertDescription: React.FC<AlertDescriptionProps> = ({ style, children }) => {
  return (
    <View style={styles.descriptionContainer}>
      {typeof children === 'string' ? (
        <Text style={mergeStyles(styles.description, style)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    backgroundColor: '#ffffff',
    position: 'relative',
    flexDirection: 'row',
  },
  destructiveContainer: {
    borderColor: 'rgba(239, 68, 68, 0.5)', // text-destructive with 50% opacity
  },
  icon: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  destructiveIcon: {
    color: '#ef4444', // text-destructive
  },
  content: {
    flex: 1,
  },
  contentWithIcon: {
    paddingLeft: 28, // Give space for the icon
  },
  title: {
    marginBottom: 4,
    fontWeight: '500',
    fontSize: 16,
  },
  descriptionContainer: {
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b', // A slate color
  },
});

// Add display names for debugging
Alert.displayName = "Alert";
AlertTitle.displayName = "AlertTitle";
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };