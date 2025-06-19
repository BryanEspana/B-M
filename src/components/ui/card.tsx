import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle
} from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

type CardProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type CardHeaderProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type CardTitleProps = {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type CardDescriptionProps = {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type CardContentProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type CardFooterProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(({ style, children, ...props }, ref) => (
  <View 
    ref={ref}
    style={mergeStyles(styles.card, style)}
    {...props}
  >
    {children}
  </View>
));

Card.displayName = "Card";

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, CardHeaderProps>(({ style, children, ...props }, ref) => (
  <View 
    ref={ref}
    style={mergeStyles(styles.cardHeader, style)}
    {...props}
  >
    {children}
  </View>
));

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<React.ElementRef<typeof Text>, CardTitleProps>(({ style, children, ...props }, ref) => (
  <Text 
    ref={ref}
    style={mergeStyles(styles.cardTitle, style)}
    {...props}
  >
    {children}
  </Text>
));

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<React.ElementRef<typeof Text>, CardDescriptionProps>(({ style, children, ...props }, ref) => (
  <Text 
    ref={ref}
    style={mergeStyles(styles.cardDescription, style)}
    {...props}
  >
    {children}
  </Text>
));

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<React.ElementRef<typeof View>, CardContentProps>(({ style, children, ...props }, ref) => (
  <View 
    ref={ref}
    style={mergeStyles(styles.cardContent, style)}
    {...props}
  >
    {children}
  </View>
));

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<React.ElementRef<typeof View>, CardFooterProps>(({ style, children, ...props }, ref) => (
  <View 
    ref={ref}
    style={mergeStyles(styles.cardFooter, style)}
    {...props}
  >
    {children}
  </View>
));

CardFooter.displayName = "CardFooter";

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: '#ffffff', // bg-card
    borderWidth: 1,
    borderColor: '#e2e8f0', // border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    padding: 24,
    gap: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
    color: '#0f172a', // text color
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b', // text-muted-foreground
  },
  cardContent: {
    padding: 24,
    paddingTop: 0,
  },
  cardFooter: {
    padding: 24,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
