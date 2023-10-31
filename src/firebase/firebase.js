// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase } from 'firebase/database';



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZfnZbZIKR1zyywjrXJu0MJOjETO35aTE",
  authDomain: "split-bill-6c19e.firebaseapp.com",
  projectId: "split-bill-6c19e",
  storageBucket: "split-bill-6c19e.appspot.com",
  messagingSenderId: "297198677510",
  appId: "1:297198677510:web:9cec9889c3224da9735d87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };