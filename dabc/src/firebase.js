import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBZLLVrCqB0iq3GcDdY9RsthS56_et_kvc",

  authDomain: "get-that-booze-mike.firebaseapp.com",

  projectId: "get-that-booze-mike",

  storageBucket: "get-that-booze-mike.appspot.com",

  messagingSenderId: "991801233414",

  appId: "1:991801233414:web:2669ce31d88e1f45ec3387",
};

const app = initializeApp(firebaseConfig);

export { app };
