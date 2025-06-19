import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  ColorValue,
  DimensionValue
} from "react-native";
// NOTE: This requires installing the victory-native package:
// npm install victory-native
// or
// yarn add victory-native

// Import placeholders (replace with actual imports after installing victory-native)
type VictoryTooltipProps = any;
type VictoryLegendProps = any;

// Temporary mock components until victory-native is installed
const VictoryTooltip = (props: any) => null;
const VictoryLegend = (props: any) => null;

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

// Define theme colors for light and dark modes
const THEMES = {
  light: {
    background: "#FFFFFF",
    foreground: "#000000",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    border: "#E2E8F0",
  },
  dark: {
    background: "#020817",
    foreground: "#FFFFFF",
    muted: "#1E293B",
    mutedForeground: "#94A3B8",
    border: "#1E293B",
  },
} as const;

// Types
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
  colorMode: keyof typeof THEMES;
  currentTheme: typeof THEMES[keyof typeof THEMES];
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

type ChartContainerProps = {
  config: ChartConfig;
  colorMode?: keyof typeof THEMES;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  aspectRatio?: number;
};

const ChartContainer = React.forwardRef<View, ChartContainerProps>(
  ({ children, config, style, colorMode = "light", aspectRatio = 16/9, ...props }, ref) => {
    const chartId = React.useId();
    const currentTheme = THEMES[colorMode];

    // Victory chart theme based on current color mode
    const chartTheme = {
      axis: {
        style: {
          axis: {
            stroke: currentTheme.border,
          },
          tickLabels: {
            fill: currentTheme.mutedForeground,
            fontSize: 12,
          },
          grid: {
            stroke: currentTheme.border,
            strokeOpacity: 0.5,
          },
        },
      },
      chart: {
        padding: 20,
      },
      tooltip: {
        style: {
          fill: currentTheme.foreground,
        },
        flyoutStyle: {
          fill: currentTheme.background,
          stroke: currentTheme.border,
          strokeWidth: 1,
        },
      },
    };

    return (
      <ChartContext.Provider value={{ config, colorMode, currentTheme }}>
        <View 
          ref={ref} 
          style={mergeStyles(
            styles.container,
            { aspectRatio }, 
            style
          )}
          {...props}
        >
          {children}
        </View>
      </ChartContext.Provider>
    );
  }
);

ChartContainer.displayName = "ChartContainer";

type ChartTooltipProps = {
  active?: boolean;
  data?: any[];
  formatter?: (value: number, name: string, props: any) => React.ReactNode;
  label?: string | React.ReactNode;
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
};

const ChartTooltip = (props: ChartTooltipProps) => {
  // Victory Native tooltip implementation
  return (
    <VictoryTooltip
      {...props}
      cornerRadius={5}
      pointerLength={5}
      flyoutStyle={{
        stroke: "#e2e8f0",
        strokeWidth: 1,
        fill: "#ffffff",
      }}
      style={{
        fontSize: 12,
        fill: "#0f172a",
      }}
    />
  );
};

type ChartTooltipContentProps = ChartTooltipProps & {
  children?: React.ReactNode;
};

const ChartTooltipContent = React.forwardRef<View, ChartTooltipContentProps>(
  ({
    active,
    data,
    style,
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    formatter,
    nameKey,
    labelKey,
    children,
    ...props
  }, ref) => {
    const { config, currentTheme } = useChart();
    
    if (!active || !data?.length) {
      return null;
    }
    
    return (
      <View 
        ref={ref} 
        style={mergeStyles(
          styles.tooltip,
          style
        )}
        {...props}
      >
        {!hideLabel && label && (
          <Text style={styles.tooltipLabel}>
            {typeof labelFormatter === "function" ? labelFormatter(label, data) : label}
          </Text>
        )}
        <View style={styles.tooltipContent}>
          {data.map((item, index) => {
            const key = nameKey || item.name || "value";
            const itemConfig = config[key];
            const indicatorColor = item.color || (itemConfig?.color || "#000000");
            
            return (
              <View key={index} style={styles.tooltipItem}>
                {!hideIndicator && (
                  <View 
                    style={mergeStyles(
                      styles.tooltipIndicator,
                      { backgroundColor: indicatorColor }
                    )}
                  />
                )}
                <View style={styles.tooltipItemContent}>
                  <Text style={styles.tooltipItemLabel}>
                    {itemConfig?.label || item.name}
                  </Text>
                  {item.value !== undefined && (
                    <Text style={styles.tooltipItemValue}>
                      {typeof formatter === "function" 
                        ? formatter(item.value, item.name, item)
                        : item.value.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
          {children}
        </View>
      </View>
    );
  }
);

ChartTooltipContent.displayName = "ChartTooltipContent";

type ChartLegendProps = {
  data?: Array<{ name: string; color: string; symbol?: { type?: string } }>;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<TextStyle>;
  orientation?: "horizontal" | "vertical";
  verticalAlign?: "top" | "bottom";
  gutter?: number;
};

const ChartLegend = ({
  data = [],
  style,
  itemStyle,
  orientation = "horizontal",
  verticalAlign = "bottom",
  gutter = 20,
  ...props
}: ChartLegendProps) => {
  const { currentTheme } = useChart();
  
  return (
    <VictoryLegend
      data={data}
      orientation={orientation}
      style={{
        labels: mergeStyles(
          { fill: currentTheme.mutedForeground, fontSize: 12 },
          itemStyle
        ),
        ...(style as object || {})
      }}
      gutter={gutter}
      {...props}
    />
  );
};

type ChartLegendContentProps = {
  payload?: Array<{ value: string; color: string }>;
  style?: StyleProp<ViewStyle>;
  hideIcon?: boolean;
  verticalAlign?: "top" | "bottom";
  nameKey?: string;
};

const ChartLegendContent = React.forwardRef<View, ChartLegendContentProps>(
  ({
    payload = [],
    style,
    hideIcon = false,
    verticalAlign = "bottom",
    nameKey,
    ...props
  }, ref) => {
    const { config, currentTheme } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <View 
        ref={ref}
        style={mergeStyles(
          styles.legend,
          verticalAlign === "top" ? styles.legendTop : styles.legendBottom,
          style
        )}
        {...props}
      >
        {payload.map((item, index) => {
          const key = nameKey || item.value || "value";
          const itemConfig = config[key];

          return (
            <View key={index} style={styles.legendItem}>
              {!hideIcon && (
                <View 
                  style={mergeStyles(
                    styles.legendIndicator,
                    { backgroundColor: item.color }
                  )}
                />
              )}
              <Text style={styles.legendLabel}>
                {itemConfig?.label || item.value}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
);

ChartLegendContent.displayName = "ChartLegendContent";

// Helper to get config for an item
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload = payload.payload || {};
  
  let configLabelKey: string = key;

  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

// Styles
const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "transparent",
  },
  tooltip: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 8,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tooltipLabel: {
    fontWeight: "500",
    marginBottom: 8,
    fontSize: 12,
  },
  tooltipContent: {
    gap: 8,
  },
  tooltipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tooltipIndicator: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  tooltipItemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tooltipItemLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  tooltipItemValue: {
    fontSize: 12,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  legendTop: {
    marginBottom: 16,
  },
  legendBottom: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 12,
    color: "#64748b",
  },
});

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
