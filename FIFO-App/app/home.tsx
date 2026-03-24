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
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { auth } from "../src/firebase/auth";
import {
  getUserProducts,
  saveProductToFirestore,
  deleteProduct,
} from "../src/firebase/firestore";

export default function Home() {
  const router = useRouter();
  const user = auth.currentUser;
  const { width } = useWindowDimensions();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const [manualName, setManualName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [savingManual, setSavingManual] = useState(false);

  const numColumns = width >= 1100 ? 5 : width >= 900 ? 4 : width >= 650 ? 3 : 2;

  const horizontalPadding = 20;
  const cardGap = 16;
  const cardWidth =
    (width - horizontalPadding * 2 - cardGap * (numColumns - 1)) / numColumns;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getUserProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      Alert.alert("Error", "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const openDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: selectedDate || new Date(),
        mode: "date",
        onChange: (_, date) => {
          if (date) setSelectedDate(date);
        },
      });
    } else {
      setShowDatePickerModal(true);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualName.trim()) {
      Alert.alert("Missing info", "Please enter a product name.");
      return;
    }

    if (!selectedDate) {
      Alert.alert("Missing info", "Please choose an expiration date.");
      return;
    }

    try {
      setSavingManual(true);

      await saveProductToFirestore({
        name: manualName.trim(),
        brand: "Manual",
        barcode: "N/A",
        expirationDate: formatDate(selectedDate),
        addedAt: new Date().toISOString(),
      });

      setManualName("");
      setSelectedDate(null);
      setShowDatePickerModal(false);
      setShowManualModal(false);
      await loadProducts();
    } catch (error) {
      console.error("Error saving manual product:", error);
      Alert.alert("Error", "Could not save the product.");
    } finally {
      setSavingManual(false);
    }
  };

  const handleDeletePress = (productId: string, productName: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(productId);
              setProducts((prev) => prev.filter((p) => p.id !== productId));
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete the product.");
            }
          },
        },
      ]
    );
  };

  const handleGamePress = () => {
    Alert.alert("Go to the Game 🎮", 'Do you want to go to "the game"?', [
      { text: "Cancel", style: "cancel" },
      {
        text: "Go",
        onPress: () => {
          console.log("Game button pressed. Add Unity redirect later.");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Fridge 💗</Text>
          <Text style={styles.headerEmail}>{user?.email}</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/scanner")}
          >
            <Text style={styles.headerButtonText}>Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowManualModal(true)}
          >
            <Text style={styles.headerButtonText}>Input</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F062A5" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.emptySubtitle}>
            Use Scan or Input to add your first item.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={{
            padding: horizontalPadding,
            paddingBottom: 120,
          }}
          columnWrapperStyle={
            numColumns > 1
              ? { gap: cardGap, marginBottom: cardGap }
              : undefined
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { width: cardWidth }]}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePress(item.id, item.name)}
                hitSlop={10}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>

              <Image
                source={{
                  uri:
                    item.imageUrl ||
                    "https://via.placeholder.com/200x200.png?text=Product",
                }}
                style={styles.image}
              />

              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.expiration} numberOfLines={1}>
                Expires: {item.expirationDate}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleGamePress} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>🎮</Text>
      </TouchableOpacity>

      <Modal visible={showManualModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Product 💕</Text>

              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Greek Yogurt"
                placeholderTextColor="#999"
                value={manualName}
                onChangeText={setManualName}
              />

              <Text style={styles.label}>Expiration Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={openDatePicker}
                activeOpacity={0.85}
              >
                <Text
                  style={
                    selectedDate
                      ? styles.datePickerButtonText
                      : styles.datePickerPlaceholder
                  }
                >
                  {selectedDate ? formatDate(selectedDate) : "Select a date"}
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowManualModal(false);
                    setManualName("");
                    setSelectedDate(null);
                    setShowDatePickerModal(false);
                  }}
                  disabled={savingManual}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleManualSubmit}
                  disabled={savingManual}
                >
                  <Text style={styles.submitText}>
                    {savingManual ? "Saving..." : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showDatePickerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContent}>
            <Text style={styles.modalTitle}>Choose Expiration Date</Text>

            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="inline"
              onChange={(_, date) => {
                if (date) setSelectedDate(date);
              }}
            />

            <TouchableOpacity
              style={styles.dateDoneButton}
              onPress={() => setShowDatePickerModal(false)}
            >
              <Text style={styles.dateDoneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDED",
  },

  header: {
    backgroundColor: "#F062A5",
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },

  headerEmail: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },

  headerButtons: {
    flexDirection: "row",
    gap: 14,
  },

  headerButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  headerButtonText: {
    color: "#F062A5",
    fontWeight: "700",
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#444",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
    minHeight: 235,
  },

  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#FFF0F6",
    borderRadius: 999,
    padding: 8,
  },

  deleteButtonText: {
    fontSize: 18,
  },

  image: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
    marginTop: 6,
  },

  productName: {
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    color: "#222",
  },

  expiration: {
    color: "#F062A5",
    marginTop: 6,
    fontWeight: "600",
    fontSize: 14,
  },

  fab: {
    position: "absolute",
    bottom: 28,
    right: 28,
    backgroundColor: "#F062A5",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  fabIcon: {
    fontSize: 28,
    color: "#fff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#222",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },

  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  datePickerButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
  },

  datePickerButtonText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
  },

  datePickerPlaceholder: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#eee",
  },

  submitButton: {
    backgroundColor: "#F062A5",
  },

  cancelText: {
    fontWeight: "700",
    color: "#333",
  },

  submitText: {
    fontWeight: "700",
    color: "#fff",
  },

  dateModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  dateModalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },

  dateDoneButton: {
    marginTop: 16,
    backgroundColor: "#F062A5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  dateDoneButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});