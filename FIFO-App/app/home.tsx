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
  ScrollView,
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
  updateProductInFirestore,
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
  const [manualBrand, setManualBrand] = useState("");
  const [manualExpiry, setManualExpiry] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editProductId, setEditProductId] = useState("");
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editExpiry, setEditExpiry] = useState("");

  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<any>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const numColumns = 4;
  const columnGap = 12;

  const cardWidth = 280;
  const cardLength = 240;

  const gridWidth = cardWidth * numColumns + columnGap * (numColumns - 1);

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
    if (!manualName.trim() || !manualBrand.trim() || !manualExpiry.trim()) {
      Alert.alert(
        "Missing info",
        "Please enter a name, brand, and expiration date."
      );
      return;
    }

    await saveProductToFirestore({
      name: manualName.trim(),
      brand: manualBrand.trim(),
      expirationDate: manualExpiry.trim(),
      barcode: "N/A",
      addedAt: new Date().toISOString(),
    });

    setManualName("");
    setManualBrand("");
    setManualExpiry("");
    setShowManualModal(false);
    loadProducts();
  };

  const openEditModal = (item: any) => {
    setEditProductId(item.id);
    setEditName(item.name || "");
    setEditBrand(item.brand || "");
    setEditExpiry(item.expirationDate || "");
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (
      !editProductId ||
      !editName.trim() ||
      !editBrand.trim() ||
      !editExpiry.trim()
    ) {
      Alert.alert(
        "Missing info",
        "Please enter a name, brand, and expiration date."
      );
      return;
    }

    try {
      await updateProductInFirestore(editProductId, {
        name: editName.trim(),
        brand: editBrand.trim(),
        expirationDate: editExpiry.trim(),
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProductId
            ? {
                ...p,
                name: editName.trim(),
                brand: editBrand.trim(),
                expirationDate: editExpiry.trim(),
              }
            : p
        )
      );

      setShowEditModal(false);
      setEditProductId("");
      setEditName("");
      setEditBrand("");
      setEditExpiry("");
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Error", "Could not update the product.");
    }
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
        <View style={styles.listShell}>
          <FlatList
            data={products}
            keyExtractor={(i) => i.id}
            numColumns={numColumns}
            style={[styles.list, { width: gridWidth }]}
            contentContainerStyle={{
              paddingTop: 18,
              paddingBottom: 120,
            }}
            columnWrapperStyle={{ gap: columnGap, marginBottom: 12 }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.cardWrapper,
                  { width: cardWidth, height: cardLength },
                ]}
              >
                <View style={styles.card}>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.edit}
                      onPress={() => openEditModal(item)}
                    >
                      <Text style={styles.editText}>✏️</Text>
                    </TouchableOpacity>
            
                    <TouchableOpacity
                      style={styles.delete}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Text style={styles.deleteText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
            
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : require("../img/magenta.png")
                    }
                    style={styles.image}
                  />
            
                  <View style={styles.cardTextArea}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
            
                    <Text style={styles.productBrand} numberOfLines={1}>
                      {item.brand}
                    </Text>
            
                    <Text style={styles.expiration} numberOfLines={1}>
                      {item.expirationDate}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
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
              placeholder="Brand"
              placeholderTextColor="#999"
              value={manualBrand}
              onChangeText={setManualBrand}
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
                  setManualBrand("");
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

      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.manualOverlay}>
          <View style={styles.manualModalContent}>
            <Text style={styles.manualTitle}>Edit Product ✏️</Text>

            <TextInput
              style={styles.manualInput}
              placeholder="Name"
              placeholderTextColor="#999"
              value={editName}
              onChangeText={setEditName}
            />

            <TextInput
              style={styles.manualInput}
              placeholder="Brand"
              placeholderTextColor="#999"
              value={editBrand}
              onChangeText={setEditBrand}
            />

            <TextInput
              style={styles.manualInput}
              placeholder="Expiration Date (MM/DD/YYYY)"
              placeholderTextColor="#999"
              value={editExpiry}
              onChangeText={setEditExpiry}
            />

            <View style={styles.manualButtonRow}>
              <TouchableOpacity
                style={[styles.manualButton, styles.manualCancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditProductId("");
                  setEditName("");
                  setEditBrand("");
                  setEditExpiry("");
                }}
              >
                <Text style={styles.manualCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.manualButton, styles.manualSubmitButton]}
                onPress={handleEditSubmit}
              >
                <Text style={styles.manualSubmitText}>Save</Text>
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
                          <Text style={styles.recipeStepNumber}>
                            {index + 1}
                          </Text>
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

  listShell: {
    flex: 1,
    alignItems: "center",
  },

  list: {
    alignSelf: "center",
  },

  cardWrapper: {
    flexGrow: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    padding: 0,
  },
  
  image: {
    width: "100%",
    height: 130,
    resizeMode: "cover",
  },
  
  cardTextArea: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    flex: 1,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 0,
  },
  
  productBrand: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 4,
  },
  
  expiration: {
    fontSize: 14,
    color: "#F062A5",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600",
  },

  actionRow: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },

  edit: {
    padding: 2,
  },

  editText: {
    fontSize: 18,
  },

  delete: {
    padding: 2,
  },

  deleteText: {
    fontSize: 18,
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