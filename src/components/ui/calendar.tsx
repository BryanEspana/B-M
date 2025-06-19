import * as React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";
// Note: You'll need to install the react-native-calendars package:
// npm install react-native-calendars
// or
// yarn add react-native-calendars
import { Calendar as RNCalendar, DateData } from "react-native-calendars";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { MarkedDates } from "react-native-calendars/src/types";

// Helper function for merging styles (similar to cn utility)
const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({
    ...acc,
    ...(typeof style === "object" ? style : {}),
  }), {});
};

type ThemeColors = {
  primary?: string;
  primaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  muted?: string;
  mutedForeground?: string;
  background?: string;
};

type CalendarProps = {
  style?: StyleProp<ViewStyle>;
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
  disabled?: boolean;
  mode?: "single" | "multiple" | "range";
  minDate?: Date;
  maxDate?: Date;
  showOutsideDays?: boolean;
  initialFocus?: boolean;
  locale?: string;
  theme?: ThemeColors;
  className?: string; // For API compatibility, not used
  classNames?: Record<string, string>; // For API compatibility, not used
};

const Calendar = ({
  style,
  selected,
  onSelect,
  disabled = false,
  mode = "single",
  minDate,
  maxDate,
  showOutsideDays = true,
  locale = "en",
  theme = {},
}: CalendarProps) => {
  // Convert Date objects to strings in YYYY-MM-DD format
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Prepare selected dates in the format required by react-native-calendars
  const getMarkedDates = (): MarkedDates => {
    if (!selected) {
      return {};
    }

    // Handle array of dates for multiple selection
    if (Array.isArray(selected)) {
      if (mode === "range" && selected.length === 2) {
        const [start, end] = selected;
        // Create a date range
        const markedDates: any = {};
        const startDate = new Date(Math.min(start.getTime(), end.getTime()));
        const endDate = new Date(Math.max(start.getTime(), end.getTime()));
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateString = formatDate(currentDate);
          markedDates[dateString] = {
            color: theme.primary || "#0ea5e9",
            textColor: theme.primaryForeground || "#ffffff",
            startingDay: dateString === formatDate(startDate),
            endingDay: dateString === formatDate(endDate),
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return markedDates;
      } else {
        // Handle multiple dates selection
        return selected.reduce((acc, date) => {
          acc[formatDate(date)] = {
            selected: true,
            selectedColor: theme.primary || "#0ea5e9",
            selectedTextColor: theme.primaryForeground || "#ffffff",
          };
          return acc;
        }, {} as Record<string, any>);
      }
    } else {
      // Handle single date selection
      return {
        [formatDate(selected)]: {
          selected: true,
          selectedColor: theme.primary || "#0ea5e9",
          selectedTextColor: theme.primaryForeground || "#ffffff",
        },
      };
    }
  };

  // Handle date selection
  const handleDayPress = (day: DateData) => {
    if (disabled) return;
    
    const selectedDate = new Date(day.timestamp);
    
    if (onSelect) {
      if (mode === "multiple" && Array.isArray(selected)) {
        // For multiple selection, toggle dates
        const isSelected = selected.some(
          (date) => formatDate(date) === day.dateString
        );
        if (isSelected) {
          onSelect(
            selected.filter(
              (date) => formatDate(date) !== day.dateString
            )
          );
        } else {
          onSelect([...selected, selectedDate]);
        }
      } else if (mode === "range" && Array.isArray(selected)) {
        // For range selection
        if (selected.length === 0 || selected.length === 2) {
          onSelect([selectedDate]);
        } else {
          onSelect([selected[0], selectedDate]);
        }
      } else {
        // For single selection
        onSelect(selectedDate);
      }
    }
  };

  // Custom arrow components
  const renderArrow = (direction: string) => {
    return (
      <View style={styles.arrowContainer}>
        {direction === "left" ? (
          <ChevronLeft size={16} color={theme.mutedForeground || "#64748b"} />
        ) : (
          <ChevronRight size={16} color={theme.mutedForeground || "#64748b"} />
        )}
      </View>
    );
  };

  // Custom day component
  const customDayComponent = ({ date, state }: { date: DateData; state: string }) => {
    const isToday = new Date().toDateString() === new Date(date.timestamp).toDateString();
    
    return (
      <TouchableOpacity 
        style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          state === "disabled" && styles.disabledDay,
        ]}
        disabled={state === "disabled" || disabled}
        accessibilityRole="button"
        accessibilityLabel={`${date.day} ${date.month} ${date.year}`}
      >
        <Text 
          style={[
            styles.dayText,
            isToday && styles.todayText,
            state === "disabled" && styles.disabledDayText,
            state === "today" && styles.todayText,
          ]}
        >
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  };

  // Theme for the calendar
  const calendarTheme = {
    backgroundColor: "transparent",
    calendarBackground: theme.background || "#ffffff",
    textSectionTitleColor: theme.mutedForeground || "#64748b",
    textSectionTitleDisabledColor: "#d9e1e8",
    selectedDayBackgroundColor: theme.primary || "#0ea5e9",
    selectedDayTextColor: theme.primaryForeground || "#ffffff",
    todayTextColor: theme.accentForeground || "#0f172a",
    todayBackgroundColor: theme.accent || "#f1f5f9",
    dayTextColor: "#2d4150",
    textDisabledColor: theme.muted || "#d9e1e8",
    monthTextColor: "#2d4150",
    textDayFontWeight: "normal",
    textMonthFontWeight: "500",
    textDayHeaderFontWeight: "normal",
    textDayFontSize: 14,
    textMonthFontSize: 14,
    textDayHeaderFontSize: 12,
  };

  return (
    <View style={mergeStyles(styles.container, style)}>
      <RNCalendar
        style={styles.calendar}
        markingType={mode === "range" ? "period" : "dot"}
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        hideExtraDays={!showOutsideDays}
        minDate={minDate ? formatDate(minDate) : undefined}
        maxDate={maxDate ? formatDate(maxDate) : undefined}
        disableAllTouchEventsForDisabledDays={true}
        enableSwipeMonths={true}
        renderArrow={renderArrow}
        // Uncomment if you want to use custom day component:
        // dayComponent={customDayComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  calendar: {
    borderRadius: 8,
  },
  arrowContainer: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
  dayContainer: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  dayText: {
    fontSize: 14,
    textAlign: "center",
  },
  todayContainer: {
    backgroundColor: "#f1f5f9",
  },
  todayText: {
    fontWeight: "500",
    color: "#0f172a",
  },
  disabledDay: {
    opacity: 0.4,
  },
  disabledDayText: {
    color: "#94a3b8",
  },
});

Calendar.displayName = "Calendar";

export { Calendar };
export type { CalendarProps };
