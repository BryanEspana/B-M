import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image, TouchableOpacity, Alert, ToastAndroid, Platform } from "react-native";
import { Heart, Calendar, Download } from "lucide-react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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

  // Función para descargar y compartir imágenes
  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      // La URL puede venir como data:image/jpeg;base64,...
      if (imageUrl.startsWith('data:')) {
        const base64Data = imageUrl.split(',')[1];
        const fileUri = FileSystem.documentDirectory + filename;
        
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          if (Platform.OS === 'android') {
            ToastAndroid.show('¡Imagen guardada!', ToastAndroid.SHORT);
          } else {
            Alert.alert('Imagen guardada', 'La imagen ha sido guardada exitosamente');
          }
        }
      } else {
        // Para URLs externas
        const downloadResumable = FileSystem.createDownloadResumable(
          imageUrl,
          FileSystem.documentDirectory + filename
        );
        
        const result = await downloadResumable.downloadAsync();
        if (!result) {
          throw new Error('Error al descargar la imagen');
        }
        const { uri } = result;
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          if (Platform.OS === 'android') {
            ToastAndroid.show('¡Imagen guardada!', ToastAndroid.SHORT);
          } else {
            Alert.alert('Imagen guardada', 'La imagen ha sido guardada exitosamente');
          }
        }
      }
    } catch (error) {
      console.error("Error al descargar o compartir la imagen:", error);
      Alert.alert('Error', 'No se pudo descargar la imagen');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#7e1785"
          colors={["#7e1785"]}
        />
      }
    >
      <View style={styles.content}>

      <View style={styles.headerIcons}>
        <Image 
          source={require('../assets/animations/feed.gif')} 
          style={styles.feedAnimation} 
        />
      </View>
        

        <Text style={styles.title}>Nuestras Cartas</Text>
        <Text style={styles.subtitle}>
          Lee todos nuestros mensajes
        </Text>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7e1785" />
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
                    <Heart width={20} height={20} color="#7e1785" fill="#7e1785" />
                    <Text style={styles.messageAuthor}>{letter.author}</Text>
                  </View>
                  
                  <View style={styles.dateContainer}>
                    <Calendar width={16} height={16} color="#7e1785" />
                    <Text style={styles.messageDate}>{formatDate(letter.created_at)}</Text>
                  </View>
                </View>
                
                {/* Imagen de la carta (si existe) */}
                {letter.image_url && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: letter.image_url }} 
                      style={styles.messageImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => letter.image_url && handleDownloadImage(letter.image_url, `carta-${letter.id}.jpg`)}
                    >
                      <Download width={24} height={24} color="white" />
                    </TouchableOpacity>
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
  headerIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    alignItems: "center",
  },
  feedAnimation: {
    width: 120,
    height: 120,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  container: {
    flex: 1
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Space for bottom navigation
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#7e1785", // secondary color
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#936bc7", // Texto blanco sobre fondo morado
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
    backgroundColor: "white", // Fondo lavanda claro 
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
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f0f0f0",
    minHeight: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  messageImage: {
    width: "100%",
    height: "auto",
    minHeight: 240,
    maxHeight: 400,
    backgroundColor: "white",
  },
  downloadButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#7e1785",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    color: "#7e1785",
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageDate: {
    fontSize: 14,
    color: "#7e1785",
    marginLeft: 6,
  },
  messageContentContainer: {
    backgroundColor: "#7e1785", // Fondo morado oscuro para el mensaje
    padding: 20,
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
  },
  messageContent: {
    fontSize: 16,
    color: "white"
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
