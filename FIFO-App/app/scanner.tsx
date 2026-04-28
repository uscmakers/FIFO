import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
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
  ];

  const direct = directCandidates.find(
    (v) => typeof v === "string" && v.trim().length > 0
  );

  if (direct) return direct;

  return "";
}

async function lookupProductByBarcode(
  barcode: string
): Promise<LookupResult> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await res.json();
    const product = data?.product ?? null;

    return {
      name: product?.product_name ?? "",
      brand: product?.brands?.split(",")[0] ?? "",
      imageUrl: getOffImageUrl(product, barcode),
    };
  } catch {
    return { name: "", brand: "", imageUrl: "" };
  }
}

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
  
    const product = await lookupProductByBarcode(data);
  
    router.navigate({
      pathname: "/home",
      params: {
        openManual: "1",
        scanId: String(Date.now()),
        prefillName: product.name,
        prefillBrand: product.brand,
        prefillImageUrl: product.imageUrl,
      },
    });
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission required</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="front"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={handleScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});