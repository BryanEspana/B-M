import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle, LayoutChangeEvent } from "react-native";

type AspectRatioProps = {
  /**
   * The desired aspect ratio (width/height)
   * @default 1 (square)
   */
  ratio?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * A component that maintains a specific aspect ratio for its children.
 */
const AspectRatio: React.FC<AspectRatioProps> = ({ 
  ratio = 1, 
  style, 
  children 
}) => {
  const [layout, setLayout] = React.useState({ width: 0, height: 0 });
  
  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setLayout({ width, height: width / ratio });
  }, [ratio]);
  
  return (
    <View 
      style={[styles.container, style]}
      onLayout={onLayout}
    >
      <View style={[styles.content, { height: layout.height }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    width: '100%',
    overflow: 'hidden',
  },
});

export { AspectRatio };
