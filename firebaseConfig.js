import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB7r4b_Vx7SxB1VloJbpHp5E2dpxzMhaqk",
  authDomain: "axolo-apb.firebaseapp.com",
  projectId: "axolo-apb",
  storageBucket: "axolo-apb.appspot.com",
  messagingSenderId: "123985274865",
  appId: "1:123985274865:web:d989f61c2b166a71f4c650",
  measurementId: "G-4V21H2V725"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence, but only once
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { app, auth };
