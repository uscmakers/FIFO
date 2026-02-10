import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDtlTcb5tX1ASIALxqo2g11i_O7JyM6eW8",
  authDomain: "fifo-d8259.firebaseapp.com",
  projectId: "fifo-d8259",
  storageBucket: "fifo-d8259.firebasestorage.app",
  messagingSenderId: "175573086624",
  appId: "1:175573086624:web:4954b0f60500423cbd74c5",
  measurementId: "G-0G5F6NT42S"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);