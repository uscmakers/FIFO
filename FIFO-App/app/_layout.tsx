// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import ScanbotBarcodeSDK from "react-native-scanbot-barcode-scanner-sdk";

export default function RootLayout() {
  useEffect(() => {
    ScanbotBarcodeSDK.initializeSdk({ licenseKey: "" })
      .then(() => console.log("Scanbot initialized"))
      .catch(err => console.log("Scanbot error:", err));
  }, []);

  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="scanner" options={{ headerShown: false }} />
    </Stack>
  );
}
