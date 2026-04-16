import React, { useEffect, useState } from "react";
import { styles } from "../src/styles/homeStyles";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth } from "../src/firebase/auth";
import {
  getUserProducts,
  saveProductToFirestore,
  deleteProduct,
  updateProductInFirestore,
} from "../src/firebase/firestore";
import { generateRecipeFromFridge } from "../src/ai/gemini";
import {
  useNgrokSocket,
  removeMatchedProduct,
  ItemRecord,
  FridgeCategory,
} from "../src/communication/ngrok";

const CATEGORY_OPTIONS: FridgeCategory[] = [
  "beverage",
  "dairy",
  "meat",
  "produce",
  "condiment",
  "eggs",
  "prepared_food",
  "unsure",
];

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const {
    openManual,
    scanId,
    prefillName,
    prefillBrand,
    prefillCategory,
    prefillImageUrl,
  } = useLocalSearchParams<{
    openManual?: string;
    scanId?: string;
    prefillName?: string;
    prefillBrand?: string;
    prefillCategory?: string;
    prefillImageUrl?: string;
  }>();

  const user = auth.currentUser;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualBrand, setManualBrand] = useState("");
  const [manualCategory, setManualCategory] =
    useState<FridgeCategory>("unsure");
  const [manualExpiry, setManualExpiry] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");

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

  useNgrokSocket((incomingItems: ItemRecord[]) => {
    void (async () => {
      console.log("Received from Python:", incomingItems);

      for (const item of incomingItems) {
        const removed = await removeMatchedProduct(item);
        if (removed) {
          console.log("Removed matched product:", removed);
        } else {
          console.log("No matching product found for:", item);
        }
      }

      await loadProducts();
    })();
  });

  useEffect(() => {
    if (openManual === "1") {
      setManualName(typeof prefillName === "string" ? prefillName : "");
      setManualBrand(typeof prefillBrand === "string" ? prefillBrand : "");
      setManualCategory(
        typeof prefillCategory === "string"
          ? (prefillCategory as FridgeCategory)
          : "unsure"
      );
      setManualImageUrl(
        typeof prefillImageUrl === "string" ? prefillImageUrl : ""
      );
      setManualExpiry("");
      setShowManualModal(true);
    }
  }, [
    openManual,
    scanId,
    prefillName,
    prefillBrand,
    prefillCategory,
    prefillImageUrl,
  ]);

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

    try {
      await saveProductToFirestore({
        name: manualName.trim(),
        brand: manualBrand.trim(),
        category: manualCategory,
        expirationDate: manualExpiry.trim(),
        imageUrl: manualImageUrl || "",
        addedAt: new Date().toISOString(),
      });

      setManualName("");
      setManualBrand("");
      setManualCategory("unsure");
      setManualExpiry("");
      setManualImageUrl("");
      setShowManualModal(false);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert("Error", "Could not save the product.");
    }
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

  const resetManualFields = () => {
    setManualName("");
    setManualBrand("");
    setManualCategory("unsure");
    setManualImageUrl("");
    setManualExpiry("");
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
            onPress={() => {
              resetManualFields();
              setShowManualModal(true);
            }}
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
                      <Feather name="edit" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.delete}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Feather name="trash-2" size={24} color="white" />
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

            <Text style={{ marginBottom: 8, fontWeight: "700", color: "#444" }}>
              Category
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {CATEGORY_OPTIONS.map((cat) => {
                const selected = manualCategory === cat;

                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setManualCategory(cat)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      backgroundColor: selected ? "#F062A5" : "#eee",
                      borderWidth: 1,
                      borderColor: selected ? "#F062A5" : "#ddd",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#fff" : "#333",
                        fontWeight: "700",
                        textTransform: "capitalize",
                      }}
                    >
                      {cat.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
                  resetManualFields();
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
                      <View
                        key={`${item.name}-${index}`}
                        style={styles.recipeLineRow}
                      >
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