import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { getUserProducts, deleteProduct } from "../src/firebase/firestore";

interface SavedProduct {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  expirationDate: string;
  addedAt: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getUserProducts();
      setProducts(data as SavedProduct[]);
    } catch (error) {
      console.error("Error loading products:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleDelete = async (productId: string, productName: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete ${productName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(productId);
              setProducts(products.filter(p => p.id !== productId));
              Alert.alert("Success", "Product deleted");
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No products yet</Text>
        <Text style={styles.emptySubtext}>Start scanning to add products!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Products 🍎</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productBrand}>{item.brand}</Text>
              <Text style={styles.productExpiry}>Expires: {item.expirationDate}</Text>
              <Text style={styles.productBarcode}>Barcode: {item.barcode}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#999",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#bbb",
    marginTop: 10,
  },
  productCard: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  productBrand: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  productExpiry: {
    fontSize: 14,
    color: "#FF69B4",
    marginTop: 6,
    fontWeight: "500",
  },
  productBarcode: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    fontSize: 24,
  },
});