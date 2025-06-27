import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, RefreshControl, Dimensions, Modal, TextInput, Alert } from "react-native";
import { Music, X, Plus } from "lucide-react-native";
import WebView from "react-native-webview";
import { supabase } from "../integrations/supabase/client";

interface MusicPlaylist {
  id: string;
  name: string;
  description: string | null;
  spotify_url: string;
  created_at: string;
}

// Define styles before using them
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Space for bottom navigation
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    alignItems: "center",
  },
  musicIcon: {
    marginHorizontal: 8,
  },
  leftMusicIcon: {
    opacity: 0.5,
  },
  rightMusicIcon: {
    opacity: 0.7,
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
    color: "#4B5563", // gray-600
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#7e1785",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#F5F3FF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7C3AED",
  },
  closeButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7C3AED",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
  },
  cancelButtonText: {
    color: "#4B5563",
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
  playlistsContainer: {
    gap: 16,
  },
  playlistCard: {
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
  playlistHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  playlistIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e4d1f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },
  spotifyLink: {
    marginTop: 6,
    fontSize: 14,
    color: "#7e1785",
    fontWeight: "500",
  },
  webViewContainer: {
    width: "100%",
    height: 380,
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
});

const MusicSection = () => {
  const [playlists, setPlaylists] = React.useState<MusicPlaylist[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newPlaylist, setNewPlaylist] = React.useState({
    name: "",
    description: "",
    spotify_url: "",
  });

  const fetchPlaylists = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("music_playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching playlists:", error);
        return;
      }

      setPlaylists(data as MusicPlaylist[]);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPlaylists();
  }, [fetchPlaylists]);

  React.useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const formatSpotifyEmbedUrl = (url: string): string => {
    // Ejemplo: https://open.spotify.com/playlist/37i9dQZF1DX76t638V6CA8 -> https://open.spotify.com/embed/playlist/37i9dQZF1DX76t638V6CA8
    try {
      // Extraer el tipo (playlist/track/album) y el ID
      const urlParts = url.split('/');
      const spotifyType = urlParts[urlParts.length - 2]; // playlist, album o track
      const spotifyId = urlParts[urlParts.length - 1].split('?')[0]; // ID sin parámetros adicionales
      
      return `https://open.spotify.com/embed/${spotifyType}/${spotifyId}`;
    } catch (error) {
      console.error('Error formateando URL de Spotify:', error);
      return url; // Devolver la URL original en caso de error
    }
  };

  const openSpotifyLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open this URL: " + url);
      }
    });
  };

  const handleAddPlaylist = async () => {
    // Validación básica
    if (!newPlaylist.name || !newPlaylist.spotify_url) {
      Alert.alert("Error", "El nombre y la URL de Spotify son obligatorios");
      return;
    }

    // Validar que la URL es de Spotify
    if (!newPlaylist.spotify_url.includes("open.spotify.com")) {
      Alert.alert("Error", "Por favor ingresa una URL válida de Spotify");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("music_playlists")
        .insert([{ 
          name: newPlaylist.name, 
          description: newPlaylist.description || null, 
          spotify_url: newPlaylist.spotify_url 
        }]);

      if (error) throw error;

      // Reset form and close modal
      setNewPlaylist({ name: "", description: "", spotify_url: "" });
      setModalVisible(false);
      
      // Refresh the playlist list
      fetchPlaylists();

    } catch (error) {
      console.error("Error adding playlist:", error);
      Alert.alert("Error", "No se pudo agregar la playlist. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Playlist</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X width={24} height={24} color="#7C3AED" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Nombre de la playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Canciones románticas"
              value={newPlaylist.name}
              onChangeText={(text) => setNewPlaylist({...newPlaylist, name: text})}
            />
            
            <Text style={styles.inputLabel}>URL de Spotify</Text>
            <TextInput
              style={styles.input}
              placeholder="https://open.spotify.com/playlist/..."
              value={newPlaylist.spotify_url}
              onChangeText={(text) => setNewPlaylist({...newPlaylist, spotify_url: text})}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleAddPlaylist}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Agregar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          {/* Iconos de música en la parte superior */}
          <View style={styles.headerIcons}>
            <Music width={20} height={20} color="#7e1785" style={[styles.musicIcon, styles.leftMusicIcon]} />
            <Music width={30} height={30} color="#7e1785" style={styles.musicIcon} />
            <Music width={20} height={20} color="#7e1785" style={[styles.musicIcon, styles.rightMusicIcon]} />
          </View>
          
          <Text style={styles.title}>Nuestra Música</Text>
          <Text style={styles.subtitle}>
            Las canciones que nos gustan y nos hemos dedicado
          </Text>
          
          {/* Botón para agregar playlist */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus width={24} height={24} color="white" />
            <Text style={styles.addButtonText}>Agregar Playlist</Text>
          </TouchableOpacity>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7e1785" />
          </View>
        ) : playlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay playlists aún.</Text>
          </View>
        ) : (
          <View style={styles.playlistsContainer}>
            {playlists.map((playlist) => (
              <View 
                key={playlist.id} 
                style={styles.playlistCard}
              >
                <View style={styles.playlistHeader}>
                  <View style={styles.playlistIconContainer}>
                    <Music width={28} height={28} color="#7e1785" />
                  </View>
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                    {playlist.description && (
                      <Text style={styles.playlistDescription}>
                        {playlist.description}
                      </Text>
                    )}
                  </View>
                </View>
                
                {/* Spotify Embed */}
                <View style={styles.webViewContainer}>
                  <WebView
                    source={{ 
                      uri: formatSpotifyEmbedUrl(playlist.spotify_url)
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                  />
                </View>
                
                {/* Link para abrir en Spotify */}
                <TouchableOpacity 
                  onPress={() => openSpotifyLink(playlist.spotify_url)}
                >
                  <Text style={styles.spotifyLink}>Abrir en Spotify</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
    </>
  );
};

export default MusicSection;
