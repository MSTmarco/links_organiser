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

// Export auth and db
const auth = firebase.auth();
const db = firebase.firestore();
