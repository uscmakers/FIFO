import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: /* insert API key from firestore */,
  authDomain: /* insert authDomain from firestore */,
  projectId: /* insert projectId from firestore */,
  storageBucket: /* insert storageBucket from firestore */,
  messagingSenderId: /* insert messagingSenderId from firestore */,
  appId: /* insert appId from firestore */,
};

export const app = initializeApp(firebaseConfig);