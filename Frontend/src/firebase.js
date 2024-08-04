import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCc9ruSP2C-6xtTnvXNfxWdoaYiXb94PRY",
  authDomain: "wellcare-b5b19.firebaseapp.com",
  projectId: "wellcare-b5b19",
  storageBucket: "wellcare-b5b19.appspot.com",
  messagingSenderId: "599732980999",
  appId: "1:599732980999:web:7f095c6d99876a33ad49a2",
  measurementId: "G-PNK9YM4TK5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
const provider = new GoogleAuthProvider();

export {
  auth,
  db,
  getToken,
  GoogleAuthProvider,
  messaging,
  onMessage,
  signInWithPopup,
};
