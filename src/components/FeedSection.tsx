import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Heart } from "lucide-react-native";
import { supabase } from "../integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LoveLetter {
  id: string;
  message: string;
  author: string;
  image_url: string | null;
  created_at: string;
}

const FeedSection = () => {
  const [letters, setLetters] = React.useState<LoveLetter[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchLetters = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("love_letters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching letters:", error);
        return;
      }

      setLetters(data as LoveLetter[]);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchLetters();
  }, [fetchLetters]);

  React.useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: es });
    } catch (error) {
      return dateString.split('T')[0]; // Fallback format
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#9F1239"
          colors={["#9F1239"]}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Nuestras Cartas</Text>
        <Text style={styles.subtitle}>
          Lee todos nuestros mensajes
        </Text>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9F1239" />
          </View>
        ) : letters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay cartas aún.</Text>
          </View>
        ) : (
          <View style={styles.messageList}>
            {letters.map((letter) => (
              <View key={letter.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageAuthor}>{letter.author}</Text>
                  <Text style={styles.messageDate}>{formatDate(letter.created_at)}</Text>
                </View>
                
                <Text style={styles.messageContent}>{letter.message}</Text>
                
                <View style={styles.messageLikes}>
                  <Heart width={16} height={16} color="#E11D48" fill="#E11D48" />
                  <Text style={styles.likesText}>1</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1F2", // light pink background
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Space for bottom navigation
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#9F1239", // secondary color
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563", // gray-600
    textAlign: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#9F1239",
    fontStyle: "italic",
  },
  messageList: {
    gap: 16,
  },
  messageCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  messageAuthor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9F1239",
  },
  messageDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  messageContent: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  messageLikes: {
    flexDirection: "row",
    alignItems: "center",
  },
  likesText: {
    fontSize: 14,
    color: "#9F1239",
    marginLeft: 6,
  }
});

export default FeedSection;
