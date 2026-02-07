import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Copy these exact values from your 2nd screenshot
const firebaseConfig = {
  apiKey: "AIzaSyD0UFaGik6BRZ9XyOS1mcLeMbxBdzXJP14",
  authDomain: "cricket-match-6a2e4.firebaseapp.com",
  projectId: "cricket-match-6a2e4",
  storageBucket: "cricket-match-6a2e4.firebasestorage.app",
  messagingSenderId: "293872374837",
  appId: "1:293872374837:web:f45757847e20af9ca58d7c",
  measurementId: "G-4XG21S2C7C"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // This 'db' variable is what you'll use to save runs