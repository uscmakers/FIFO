import React, { useEffect } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import {
  BarcodeScannerScreenConfiguration,
  SingleScanningMode,
} from "react-native-scanbot-barcode-scanner-sdk";
import ScanbotBarcodeSDK from "react-native-scanbot-barcode-scanner-sdk";
import { useRouter } from "expo-router";

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

      if (result.status === "OK" && result.data?.items?.length > 0) {
        const barcodeValue = result.data.items[0]?.barcode?.text;

        if (barcodeValue) {
          router.replace({
            pathname: "/home",
            params: {
              openManual: "1",
              barcode: barcodeValue,
            },
          });
          return;
        }
      }

      router.replace("/home");
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