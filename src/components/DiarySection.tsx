import * as React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../integrations/supabase/client";
import { Heart, ImageIcon } from "lucide-react-native";

const DiarySection = () => {
  const [message, setMessage] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [image, setImage] = React.useState<string | null>(null);
  
  const pickImage = async () => {
    // Solicitar permisos para acceder a la galería de fotos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una foto.');
      return;
    }

    // Abrir el selector de imágenes
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // Usar directamente el string "images"
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Convertir imagen a Base64 para guardar directamente en la tabla
  const imageToBase64 = async (uri: string) => {
    try {
      // Obtener los datos de la imagen como blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convertir blob a base64
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // El resultado es una cadena como "data:image/jpeg;base64,/9j/4AAQSkZ..."
          // Solo queremos la parte base64 sin el prefijo
          const base64String = reader.result as string;
          // Eliminar el prefijo para guardar sólo los datos
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Error al leer la imagen'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error convirtiendo imagen a base64:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() || !author.trim()) {
      Alert.alert("Campos requeridos", "Por favor escribe tu nombre y mensaje");
      return;
    }

    setIsSubmitting(true);

    try {
      // Si hay una imagen, convertir a base64 para guardar en la tabla
      let imageBase64 = null;
      if (image) {
        try {
          console.log('Procesando imagen para guardar...');
          // Convertir imagen a base64
          imageBase64 = await imageToBase64(image);
          console.log('Imagen convertida a base64 correctamente');
        } catch (err) {
          console.error('Error en el proceso de subida de imagen:', err);
          Alert.alert(
            "Error", 
            "Hubo un problema al procesar la imagen. La carta se enviará sin imagen."
          );
          // Si hay error, dejamos imageBase64 como null
          imageBase64 = null;
        }
      }
      
      // Insertar la carta con la imagen en base64 si está disponible
      // Usar la columna image_url existente para guardar el string base64
      const { error } = await supabase.from("love_letters").insert([
        {
          message: message.trim(),
          author: author.trim(),
          image_url: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null, // Guardar la imagen como data URL
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error submitting letter:", error);
        Alert.alert(
          "Error", 
          "No se pudo enviar tu carta. Inténtalo de nuevo."
        );
        return;
      }

      Alert.alert(
        "Carta enviada", 
        "Tu carta ha sido enviada con éxito. ¡Gracias!",
        [
          { 
            text: "OK", 
            onPress: () => {
              // Reset form after successful submission
              setMessage("");
              setAuthor("");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
             {/* Iconos de música en la parte superior */}
             <View style={styles.headerIcons}>
              <Heart width={20} height={20} color="#7e1785" style={[styles.headerIcons, styles.leftHeartIcon]} />
              <Heart width={30} height={30} color="#7e1785" style={[styles.headerIcons, styles.centerHeartIcon]} />
              <Heart width={20} height={20} color="#7e1785" style={[styles.headerIcons, styles.rightHeartIcon]} />
          </View>
          
          <Text style={styles.title}>Enviame un mensaje</Text>
          <Text style={styles.subtitle}>
            Escribeme algo lindo que me quieras mandar, y preferiblemente manda una foto de tu carita jsjs
          </Text>
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Escribe tu nombre</Text>
            <TextInput
              style={styles.authorInput}
              value={author}
              onChangeText={setAuthor}
              placeholder="Nataly el amor de mi vida..."
              placeholderTextColor="#A1A1AA"
              maxLength={50}
            />
          
            <Text style={styles.inputLabel}>Tu mensaje</Text>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Aqui escribe algo como, te quiero..."
              multiline
              numberOfLines={6}
              placeholderTextColor="#A1A1AA"
              maxLength={1000}
            />
            
            <Text style={styles.inputLabel}>Agregar una foto <Text style={styles.optionalText}>(opcional)</Text></Text>
            <TouchableOpacity 
              style={styles.imagePickerButton} 
              onPress={pickImage}
            >
              {image ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setImage(null)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <ImageIcon width={28} height={28} color="#7e1785" />
                  <Text style={styles.imagePlaceholderText}>Seleccionar foto (mandame una plis)</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!message.trim() || !author.trim() || isSubmitting) && styles.submitButtonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={!message.trim() || !author.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.submitButtonContent}>
                  <Text style={styles.submitButtonText}>Enviar</Text>
                  <Heart width={20} height={20} color="white" style={styles.heartIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    alignItems: "center",
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
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  heartIcon: {
    marginLeft: 8,
  },
  leftHeartIcon: {
    marginLeft: 8,
    opacity: 0.5,
  },
  centerHeartIcon: {
    marginLeft: 8,
    opacity: 1,
  },
  rightHeartIcon: {
    marginLeft: 8,
    opacity: 0.7,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Space for bottom navigation
  },
  formContainer: {
    backgroundColor: "white", // Fondo lavanda claro
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7e1785", // Morado para las etiquetas
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#7e1785", // Color más claro para indicar opcional
    fontStyle: "italic",
  },
  authorInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 24, 
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    textAlignVertical: "top",
    minHeight: 150,
    marginBottom: 24,
  },
  imagePickerButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 120,
    borderWidth: 2,
    borderColor: "#7e1785",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#7e1785",
    fontSize: 14,
    textAlign: "center",
  },
  previewContainer: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#7e1785",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#936bc7",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
    marginRight: 6,
  },
  
});

export default DiarySection;
