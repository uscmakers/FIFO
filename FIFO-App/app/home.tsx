import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { getUserProducts } from "../src/firebase/firestore";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_SIZE = width / 4 - 40; // 4 columns for iPad

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getUserProducts();
    setProducts(data);
  };

  return (
    <View style={styles.container}>
      
      {/* Top Right Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.smallButton} onPress={() => router.push("/scanner")}>
          <Text style={styles.smallButtonText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => router.push("/scanner?manual=true")}>
          <Text style={styles.smallButtonText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: CARD_SIZE, height: CARD_SIZE }]}>
            <Image
              source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
              style={styles.image}
            />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.expiration}>
              Expires: {item.expirationDate}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F6",
  },

  topButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    gap: 10,
  },

  smallButton: {
    backgroundColor: "#FF69B4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  smallButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    margin: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  image: {
    width: "100%",
    height: "60%",
    resizeMode: "contain",
    marginBottom: 10,
  },

  productName: {
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },

  expiration: {
    color: "#FF69B4",
    marginTop: 4,
    fontWeight: "600",
  },
});