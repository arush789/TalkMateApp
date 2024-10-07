import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: `${process.env.GOOGLE_API_KEY}`,
  authDomain: "talkmate-b5c8d.firebaseapp.com",
  projectId: "talkmate-b5c8d",
  storageBucket: "talkmate-b5c8d.appspot.com",
  messagingSenderId: "508998522741",
  appId: "1:508998522741:web:0526ece061d94fc4be253c",
  measurementId: "G-260V35FT0W",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const storage = firebase.storage();
export { storage };
