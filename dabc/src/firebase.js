import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { apiKey } from "./secret";

const firebaseConfig = {
  apiKey: apiKey,

  authDomain: "get-that-booze-mike.firebaseapp.com",

  projectId: "get-that-booze-mike",

  storageBucket: "get-that-booze-mike.appspot.com",

  messagingSenderId: "991801233414",

  appId: "1:991801233414:web:2669ce31d88e1f45ec3387",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
