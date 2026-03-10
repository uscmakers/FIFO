import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { app } from "./config";
import { auth } from "./auth";

export const db = getFirestore(app);

// Save product under: users/{uid}/products/{barcode}
export async function saveProductToFirestore(product: any) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docId =
    product.barcode !== "N/A"
      ? product.barcode
      : `manual_${Date.now()}`;

  await setDoc(
    doc(db, `users/${user.uid}/products/${docId}`),
    {
      name: product.name,
      brand: product.brand,
      barcode: product.barcode,
      expirationDate: product.expirationDate,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      imageUrl: product.image_url || "",
    },
    { merge: true }
  );
}

export async function getUserProducts() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, `users/${user.uid}/products`),
    orderBy("addedAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function deleteProduct(productId: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const docRef = doc(db, `users/${user.uid}/products/${productId}`);
  await deleteDoc(docRef);
}