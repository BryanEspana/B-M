import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image } from "react-native";
import { Heart, Calendar } from "lucide-react-native";
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
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy HH:mm", { locale: es });
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
                {/* Header con autor y fecha */}
                <View style={styles.cardHeader}>
                  <View style={styles.authorContainer}>
                    <Heart width={20} height={20} color="#9F1239" fill="#9F1239" />
                    <Text style={styles.messageAuthor}>{letter.author}</Text>
                  </View>
                  
                  <View style={styles.dateContainer}>
                    <Calendar width={16} height={16} color="#7C3AED" />
                    <Text style={styles.messageDate}>{formatDate(letter.created_at)}</Text>
                  </View>
                </View>
                
                {/* Imagen de la carta (si existe) */}
                {letter.image_url && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: letter.image_url }} 
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
                
                {/* Contenido del mensaje */}
                <View style={styles.messageContentContainer}>
                  <Text style={styles.messageContent}>{letter.message}</Text>
                </View>
                
                {/* Corazones decorativos al final */}
                <View style={styles.decorativeHearts}>
                  <Heart width={24} height={24} color="#9F1239" fill="#9F1239" />
                  <Heart width={20} height={20} color="#7C3AED" fill="#7C3AED" />
                  <Heart width={16} height={16} color="#A78BFA" fill="#A78BFA" />
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
    backgroundColor: "#A78BFA", // Fondo morado como en la imagen
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
    color: "#FFF", // Texto blanco sobre fondo morado
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
    backgroundColor: "#F5F3FF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyText: {
    fontSize: 16,
    color: "#9F1239",
    fontStyle: "italic",
  },
  messageList: {
    gap: 24,
  },
  messageCard: {
    backgroundColor: "#F5F3FF", // Fondo lavanda claro 
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  imageContainer: {
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#7C3AED",
    overflow: "hidden",
  },
  messageImage: {
    width: "100%",
    height: 240, // Altura adecuada para fotos
    backgroundColor: "#F5F3FF",
  },
  cardHeader: {
    padding: 16,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  messageAuthor: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9F1239",
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageDate: {
    fontSize: 14,
    color: "#7C3AED",
    marginLeft: 6,
  },
  messageContentContainer: {
    backgroundColor: "#7C3AED", // Fondo morado oscuro para el mensaje
    padding: 20,
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
  },
  messageContent: {
    fontSize: 16,
    color: "white", // Texto blanco sobre fondo morado
    lineHeight: 24,
  },
  decorativeHearts: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  }
});

export default FeedSection;
