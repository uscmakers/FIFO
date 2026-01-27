import React, { useCallback, useState } from "react";
import { Alert, Button, View, Modal, TextInput, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import {
  BarcodeScannerScreenConfiguration,
  SingleScanningMode,
} from "react-native-scanbot-barcode-scanner-sdk";
import ScanbotBarcodeSDK from "react-native-scanbot-barcode-scanner-sdk";
import { Product } from "../src/types/Product";
import { styles } from "../src/styles/scannerStyles";

export default function Index() {
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [showManualInputModal, setShowManualInputModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  
  // Manual input fields
  const [manualName, setManualName] = useState("");
  const [manualBrand, setManualBrand] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualExpiry, setManualExpiry] = useState("");

  const saveProduct = (product: Product, customExpiry: string | null = null) => {
    const productData = {
      name: product.product_name || "Unknown",
      brand: product.brands || "Unknown",
      barcode: product.code || "Unknown",
      expirationDate: customExpiry || product.expiration_date || "N/A",
      addedAt: new Date().toISOString(),
    };

    console.log("Product saved:", productData);
    Alert.alert(
      "Product Saved ✅",
      `${productData.name}\nExpires: ${productData.expirationDate}`
    );
  };

  const handleExpirySubmit = () => {
    if (!expiryDate.trim()) {
      Alert.alert("Error", "Please enter an expiration date");
      return;
    }
    
    if (currentProduct) {
      saveProduct(currentProduct, expiryDate);
    }
    setShowExpiryModal(false);
    setExpiryDate("");
    setCurrentProduct(null);
  };

  const handleManualSubmit = () => {
    if (!manualName.trim()) {
      Alert.alert("Error", "Please enter a product name");
      return;
    }

    if (!manualExpiry.trim()) {
      Alert.alert("Error", "Please enter an expiration date");
      return;
    }

    const manualProduct: Product = {
      product_name: manualName,
      brands: manualBrand || "Unknown",
      code: manualBarcode || "N/A",
      expiration_date: manualExpiry,
    };

    saveProduct(manualProduct, null);
    
    // Clear form and close modal
    setShowManualInputModal(false);
    setManualName("");
    setManualBrand("");
    setManualBarcode("");
    setManualExpiry("");
  };

  const fetchProductFromOpenFoodFacts = async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {
        const product: Product = data.product;
        
        if (!product.expiration_date || product.expiration_date === "N/A") {
          setCurrentProduct(product);
          setShowExpiryModal(true);
        } else {
          saveProduct(product, null);
        }
      } else {
        Alert.alert(
          "Not Found",
          "This product is not in the Open Food Facts database."
        );
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

  const onManualUserInput = useCallback(() => {
    setShowManualInputModal(true);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.mainButton} onPress={onSingleBarcodeScan}>
        <Text style={styles.mainButtonText}>Scan 💕</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.mainButton} onPress={onManualUserInput}>
        <Text style={styles.mainButtonText}>Input Product 🍭</Text>
      </TouchableOpacity>


      {/* Expiry Date Modal */}
      <Modal
        visible={showExpiryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExpiryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Expiration Date</Text>
            <Text style={styles.modalSubtitle}>
              {currentProduct?.product_name || "Product"}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY or DD/MM/YYYY"
              value={expiryDate}
              onChangeText={setExpiryDate}
              autoFocus
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowExpiryModal(false);
                  setExpiryDate("");
                  setCurrentProduct(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleExpirySubmit}
              >
                <Text style={[styles.buttonText, styles.submitText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInputModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManualInputModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Product Manually</Text>
              
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Organic Milk"
                value={manualName}
                onChangeText={setManualName}
                autoFocus
              />
              
              <Text style={styles.label}>Brand (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Horizon"
                value={manualBrand}
                onChangeText={setManualBrand}
              />
              
              <Text style={styles.label}>Barcode (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1234567890"
                value={manualBarcode}
                onChangeText={setManualBarcode}
                keyboardType="numeric"
              />
              
              <Text style={styles.label}>Expiration Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY or DD/MM/YYYY"
                value={manualExpiry}
                onChangeText={setManualExpiry}
              />
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowManualInputModal(false);
                    setManualName("");
                    setManualBrand("");
                    setManualBarcode("");
                    setManualExpiry("");
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleManualSubmit}
                >
                  <Text style={[styles.buttonText, styles.submitText]}>Add Product</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}