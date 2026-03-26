import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../src/firebase/auth";
import {
  getUserProducts,
  saveProductToFirestore,
  deleteProduct,
} from "../src/firebase/firestore";
import { generateRecipeFromFridge } from "../src/ai/gemini";

export default function Home() {
  const router = useRouter();
  const user = auth.currentUser;
  const { width } = useWindowDimensions();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualExpiry, setManualExpiry] = useState("");

  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<any>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const numColumns =
    width >= 1100 ? 5 : width >= 900 ? 4 : width >= 650 ? 3 : 2;

  const cardWidth = (width - 80) / numColumns;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getUserProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleManualSubmit = async () => {
    if (!manualName.trim() || !manualExpiry.trim()) {
      Alert.alert("Missing info", "Please enter both a name and expiration date.");
      return;
    }

    await saveProductToFirestore({
      name: manualName.trim(),
      expirationDate: manualExpiry.trim(),
      brand: "Manual",
      barcode: "N/A",
      addedAt: new Date().toISOString(),
    });

    setManualName("");
    setManualExpiry("");
    setShowManualModal(false);
    loadProducts();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete?", `Delete ${name}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteProduct(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const handleGamePress = () => {
    Alert.alert("Go to game?", "Do you want to go to the game?", [
      { text: "Cancel", style: "cancel" },
      { text: "Go" },
    ]);
  };

  const handleRecipePress = () => {
    Alert.alert("Generate recipe?", "Do you want to generate a recipe?", [
      { text: "Cancel", style: "cancel" },
      { text: "Generate", onPress: generateRecipe },
    ]);
  };

  const generateRecipe = async () => {
    const names = products.map((p) => p.name).filter(Boolean);
    if (names.length === 0) {
      Alert.alert("No products", "Add some products first.");
      return;
    }

    setRecipeLoading(true);

    try {
      const result = await generateRecipeFromFridge(names);
      setRecipeData(result);
      setShowRecipeModal(true);
    } catch (error) {
      console.error("Error generating recipe:", error);
      Alert.alert("Error", "Could not generate a recipe.");
    } finally {
      setRecipeLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Fridge 💗</Text>
          <Text style={styles.headerEmail}>{user?.email}</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/scanner")}
            activeOpacity={0.85}
          >
            <Text style={styles.headerButtonText}>Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowManualModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.headerButtonText}>Input</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F062A5" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(i) => i.id}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 120,
          }}
          columnWrapperStyle={
            numColumns > 1 ? { gap: 16, marginBottom: 16 } : undefined
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { width: cardWidth }]}>
              <TouchableOpacity
                style={styles.delete}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
                style={styles.image}
              />

              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.expiration} numberOfLines={1}>
                {item.expirationDate}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.fabRow}>
        <TouchableOpacity style={styles.magicFab} onPress={handleRecipePress}>
          <Text style={styles.fabEmoji}>🪄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={handleGamePress}>
          <Text style={styles.fabEmoji}>🎮</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showManualModal} transparent animationType="fade">
        <View style={styles.manualOverlay}>
          <View style={styles.manualModalContent}>
            <Text style={styles.manualTitle}>Add Product 💕</Text>

            <TextInput
              style={styles.manualInput}
              placeholder="Name"
              placeholderTextColor="#999"
              value={manualName}
              onChangeText={setManualName}
            />

            <TextInput
              style={styles.manualInput}
              placeholder="Expiration Date (MM/DD/YYYY)"
              placeholderTextColor="#999"
              value={manualExpiry}
              onChangeText={setManualExpiry}
            />

            <View style={styles.manualButtonRow}>
              <TouchableOpacity
                style={[styles.manualButton, styles.manualCancelButton]}
                onPress={() => {
                  setShowManualModal(false);
                  setManualName("");
                  setManualExpiry("");
                }}
              >
                <Text style={styles.manualCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.manualButton, styles.manualSubmitButton]}
                onPress={handleManualSubmit}
              >
                <Text style={styles.manualSubmitText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRecipeModal} transparent animationType="fade">
        <View style={styles.recipeOverlay}>
          <View style={styles.recipeModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {recipeLoading ? (
                <View style={styles.recipeLoadingContainer}>
                  <ActivityIndicator size="large" color="#F062A5" />
                  <Text style={styles.recipeLoadingText}>
                    Making something yummy... ✨
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.recipeHeader}>
                    <Text style={styles.recipeHeaderEmoji}>🪄</Text>
                    <Text style={styles.recipeTitleText}>
                      {recipeData?.recipe_name || "Recipe Magic"}
                    </Text>
                  </View>

                  {typeof recipeData?.prep_time_minutes === "number" && (
                    <Text style={styles.recipeMeta}>
                      ⏱️ {recipeData.prep_time_minutes} min
                    </Text>
                  )}

                  <View style={styles.recipeSection}>
                    <Text style={styles.recipeSectionTitle}>🛒 Ingredients</Text>
                    {recipeData?.ingredients?.map((item: any, index: number) => (
                      <View key={`${item.name}-${index}`} style={styles.recipeLineRow}>
                        <Text style={styles.recipeBullet}>•</Text>
                        <Text style={styles.recipeLineText}>
                          <Text style={styles.recipeQty}>{item.quantity}</Text>{" "}
                          {item.name}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.recipeSection}>
                    <Text style={styles.recipeSectionTitle}>👩‍🍳 Steps</Text>
                    {recipeData?.steps?.map((step: string, index: number) => (
                      <View key={`step-${index}`} style={styles.recipeStepRow}>
                        <View style={styles.stepNumberCircle}>
                          <Text style={styles.recipeStepNumber}>{index + 1}</Text>
                        </View>
                        <Text style={styles.recipeStepText}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.closeRecipeButton}
                    onPress={() => setShowRecipeModal(false)}
                  >
                    <Text style={styles.closeRecipeButtonText}>Got it 💗</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },

  header: {
    backgroundColor: "#F062A5",
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  headerEmail: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },

  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },

  headerButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    minWidth: 72,
    alignItems: "center",
  },

  headerButtonText: {
    color: "#F062A5",
    fontWeight: "800",
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 15,
    position: "relative",
  },

  delete: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
  },

  deleteText: {
    fontSize: 18,
  },

  image: {
    height: 100,
    resizeMode: "contain",
  },

  productName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },

  expiration: {
    fontSize: 14,
    color: "#F062A5",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600",
  },

  fabRow: {
    position: "absolute",
    bottom: 30,
    right: 30,
    flexDirection: "row",
    gap: 10,
  },

  fab: {
    backgroundColor: "#F062A5",
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
  },

  magicFab: {
    backgroundColor: "#FFB7D5",
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
  },

  fabEmoji: {
    fontSize: 26,
  },

  manualOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  manualModalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },

  manualTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F062A5",
    textAlign: "center",
    marginBottom: 18,
  },

  manualInput: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  manualButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  manualButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  manualCancelButton: {
    backgroundColor: "#eee",
  },

  manualSubmitButton: {
    backgroundColor: "#F062A5",
  },

  manualCancelText: {
    fontWeight: "800",
    color: "#333",
  },

  manualSubmitText: {
    fontWeight: "800",
    color: "#fff",
  },

  recipeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  recipeModalContent: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },

  recipeLoadingContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  recipeLoadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
    textAlign: "center",
  },

  recipeHeader: {
    alignItems: "center",
    marginBottom: 12,
  },

  recipeHeaderEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },

  recipeTitleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F062A5",
    textAlign: "center",
  },

  recipeMeta: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 14,
  },

  recipeSection: {
    backgroundColor: "#FFF7FB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  recipeSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
    marginBottom: 10,
  },

  recipeLineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  recipeBullet: {
    fontSize: 16,
    color: "#F062A5",
    marginRight: 8,
    lineHeight: 22,
  },

  recipeLineText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 21,
  },

  recipeQty: {
    fontWeight: "700",
    color: "#F062A5",
  },

  recipeStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  stepNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F062A5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },

  recipeStepNumber: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  recipeStepText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 21,
  },

  closeRecipeButton: {
    marginTop: 6,
    backgroundColor: "#F062A5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  closeRecipeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});