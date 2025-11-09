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
        appId: "1:628847335947:web:b6402477b72e119ed3850e"
    },

    app: null,
    auth: null,
    database: null,
    currentUser: null,

    // ========== INITIALIZATION ==========
    
    async init() {
        try {
            // Import Firebase SDK from CDN
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } = 
                await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            const { getDatabase, ref, set, get, update, remove, onValue } = 
                await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

            // Initialize Firebase
            this.app = initializeApp(this.config);
            this.auth = getAuth(this.app);
            this.database = getDatabase(this.app);

            // Store Firebase functions globally
            window.firebaseAuth = { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup };
            window.firebaseDB = { ref, set, get, update, remove, onValue };

            console.log('✅ Firebase initialized successfully');

            // Listen for auth state changes
            onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                if (user) {
                    console.log('✅ User logged in:', user.email);
                    this.syncDataFromCloud();
                    
                    // Call the app's auth handler
                    if (window.onAuthStateChanged) {
                        window.onAuthStateChanged(user);
                    }
                } else {
                    console.log('❌ User logged out');
                    
                    // Call the app's auth handler
                    if (window.onAuthStateChanged) {
                        window.onAuthStateChanged(null);
                    }
                }
            });

            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            alert('Failed to connect to cloud. Using local storage only.');
            return false;
        }
    },

    // ========== CLOUD STORAGE ==========

    async saveToCloud(path, data) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const userPath = `users/${userId}/${path}`;

        try {
            await set(ref(this.database, userPath), data);
            console.log(`✅ Saved to cloud: ${path}`);
        } catch (error) {
            console.error('❌ Cloud save error:', error);
        }
    },

    async getFromCloud(path) {
        if (!this.currentUser) return null;

        const userId = this.currentUser.uid;
        const userPath = `users/${userId}/${path}`;

        try {
            const snapshot = await get(ref(this.database, userPath));
            
            if (snapshot.exists()) {
                console.log(`✅ Retrieved from cloud: ${path}`);
                return snapshot.val();
            }
            return null;
        } catch (error) {
            console.error('❌ Cloud get error:', error);
            return null;
        }
    },

    async syncDataFromCloud() {
        if (!this.currentUser) return;

        try {
            // Get papers
            const papers = await this.getFromCloud('papers');
            if (papers) {
                localStorage.setItem('papers', JSON.stringify(papers));
                console.log('✅ Synced papers from cloud');
            }

            // Get folders
            const folders = await this.getFromCloud('folders');
            if (folders) {
                localStorage.setItem('folders', JSON.stringify(folders));
                console.log('✅ Synced folders from cloud');
            }

            // Refresh UI
            if (window.Papers) window.Papers.render();
            if (window.Folders) {
                window.Folders.render();
                window.Folders.updateCounts();
            }

        } catch (error) {
            console.error('❌ Sync error:', error);
        }
    }
};

// Make FirebaseConfig available globally
window.FirebaseConfig = FirebaseConfig;
