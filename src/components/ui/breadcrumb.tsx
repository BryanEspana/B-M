import * as React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  ScrollView 
} from "react-native";
import { ChevronRight, MoreHorizontal } from "lucide-react-native";

// Helper function for merging styles
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

// Component Types
type BreadcrumbProps = {
  separator?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  accessible?: boolean;
  accessibilityLabel?: string;
};

type BreadcrumbListProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  horizontal?: boolean;
};

type BreadcrumbItemProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type BreadcrumbLinkProps = {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  onPress?: () => void;
  activeOpacity?: number;
};

type BreadcrumbPageProps = {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type BreadcrumbSeparatorProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type BreadcrumbEllipsisProps = {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

// Context for passing separator prop
const BreadcrumbContext = React.createContext<{
  separator: React.ReactNode;
}>({ separator: <ChevronRight size={14} color="#64748b" /> });

// Components
const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  separator = <ChevronRight size={14} color="#64748b" />,
  style,
  children,
  accessible = true,
  accessibilityLabel = "breadcrumb"
}) => {
  return (
    <BreadcrumbContext.Provider value={{ separator }}>
      <View 
        style={mergeStyles(styles.container, style)}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="header"
      >
        {children}
      </View>
    </BreadcrumbContext.Provider>
  );
};

const BreadcrumbList: React.FC<BreadcrumbListProps> = ({ 
  style, 
  children,
  horizontal = true
}) => {
  const Wrapper = horizontal ? ScrollView : View;
  const wrapperProps = horizontal ? { 
    horizontal: true, 
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: styles.scrollContent
  } : {};

  return (
    <Wrapper 
      style={mergeStyles(styles.list, style)} 
      {...wrapperProps}
    >
      {children}
    </Wrapper>
  );
};

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ style, children }) => {
  return (
    <View style={mergeStyles(styles.item, style)}>
      {children}
    </View>
  );
};

const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({ 
  style, 
  textStyle,
  children, 
  onPress,
  activeOpacity = 0.7
}) => {
  return (
    <TouchableOpacity 
      style={mergeStyles(styles.link, style)}
      onPress={onPress}
      activeOpacity={activeOpacity}
      accessibilityRole="link"
    >
      {typeof children === 'string' ? (
        <Text style={mergeStyles(styles.linkText, textStyle)}>
          {children}
        </Text>
      ) : children}
    </TouchableOpacity>
  );
};

const BreadcrumbPage: React.FC<BreadcrumbPageProps> = ({ style, textStyle, children }) => {
  return (
    <View 
      style={mergeStyles(styles.page, style)}
      accessibilityRole="text"
    >
      {typeof children === 'string' ? (
        <Text style={mergeStyles(styles.pageText, textStyle)}>
          {children}
        </Text>
      ) : children}
    </View>
  );
};

const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({ style, children }) => {
  const { separator } = React.useContext(BreadcrumbContext);

  return (
    <View 
      style={mergeStyles(styles.separator, style)}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    >
      {children || separator}
    </View>
  );
};

const BreadcrumbEllipsis: React.FC<BreadcrumbEllipsisProps> = ({ style, onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress } : {};

  return (
    <Wrapper 
      style={mergeStyles(styles.ellipsis, style)}
      accessibilityLabel="More breadcrumbs"
      accessibilityHint="Double tap to show more breadcrumbs"
      accessibilityRole={onPress ? "button" : "none"}
      {...wrapperProps}
    >
      <MoreHorizontal size={16} color="#64748b" />
    </Wrapper>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1, 
    alignItems: 'center',
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  link: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#64748b', // text-muted-foreground
  },
  page: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  pageText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#0f172a', // text-foreground
  },
  separator: {
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsis: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Add display names for debugging
Breadcrumb.displayName = "Breadcrumb";
BreadcrumbList.displayName = "BreadcrumbList";
BreadcrumbItem.displayName = "BreadcrumbItem";
BreadcrumbLink.displayName = "BreadcrumbLink";
BreadcrumbPage.displayName = "BreadcrumbPage";
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
