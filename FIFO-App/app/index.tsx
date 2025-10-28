import React, { useCallback } from "react";
import { Alert, Button, View, ActivityIndicator } from "react-native";
import {
  BarcodeScannerScreenConfiguration,
  SingleScanningMode,
  MultipleScanningMode,
} from "react-native-scanbot-barcode-scanner-sdk";
import ScanbotBarcodeSDK from "react-native-scanbot-barcode-scanner-sdk";

export default function Index() {
  const fetchProductFromOpenFoodFacts = async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {
        const product = data.product;
        Alert.alert(
          "Product Found 🎉",
          `Name: ${product.product_name || "Unknown"}\nBrand: ${product.brands || "Unknown"}\nNutri-Score: ${product.nutriscore_grade?.toUpperCase() || "N/A"}`
        );
      } else {
        Alert.alert("Not Found", "This product is not in the Open Food Facts database.");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", "Failed to fetch product information.");
    }
  };

  const onSingleBarcodeScan = useCallback(async () => {
    try {
      const licenseInfo = await ScanbotBarcodeSDK.getLicenseInfo();
      if (!licenseInfo.isLicenseValid) return;

      const config = new BarcodeScannerScreenConfiguration();
      config.useCase = new SingleScanningMode();

      const result = await ScanbotBarcodeSDK.startBarcodeScanner(config);

      if (result.status === "OK" && result.data) {
        const barcodeValue = result.data.items[0]?.barcode.text;
        if (barcodeValue) {
          await fetchProductFromOpenFoodFacts(barcodeValue);
        } else {
          Alert.alert("Error", "No barcode detected.");
        }
      } else {
        console.log("User canceled scanning");
      }
    } catch (e: any) {
      console.log("An error occurred during barcode scan:", e.message);
    }
  }, []);

  const onMultiBarcodeScan = useCallback(async () => {
    try {
      const licenseInfo = await ScanbotBarcodeSDK.getLicenseInfo();
      if (!licenseInfo.isLicenseValid) return;

      const config = new BarcodeScannerScreenConfiguration();
      config.useCase = new MultipleScanningMode();

      const result = await ScanbotBarcodeSDK.startBarcodeScanner(config);

      if (result.status === "OK" && result.data) {
        const barcodes = result.data.items.map(i => i.barcode.text);
        Alert.alert("Scanned Barcodes", barcodes.join("\n"));
        // You could also loop over barcodes and fetch OFF data for each
      } else {
        console.log("User canceled scanning");
      }
    } catch (e: any) {
      console.log("An error occurred during barcode scan:", e.message);
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Start single barcode scanning" onPress={onSingleBarcodeScan} />
      <Button title="Start multi-barcode scanning" onPress={onMultiBarcodeScan} />
    </View>
  );
}
