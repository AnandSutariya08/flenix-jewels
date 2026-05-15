import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCOkXybrDQX9TLbHs9fyLvrKLt5XWAIgwI",
  authDomain: "flenix-jewels.firebaseapp.com",
  projectId: "flenix-jewels",
  storageBucket: "flenix-jewels.firebasestorage.app",
  messagingSenderId: "758181914278",
  appId: "1:758181914278:web:cb951281b928920a2cf667",
  measurementId: "G-4CN8M7YR2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
