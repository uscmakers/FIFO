import { useEffect, useRef } from "react";
import { deleteProduct, getUserProducts } from "../firebase/firestore";

export type FridgeCategory =
  | "beverage"
  | "dairy"
  | "meat"
  | "produce"
  | "condiment"
  | "eggs"
  | "prepared_food"
  | "unsure";

export type ItemRecord = {
  category: FridgeCategory;
  brand: string;
  item_name: string;
  count: number;
};

type FridgeProduct = {
  id: string;
  name?: string;
  brand?: string;
  category?: string;
  product_type?: string;
  expirationDate?: string;
  [key: string]: any;
};

const CATEGORY_SET = new Set<FridgeCategory>([
  "beverage",
  "dairy",
  "meat",
  "produce",
  "condiment",
  "eggs",
  "prepared_food",
  "unsure",
]);

function normalize(value: string | undefined | null) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeCategory(value: string | undefined | null): FridgeCategory {
  const clean = normalize(value).replace(/\s+/g, "_") as FridgeCategory;
  return CATEGORY_SET.has(clean) ? clean : "unsure";
}

function getMatchScore(item: ItemRecord, product: FridgeProduct) {
  const itemCategory = normalize(item.category);
  const itemBrand = normalize(item.brand);
  const itemName = normalize(item.item_name);

  const productCategory = normalizeCategory(product.category ?? product.product_type);
  const productBrand = normalize(product.brand);
  const productName = normalize(product.name);

  let score = 0;

  if (itemCategory && productCategory) {
    if (itemCategory === productCategory) score += 5;
  }

  if (itemBrand && productBrand) {
    if (itemBrand === productBrand) score += 3;
    else if (itemBrand.includes(productBrand) || productBrand.includes(itemBrand)) {
      score += 1;
    }
  }

  if (itemName && productName) {
    if (itemName === productName) score += 4;
    else if (itemName.includes(productName) || productName.includes(itemName)) {
      score += 2;
    }
  }

  return score;
}

export function useNgrokSocket(onData: (data: ItemRecord[]) => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const onDataRef = useRef(onData);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    const socket = new WebSocket(
      "wss://subobscurely-pseudobiographical-vivienne.ngrok-free.dev/ws"
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Connected to Python server");
    };

    socket.onmessage = async (event) => {
      try {
        const parsed = JSON.parse(event.data) as ItemRecord[];
        console.log("📨 PARSED MESSAGE:", parsed);

        for (const item of parsed) {
          await removeMatchedProduct(item);
        }

        onDataRef.current(parsed);
      } catch (error) {
        console.log("❌ Failed to parse WebSocket message:", error);
        console.log("📨 RAW MESSAGE VALUE:", event.data);
      }
    };

    socket.onerror = (err) => {
      console.log("❌ WebSocket error:", JSON.stringify(err));
    };

    socket.onclose = (event) => {
      console.log(
        "🔌 WebSocket closed — code:",
        event.code,
        "reason:",
        event.reason,
        "wasClean:",
        event.wasClean
      );
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);
}

export async function productLookUp(product: ItemRecord) {
  const products = (await getUserProducts()) as FridgeProduct[];

  if (!products.length) return null;

  const ranked = products
    .map((p) => ({
      product: p,
      score: getMatchScore(product, p),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.length ? ranked[0].product : null;
}

export async function removeMatchedProduct(product: ItemRecord) {
  const matched = await productLookUp(product);

  if (!matched) {
    console.log("No matching fridge item found for:", product);
    return null;
  }

  await deleteProduct(matched.id);
  console.log("✅ Removed matched product:", matched);
  return matched;
}