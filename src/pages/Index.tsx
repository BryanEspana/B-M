import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Heart, Music, FileText } from 'lucide-react-native';
import MusicSection from '../components/MusicSection';
import DiarySection from '../components/DiarySection';
import FeedSection from '../components/FeedSection';
import { BottomNavigation } from '../components/ui/bottom-navigation';
import { LinearGradient } from 'expo-linear-gradient';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  // Animation for heart pulse effect
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  const renderSection = () => {
    switch (activeSection) {
      case 'music':
        return <MusicSection />;
      case 'diary':
        return <DiarySection />;
      case 'feed':
        return <FeedSection />;
      default:
        return (
          <View style={styles.homeContainer}>
            <ScrollView 
              contentContainerStyle={styles.homeContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.centerContent}>
                <View style={styles.heartContainer}>
                  <Animated.View 
                    style={{
                      transform: [{ scale: pulseAnim }]
                    }}
                  >
                    <Heart width={80} height={80} color="#7e1785" fill="#7e1785" />
                  </Animated.View>
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Ð+M</Text>
                  <Text style={styles.subtitle}>
                    Te hice esto para que cada vez que me extrañes puedas ver todas nuestras cartas y canciones
                  </Text>
                </View>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setActiveSection('music')}
                  >
                    <Music width={32} height={32} color="#7e1785" />
                    <Text style={styles.buttonTitle}>Nuestra Música</Text>
                    <Text style={styles.buttonSubtitle}>Las canciones que nos gustan y nos hemos dedicado</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setActiveSection('diary')}
                  >
                    <FileText width={32} height={32} color="#7e1785" />
                    <Text style={styles.buttonTitle}>Escribir Carta</Text>
                    <Text style={styles.buttonSubtitle}>¿Me quieres decir algo?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setActiveSection('feed')}
                  >
                    <Heart width={32} height={32} color="#7e1785" fill="#7e1785" />
                    <Text style={styles.buttonTitle}>Nuestras Cartas</Text>
                    <Text style={styles.buttonSubtitle}>Lee todos nuestros mensajes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderSection()}
      
      {/* Bottom Navigation */}
      {activeSection !== 'home' && (
        <BottomNavigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
      )}
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  homeContainer: {
    flex: 1,
  },
  homeContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  centerContent: {
    maxWidth: 400,
    width: '100%',
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7e1785',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7e1785',
    marginTop: 12,
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#936bc7',
    textAlign: 'center',
  },
});