// 🔥 FIREBASE CONFIGURATION - Stitches by S
const firebaseConfig = {
    apiKey: "AIzaSyDopqJIc9mAlNquX2IcHdD99WyRIm-zExU",
    authDomain: "stitches-by-s.firebaseapp.com",
    projectId: "stitches-by-s",
    storageBucket: "stitches-by-s.appspot.com",
    messagingSenderId: "924439808583",
    appId: "1:924439808583:web:ba328fa2bce670cad4bf62"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("✅ Firebase initialized for Stitches by S!");
console.log("📊 Project ID:", firebaseConfig.projectId);
