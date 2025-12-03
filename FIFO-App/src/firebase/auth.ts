import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

export const registerUser = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);
