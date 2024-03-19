// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAr2S2vzscXNAKClv6TSrtRheh3OQnyHxE",
  authDomain: "kk-app-f632c.firebaseapp.com",
  projectId: "kk-app-f632c",
  storageBucket: "kk-app-f632c.appspot.com",
  messagingSenderId: "444074236616",
  appId: "1:444074236616:web:903a5627513c48f66fa3fd",
  measurementId: "G-TQFK41NZTZ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const firestore = getFirestore(app);
