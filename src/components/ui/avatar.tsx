import * as React from "react";
import {
  View,
  Image as RNImage,
  Text,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  ImageStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === 'object' ? style : {}),
  }), {});
};

// Component Types
type AvatarProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type AvatarImageProps = {
  source: ImageSourcePropType;
  alt?: string;
  style?: StyleProp<ImageStyle>;
  onLoadingStatusChange?: (status: "loading" | "error" | "loaded") => void;
};

type AvatarFallbackProps = {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  delayMs?: number;
  children?: React.ReactNode;
};

// Context to handle image loading state
const AvatarContext = React.createContext<{
  isImageLoaded: boolean;
  onLoadingStatusChange: (status: "loading" | "error" | "loaded") => void;
}>({
  isImageLoaded: false,
  onLoadingStatusChange: () => {},
});

// Main Components
const Avatar: React.FC<AvatarProps> = ({ style, children }) => {
  const [imageLoadingStatus, setImageLoadingStatus] = React.useState<"loading" | "error" | "loaded">("loading");
  
  const handleLoadingStatusChange = React.useCallback((status: "loading" | "error" | "loaded") => {
    setImageLoadingStatus(status);
  }, []);
  
  const isImageLoaded = imageLoadingStatus === "loaded";
  
  return (
    <AvatarContext.Provider value={{ isImageLoaded, onLoadingStatusChange: handleLoadingStatusChange }}>
      <View style={mergeStyles(styles.container, style)}>
        {children}
      </View>
    </AvatarContext.Provider>
  );
};

const AvatarImage: React.FC<AvatarImageProps> = ({ source, alt, style, onLoadingStatusChange }) => {
  const { onLoadingStatusChange: contextOnLoadingStatusChange } = React.useContext(AvatarContext);
  
  const handleLoad = React.useCallback(() => {
    contextOnLoadingStatusChange("loaded");
    onLoadingStatusChange?.("loaded");
  }, [contextOnLoadingStatusChange, onLoadingStatusChange]);
  
  const handleError = React.useCallback(() => {
    contextOnLoadingStatusChange("error");
    onLoadingStatusChange?.("error");
  }, [contextOnLoadingStatusChange, onLoadingStatusChange]);
  
  React.useEffect(() => {
    contextOnLoadingStatusChange("loading");
    onLoadingStatusChange?.("loading");
  }, [source, contextOnLoadingStatusChange, onLoadingStatusChange]);
  
  return (
    <RNImage
      source={source}
      accessibilityLabel={alt}
      style={mergeStyles(styles.image, style)}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ 
  style,
  textStyle,
  delayMs = 0,
  children 
}) => {
  const [shouldShow, setShouldShow] = React.useState(delayMs === 0);
  const { isImageLoaded } = React.useContext(AvatarContext);
  
  React.useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delayMs);
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [delayMs]);
  
  if (isImageLoaded || !shouldShow) {
    return null;
  }
  
  return (
    <View style={mergeStyles(styles.fallback, style)}>
      {typeof children === 'string' ? (
        <Text style={mergeStyles(styles.fallbackText, textStyle)}>
          {children}
        </Text>
      ) : children || <ActivityIndicator size="small" color="#666" />}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0', // bg-muted
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  fallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#e2e8f0', // bg-muted
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b', // text-muted-foreground
  },
});

// Add display names for debugging
Avatar.displayName = "Avatar";
AvatarImage.displayName = "AvatarImage";
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
