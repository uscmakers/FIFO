import React, { useEffect } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import {
  BarcodeScannerScreenConfiguration,
  SingleScanningMode,
} from "react-native-scanbot-barcode-scanner-sdk";
import ScanbotBarcodeSDK from "react-native-scanbot-barcode-scanner-sdk";
import { useRouter } from "expo-router";

type LookupResult = {
  name: string;
  brand: string;
  imageUrl: string;
};

function getOffImageUrl(product: any, barcode: string): string {
  const directCandidates = [
    product?.image_front_url,
    product?.image_url,
    product?.selected_images?.front?.display?.full?.url,
    product?.selected_images?.front?.display?.small?.url,
    product?.images?.selected?.front?.display?.full?.url,
    product?.images?.selected?.front?.display?.small?.url,
    product?.images?.selected?.front?.url,
  ];

  const direct = directCandidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  if (direct) return direct;

  const front = product?.selected_images?.front ?? product?.images?.selected?.front;
  const rev = front?.rev;

  if (rev && barcode) {
    const padded = String(barcode).padStart(13, "0");
    const folder = padded.replace(/(...)(...)(...)(.*)/, "$1/$2/$3/$4");
    const lang = front?.lang || front?.lc || "en";

    return `https://images.openfoodfacts.org/images/products/${folder}/front_${lang}.${rev}.full.jpg`;
  }

  return "";
}

async function lookupProductByBarcode(barcode: string): Promise<LookupResult> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      console.log("Lookup returned non-JSON response");
      return { name: "", brand: "", imageUrl: "" };
    }

    const data = await response.json();
    const product = data?.product ?? null;

    if (!product) {
      return { name: "", brand: "", imageUrl: "" };
    }

    const name =
      typeof product?.product_name === "string"
        ? product.product_name.trim()
        : "";

    const brand =
      typeof product?.brands === "string" && product.brands.trim().length > 0
        ? product.brands.split(",")[0].trim()
        : "";

    const imageUrl = getOffImageUrl(product, barcode);

    return { name, brand, imageUrl };
  } catch (error) {
    console.log("Product lookup error:", error);
    return { name: "", brand: "", imageUrl: "" };
  }
}

export default function ScannerScreen() {
  const router = useRouter();

  useEffect(() => {
    startScan();
  }, []);

  const startScan = async () => {
    try {
      const config = new BarcodeScannerScreenConfiguration();
      config.useCase = new SingleScanningMode();

      const result = await ScanbotBarcodeSDK.startBarcodeScanner(config);

      if (result.status !== "OK") {
        router.replace("/home");
        return;
      }

      const barcodeValue = result.data.items?.[0]?.barcode?.text;

      if (!barcodeValue) {
        Alert.alert("Error", "No barcode detected.");
        router.replace("/home");
        return;
      }

      const product = await lookupProductByBarcode(barcodeValue);

      router.replace({
        pathname: "/home",
        params: {
          openManual: "1",
          scanId: String(Date.now()),
          prefillName: product.name,
          prefillBrand: product.brand,
          prefillImageUrl: product.imageUrl,
        },
      });
    } catch (error) {
      console.log("Scan error:", error);
      Alert.alert("Scan error", "Could not complete the scan.");
      router.replace("/home");
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F062A5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F062A5",
    justifyContent: "center",
    alignItems: "center",
  },
});