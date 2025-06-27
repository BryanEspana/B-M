import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Heart,
  Music,
  FileText,
  Home,
} from "lucide-react-native";

export interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const BottomNavigation = React.forwardRef<View, BottomNavigationProps>(
  ({ activeSection, onSectionChange }, ref) => {
    return (
      <View ref={ref} style={styles.container}>
        <View style={styles.navigationContent}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => onSectionChange("home")}
          >
            <Home
              width={24}
              height={24}
              color={activeSection === "home" ? "#7e1785" : "#936bc7"}
            />
            <Text
              style={[
                styles.navText,
                activeSection === "home" && styles.activeNavText,
              ]}
            >
              Inicio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => onSectionChange("music")}
          >
            <Music
              width={24}
              height={24}
              color={activeSection === "music" ? "#7e1785" : "#936bc7"}
            />
            <Text
              style={[
                styles.navText,
                activeSection === "music" && styles.activeNavText,
              ]}
            >
              Música
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => onSectionChange("diary")}
          >
            <FileText
              width={24}
              height={24}
              color={activeSection === "diary" ? "#7e1785" : "#936bc7"}
            />
            <Text
              style={[
                styles.navText,
                activeSection === "diary" && styles.activeNavText,
              ]}
            >
              Escribir
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => onSectionChange("feed")}
          >
            <Heart
              width={24}
              height={24}
              color={activeSection === "feed" ? "#7e1785" : "#936bc7"}
              fill={activeSection === "feed" ? "#7e1785" : "#936bc7"}
            />
            <Text
              style={[
                styles.navText,
                activeSection === "feed" && styles.activeNavText,
              ]}
            >
              Cartas
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

BottomNavigation.displayName = "BottomNavigation";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
  },
  navigationContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    color: "#936bc7",
  },
  activeNavText: {
    color: "#7e1785",
  },
});

export { BottomNavigation };
