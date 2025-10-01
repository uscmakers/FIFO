import { Stack } from "expo-router";
import { useEffect } from "react";
import ScanbotBarcodeSDK from "react-native-scanbot-barcode-scanner-sdk"

export default function RootLayout() {

useEffect(() => {
  ScanbotBarcodeSDK
    .initializeSdk({ licenseKey: "" })
    .then(result => console.log(result))
    .catch(err => console.log(err));
}, []);

  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}