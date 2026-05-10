# Stitches by S - Income & Expense Tracker

Professional income and expense tracking application for tailoring businesses.

## 🚀 Features

- ✅ Track income (Tailoring Work, Alterations)
- ✅ Track expenses (Accessories, Thread & Needles)
- ✅ PDF report generation
- ✅ Real-time Firestore sync
- ✅ Mobile-responsive design
- ✅ Data export functionality

## 📦 Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "stitches-by-s-tracker"
3. Enable Firestore Database
4. Get your Firebase config

### 2. Update Firebase Config

Edit `firebase-config.js`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
