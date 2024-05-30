// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBh54Scp_YutXdoCpyKD2p8HCi-_z9Y0mU",
  authDomain: "messenger-24838.firebaseapp.com",
  projectId: "messenger-24838",
  storageBucket: "messenger-24838.appspot.com",
  messagingSenderId: "1098559676776",
  appId: "1:1098559676776:web:9b8c4447aea9e5568e76dd",
  measurementId: "G-LETFPJFTT7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
