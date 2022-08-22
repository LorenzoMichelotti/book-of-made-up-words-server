
const { initializeApp } = require('firebase/app');
const { getAnalytics } = require('firebase/analytics');
const {getFirestore} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDulHa34BZ9HyLZ42vmz6QPeVFFV12fRHM",
  authDomain: "book-of-made-up-words.firebaseapp.com",
  projectId: "book-of-made-up-words",
  storageBucket: "book-of-made-up-words.appspot.com",
  messagingSenderId: "775455711512",
  appId: "1:775455711512:web:850cff1fb9f63efaee7e6d",
  measurementId: "G-VKEH7YCDL7"
};

let analytics; let firestore;
if (firebaseConfig?.projectId) {
  // Initialize Firebase
  const firebase = initializeApp(firebaseConfig);

  if (firebase.name && typeof window !== 'undefined') {
    analytics = getAnalytics(firebase);
  }
  // Access Firebase services using shorthand notation
  firestore = getFirestore();
}

const connFirestore = (req, res, next) => {
  req.analytics = analytics;
  req.firestore = firestore;
  next();
};

module.exports = connFirestore;