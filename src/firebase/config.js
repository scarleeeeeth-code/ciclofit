import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAtyU9J0xIH1Ytzl_qGVRH-qUfTIsngdU",
  authDomain: "ciclofit-4c45d.firebaseapp.com",
  projectId: "ciclofit-4c45d",
  storageBucket: "ciclofit-4c45d.firebasestorage.app",
  messagingSenderId: "131687836419",
  appId: "1:131687836419:web:c6820a0fdbdb55019b1736"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);