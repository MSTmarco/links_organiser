// ========== FIREBASE CONFIGURATION ==========
// Firebase integration for cloud storage and sync

const firebaseConfig = {
    apiKey: "AIzaSyDGScg87HkFvA4pWMvigdfRFp5GMUDQrPE",
    authDomain: "journal-74ede.firebaseapp.com",
    databaseURL: "https://journal-74ede-default-rtdb.firebaseio.com",
    projectId: "journal-74ede",
    storageBucket: "journal-74ede.firebasestorage.app",
    messagingSenderId: "628847335947",
    appId: "1:628847335947:web:b6402477b72e119ed3850e",
    measurementId: "G-X9R0HMYG0K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export auth and db globally
window.auth = firebase.auth();
window.db = firebase.firestore();

// Also export as FirebaseConfig if needed by app.js
window.FirebaseConfig = {
    auth: window.auth,
    db: window.db
};
