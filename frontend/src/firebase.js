// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ THIS IS REQUIRED
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdSKdPOLycFysSp65fJmdSMB9DFJfA3BE",
  authDomain: "khadiauth.firebaseapp.com",
  projectId: "khadiauth",
  storageBucket: "khadiauth.firebasestorage.app",
  messagingSenderId: "292818654381",
  appId: "1:292818654381:web:45e0ac726a68bdaecc6224"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;