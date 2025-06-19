import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, RefreshControl } from "react-native";
import { Music } from "lucide-react-native";
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
    flexDirection: "row",
    alignItems: "center",
  },
  playlistIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0FDF4",
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
    fontSize: 14,
    color: "#1DB954",
    fontWeight: "500",
  },
});

const MusicSection = () => {
  const [playlists, setPlaylists] = React.useState<MusicPlaylist[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

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

  const openSpotifyLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open this URL: " + url);
      }
    });
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
        <Text style={styles.title}>Nuestra Música</Text>
        <Text style={styles.subtitle}>
          Las canciones que nos gustan y nos hemos dedicado
        </Text>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9F1239" />
          </View>
        ) : playlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay playlists aún.</Text>
          </View>
        ) : (
          <View style={styles.playlistsContainer}>
            {playlists.map((playlist) => (
              <TouchableOpacity 
                key={playlist.id} 
                style={styles.playlistCard}
                onPress={() => openSpotifyLink(playlist.spotify_url)}
              >
                <View style={styles.playlistIconContainer}>
                  <Music width={28} height={28} color="#1DB954" />
                </View>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  {playlist.description && (
                    <Text style={styles.playlistDescription}>
                      {playlist.description}
                    </Text>
                  )}
                  <Text style={styles.spotifyLink}>Abrir en Spotify</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MusicSection;
