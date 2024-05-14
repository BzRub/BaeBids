import { initializeApp } from "firebase/app";

var passwordHash = require("password-hash");

const firebaseConfig = {
  apiKey: "AIzaSyBJFeiqXkJxVU8SIwzFffvXx3RzPLEgCYg",
  authDomain: "baebids.firebaseapp.com",
  projectId: "baebids",
  storageBucket: "baebids.appspot.com",
  messagingSenderId: "465881448087",
  appId: "1:465881448087:web:2062c42fd8a4b12f95f3d2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
