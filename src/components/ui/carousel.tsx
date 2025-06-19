import * as React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";

import { Button } from "./button";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

// Types
type CarouselOptions = {
  align?: "start" | "center" | "end";
  loop?: boolean;
  dragFree?: boolean;
  skipSnaps?: boolean;
  containScroll?: "trimSnaps" | "keepSnaps";
};

type CarouselPlugin = {
  name: string;
  options?: Record<string, any>;
};

type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (index: number) => void;
  selectedIndex: number;
};

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin[];
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

type CarouselContextProps = {
  carouselRef: React.RefObject<ScrollView | null>;
  api: CarouselApi | null;
  opts?: CarouselOptions;
  orientation: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

// Helper function to fix item padding based on orientation
const getItemPadding = (orientation: "horizontal" | "vertical") => {
  return orientation === "horizontal" 
    ? { paddingHorizontal: 16, paddingVertical: 0 }
    : { paddingHorizontal: 0, paddingVertical: 16 };
};

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

// Constants
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const Carousel = React.forwardRef<React.ElementRef<typeof View>, CarouselProps>(
  ({ 
    orientation = "horizontal", 
    opts, 
    setApi,
    plugins, 
    style, 
    children, 
    ...props 
  }, ref) => {
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [itemsCount, setItemsCount] = React.useState(0);
    const [itemDimension, setItemDimension] = React.useState(orientation === "horizontal" ? SCREEN_WIDTH : SCREEN_HEIGHT);
    const [contentDimension, setContentDimension] = React.useState(0);
    
    // Count children for navigation boundaries
    React.useEffect(() => {
      // Count the number of CarouselItem children
      let count = 0;
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === CarouselItem) {
          count++;
        }
      });
      setItemsCount(count);
    }, [children]);

    const canScrollPrev = currentIndex > 0;
    const canScrollNext = currentIndex < itemsCount - 1;

    // Scroll methods
    const scrollPrev = React.useCallback(() => {
      if (canScrollPrev) {
        const newIndex = currentIndex - 1;
        scrollViewRef.current?.scrollTo({
          [orientation === "horizontal" ? "x" : "y"]: newIndex * itemDimension,
          animated: true,
        });
        setCurrentIndex(newIndex);
      }
    }, [canScrollPrev, currentIndex, itemDimension, orientation]);

    const scrollNext = React.useCallback(() => {
      if (canScrollNext) {
        const newIndex = currentIndex + 1;
        scrollViewRef.current?.scrollTo({
          [orientation === "horizontal" ? "x" : "y"]: newIndex * itemDimension,
          animated: true,
        });
        setCurrentIndex(newIndex);
      }
    }, [canScrollNext, currentIndex, itemDimension, orientation]);

    const scrollTo = React.useCallback((index: number) => {
      if (index >= 0 && index < itemsCount) {
        scrollViewRef.current?.scrollTo({
          [orientation === "horizontal" ? "x" : "y"]: index * itemDimension,
          animated: true,
        });
        setCurrentIndex(index);
      }
    }, [itemDimension, itemsCount, orientation]);

    // Handle scroll events
    const handleScroll = React.useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const dimension = orientation === "horizontal" ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y;
      const newIndex = Math.round(dimension / itemDimension);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }, [currentIndex, itemDimension, orientation]);

    // Create and expose the API
    const api: CarouselApi = React.useMemo(() => ({
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
      scrollTo,
      selectedIndex: currentIndex,
    }), [scrollPrev, scrollNext, canScrollPrev, canScrollNext, scrollTo, currentIndex]);

    // Expose API through prop if requested
    React.useEffect(() => {
      if (setApi) {
        setApi(api);
      }
    }, [api, setApi]);

    // Handle layout measurement
    const onLayout = React.useCallback((event: any) => {
      const { width, height } = event.nativeEvent.layout;
      setItemDimension(orientation === "horizontal" ? width : height);
    }, [orientation]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef: scrollViewRef,
          api,
          opts,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <View 
          ref={ref}
          style={mergeStyles(styles.container, style)}
          onLayout={onLayout}
          {...props}
        >
          {children}
        </View>
      </CarouselContext.Provider>
    );
  }
);

Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<React.ElementRef<typeof ScrollView>, React.ComponentPropsWithoutRef<typeof ScrollView>>(
  ({ style, onScroll, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();
    
    // Pass through the ref or use the context ref
    const scrollViewRef = (ref as any) || carouselRef;

    return (
      <View style={styles.overflowHidden}>
        <ScrollView
          ref={scrollViewRef}
          horizontal={orientation === "horizontal"}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          decelerationRate="fast"
          snapToAlignment="center"
          style={mergeStyles(
            styles.scrollView,
            style
          )}
          contentContainerStyle={[
            orientation === "horizontal" ? styles.horizontalContent : styles.verticalContent
          ]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          {...props}
        />
      </View>
    );
  }
);

CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<React.ElementRef<typeof View>, React.ComponentPropsWithoutRef<typeof View>>
  (({ style, ...props }, ref) => {
    const { orientation } = useCarousel();
    
    // Get screen dimensions
    const screenDimension = orientation === "horizontal" ? SCREEN_WIDTH : SCREEN_HEIGHT;

    return (
      <View
        ref={ref}
        style={mergeStyles(
          styles.item,
          getItemPadding(orientation),
          orientation === "horizontal" ? { width: screenDimension } : { height: screenDimension },
          style
        )}
        {...props}
      />
    );
  }
);

CarouselItem.displayName = "CarouselItem";

type NavButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant' | 'size'> & {
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

const CarouselPrevious = React.forwardRef<React.ElementRef<typeof Button>, NavButtonProps>(
  ({ style, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        style={mergeStyles(
          styles.navButton,
          orientation === "horizontal" ? styles.previousHorizontal : styles.previousVertical,
          style
        )}
        disabled={!canScrollPrev}
        onPress={scrollPrev}
        {...props}
      >
        <ArrowLeft size={16} color="#000" />
      </Button>
    );
  }
);

CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<React.ElementRef<typeof Button>, NavButtonProps>(
  ({ style, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        style={mergeStyles(
          styles.navButton,
          orientation === "horizontal" ? styles.nextHorizontal : styles.nextVertical,
          style
        )}
        disabled={!canScrollNext}
        onPress={scrollNext}
        {...props}
      >
        <ArrowRight size={16} color="#000" />
      </Button>
    );
  }
);

CarouselNext.displayName = "CarouselNext";

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  overflowHidden: {
    overflow: "hidden",
  },
  scrollView: {
    flexGrow: 0,
  },
  horizontalContent: {
    flexDirection: "row",
  },
  verticalContent: {
    flexDirection: "column",
  },
  item: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  navButton: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  previousHorizontal: {
    left: 8,
    top: "50%",
    transform: [{ translateY: -16 }],
  },
  nextHorizontal: {
    right: 8,
    top: "50%",
    transform: [{ translateY: -16 }],
  },
  previousVertical: {
    top: 8,
    left: "50%",
    transform: [{ translateX: -16 }, { rotate: "90deg" }],
  },
  nextVertical: {
    bottom: 8,
    left: "50%",
    transform: [{ translateX: -16 }, { rotate: "90deg" }],
  },
});

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
