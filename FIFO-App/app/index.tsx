import {Alert, Button, View} from "react-native";
import {useCallback} from "react";
import {
  BarcodeScannerScreenConfiguration,
  SingleScanningMode, 
  MultipleScanningMode,
  BarcodeFormat
} from "react-native-scanbot-barcode-scanner-sdk";


import ScanbotBarcodeSDK from "react-native-scanbot-barcode-scanner-sdk";

export default function Index() {

  const onSingleBarcodeScan = useCallback(async () => {
    try {
      /** Check license status and return early if the license is not valid */
       if (!(await ScanbotBarcodeSDK.getLicenseInfo()).isLicenseValid) {
        return;
      }
      /**
       * Instantiate a configuration object of BarcodeScannerConfiguration and
       * start the barcode scanner with the configuration
       */
      const config = new BarcodeScannerScreenConfiguration();
      /** Initialize the use case for single scanning */
      config.useCase = new SingleScanningMode();
      /** Start the BarcodeScanner */
      const result = await ScanbotBarcodeSDK.startBarcodeScanner(config);
      /** Handle the result if result status is OK */
      if (result.status === 'OK' && result.data) {
        Alert.alert(
          "Barcode Scanning successfully!",
          `${result.data.items.map(barcode =>
            `Barcode value: ${barcode.barcode.text} and type: ${barcode.barcode.format}`
          ).join("\n")}`);
      } else {
        console.log("The user has canceled the Barcode Scanning")
      }
    } catch (e: any) {
      console.log("An error has occurred while running Barcode Scanner", e.message);
    }
  }, []);
  const onMultiBarcodeScan = useCallback(async () => {
  try {
    /** Check license status and return early if the license is not valid */
      if (!(await ScanbotBarcodeSDK.getLicenseInfo()).isLicenseValid) {
        return;
      }
    /**
     * Instantiate a configuration object of BarcodeScannerConfiguration and
     * start the barcode scanner with the configuration
     */
    const config = new BarcodeScannerScreenConfiguration();
    /** Initialize the use case for multi-scanning */
    config.useCase = new MultipleScanningMode();
    /** Start the BarcodeScanner */
    const result = await ScanbotBarcodeSDK.startBarcodeScanner(config);
    /** Handle the result if result status is OK */
    if (result.status === 'OK' && result.data) {
      Alert.alert(
        "Barcode Scanning successfully!",
        `${result.data.items.map(barcode =>
          `Barcode value: ${barcode.barcode.text} and type: ${barcode.barcode.format}`
        ).join("\n")}`);
    } else {
      console.log("The user has canceled the Barcode Scanning")
    }
  } catch (e: any) {
    console.log("An error has occurred while running Barcode Scanner", e.message);
  }
}, []);

const onAROverlayBarcodeScan = useCallback(async () => {
  try {
    /** Check license status and return early if the license is not valid */
     if (!(await ScanbotBarcodeSDK.getLicenseInfo()).isLicenseValid) {
        return;
      }
    /**
     * Instantiate a configuration object of BarcodeScannerConfiguration and
     * start the barcode scanner with the configuration
     */
    const config = new BarcodeScannerScreenConfiguration();
    /** Initialize the use case for multi-scanning */
    config.useCase = new MultipleScanningMode();
    /** Configure AR Overlay. */
    config.useCase.arOverlay.visible = true;
    config.useCase.arOverlay.automaticSelectionEnabled = false;
    /** Start the BarcodeScanner */
    const result = await ScanbotBarcodeSDK.startBarcodeScanner(config);
    /** Handle the result if result status is OK */
    if (result.status === 'OK' && result.data) {
      Alert.alert(
        "Barcode Scanning successfully!",
        `${result.data.items.map(barcode =>
          `Barcode value: ${barcode.barcode.text} and type: ${barcode.barcode.format}`
        ).join("\n")}`);
    } else {
      console.log("The user has canceled the Barcode Scanning")
    }
  } catch (e: any) {
    console.log("An error has occurred while running Barcode Scanner", e.message);
  }
}, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title={"Start single barcode scanning"} onPress={onSingleBarcodeScan}/>
      <Button title={"Start multi-barcode scanning"} onPress={onMultiBarcodeScan}/>
    <Button title={"Start AR Overlay barcode scanning"} onPress={onAROverlayBarcodeScan}/>
    </View>
  );
}