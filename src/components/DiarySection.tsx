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
  Platform 
} from "react-native";
import { supabase } from "../integrations/supabase/client";

const DiarySection = () => {
  const [message, setMessage] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || !author.trim()) {
      Alert.alert("Campos requeridos", "Por favor escribe tu nombre y mensaje");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("love_letters").insert([
        {
          message: message.trim(),
          author: author.trim(),
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
          <Text style={styles.title}>Escribir Carta</Text>
          <Text style={styles.subtitle}>
            ¿Me quieres decir algo?
          </Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.authorInput}
              value={author}
              onChangeText={setAuthor}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
              maxLength={50}
            />
          
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Escribe tu mensaje aquí..."
              multiline
              numberOfLines={6}
              placeholderTextColor="#9CA3AF"
              maxLength={1000}
            />
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!message.trim() || !author.trim() || isSubmitting) && styles.submitButtonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={!message.trim() || !author.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  authorInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 12, 
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    textAlignVertical: "top",
    minHeight: 150,
  },
  submitButton: {
    backgroundColor: "#E11D48",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
    height: 50,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#F9A8D4",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default DiarySection;
