import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBJFeiqXkJxVU8SIwzFffvXx3RzPLEgCYg",
  authDomain: "baebids.firebaseapp.com",
  projectId: "baebids",
  storageBucket: "baebids.appspot.com",
  messagingSenderId: "465881448087",
  appId: "1:465881448087:web:2062c42fd8a4b12f95f3d2"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, storage, db };