// ========== FIREBASE CONFIGURATION ==========
// Firebase integration for cloud storage and sync

const FirebaseConfig = {
    config: {
        apiKey: "AIzaSyDGScg87HkFvA4pWMvigdfRFp5GMUDQrPE",
        authDomain: "journal-74ede.firebaseapp.com",
        databaseURL: "https://journal-74ede-default-rtdb.firebaseio.com",
        projectId: "journal-74ede",
        storageBucket: "journal-74ede.firebasestorage.app",
        messagingSenderId: "628847335947",
        appId: "1:628847335947:web:b6402477b72e119ed3850e",
        measurementId: "G-X9R0HMYG0K"
    },

    init() {
        try {
            // Initialize Firebase
            firebase.initializeApp(this.config);
            
            // Set up auth and db
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // Make available globally
            window.auth = this.auth;
            window.db = this.db;
            
            console.log('✅ Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            alert('Failed to connect to cloud. Using local storage only.');
            return false;
        }
    }
};

// Make available globally
window.FirebaseConfig = FirebaseConfig;
