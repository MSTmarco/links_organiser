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

    app: null,
    auth: null,
    db: null,
    currentUser: null,

    // ========== INITIALIZATION ==========
    
    async init() {
        try {
            // Import Firebase SDK from CDN
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } = 
                await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            const { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = 
                await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Initialize Firebase
            this.app = initializeApp(this.config);
            this.auth = getAuth(this.app);
            this.db = getFirestore(this.app);

            // Store Firebase functions globally
            window.firebaseAuth = { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup };
            window.firebaseDB = { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where };

            console.log('✅ Firebase initialized successfully');

            // Listen for auth state changes
            onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                if (user) {
                    console.log('✅ User logged in:', user.email);
                    this.syncDataFromCloud();
                    this.showMainApp();
                } else {
                    console.log('❌ User logged out');
                    this.showAuthScreen();
                }
            });

            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            alert('Failed to connect to cloud. Using local storage only.');
            return false;
        }
    },

    // ========== AUTHENTICATION ==========

    async signup(email, password) {
        try {
            const { createUserWithEmailAndPassword } = window.firebaseAuth;
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            console.log('✅ User created:', userCredential.user.email);
            
            // Migrate local data to cloud after signup
            await this.migrateLocalDataToCloud();
            
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Signup error:', error);
            return { success: false, error: error.message };
        }
    },

    async login(email, password) {
        try {
            const { signInWithEmailAndPassword } = window.firebaseAuth;
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            console.log('✅ User logged in:', userCredential.user.email);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message };
        }
    },

    async loginWithGoogle() {
        try {
            const { GoogleAuthProvider, signInWithPopup } = window.firebaseAuth;
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(this.auth, provider);
            console.log('✅ User logged in with Google:', result.user.email);
            
            // Migrate local data to cloud after Google sign-in
            await this.migrateLocalDataToCloud();
            
            return { success: true, user: result.user };
        } catch (error) {
            console.error('❌ Google login error:', error);
            return { success: false, error: error.message };
        }
    },

    async logout() {
        try {
            const { signOut } = window.firebaseAuth;
            await signOut(this.auth);
            console.log('✅ User logged out');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    // ========== DATA SYNC ==========

    async saveToCloud(path, data) {
        if (!this.currentUser) {
            console.log('⚠️ No user logged in, saving to local only');
            return false;
        }

        try {
            const { doc, setDoc } = window.firebaseDB;
            const docRef = doc(this.db, `users/${this.currentUser.uid}/${path}`);
            await setDoc(docRef, data, { merge: true });
            console.log(`✅ Saved to cloud: ${path}`);
            return true;
        } catch (error) {
            console.error('❌ Cloud save error:', error);
            return false;
        }
    },

    async getFromCloud(path) {
        if (!this.currentUser) {
            return null;
        }

        try {
            const { doc, getDoc } = window.firebaseDB;
            const docRef = doc(this.db, `users/${this.currentUser.uid}/${path}`);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log(`✅ Retrieved from cloud: ${path}`);
                return docSnap.data();
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
            // This will be called by your app to sync papers and folders
            console.log('✅ Ready to sync data from cloud');
            
            // The actual sync logic will be in storage.js
            // which will call Storage.syncWithCloud() if needed
            
        } catch (error) {
            console.error('❌ Sync error:', error);
        }
    },

    async migrateLocalDataToCloud() {
        if (!this.currentUser) return;

        console.log('🔄 Migrating local data to cloud...');

        try {
            // Get papers from localStorage
            const papers = localStorage.getItem('research_papers');
            if (papers) {
                const { collection, doc, setDoc } = window.firebaseDB;
                const papersData = JSON.parse(papers);
                
                // Save each paper to Firestore
                for (const paper of papersData) {
                    const paperRef = doc(this.db, `users/${this.currentUser.uid}/papers/${paper.id}`);
                    await setDoc(paperRef, paper);
                }
                console.log('✅ Papers migrated to cloud');
            }

            // Get folders from localStorage
            const folders = localStorage.getItem('research_folders');
            if (folders) {
                const { doc, setDoc } = window.firebaseDB;
                const foldersData = JSON.parse(folders);
                
                // Save each folder to Firestore
                for (const folder of foldersData) {
                    const folderRef = doc(this.db, `users/${this.currentUser.uid}/folders/${folder.id}`);
                    await setDoc(folderRef, folder);
                }
                console.log('✅ Folders migrated to cloud');
            }

            console.log('✅ Local data migrated to cloud');
        } catch (error) {
            console.error('❌ Migration error:', error);
        }
    },

    // ========== UI MANAGEMENT ==========

    showAuthScreen() {
        const authPage = document.getElementById('auth-page');
        const mainApp = document.getElementById('main-app');
        
        if (authPage) {
            authPage.classList.remove('hidden');
        }
        if (mainApp) {
            mainApp.classList.add('hidden');
        }
    },

    showMainApp() {
        const authPage = document.getElementById('auth-page');
        const mainApp = document.getElementById('main-app');
        
        if (authPage) {
            authPage.classList.add('hidden');
        }
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }

        // Update user email display
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement && this.currentUser) {
            userEmailElement.textContent = this.currentUser.email;
        }

        // Initialize app components
        if (window.Folders) window.Folders.init();
        if (window.Papers) window.Papers.init();
    }
};

// Make available globally
window.FirebaseConfig = FirebaseConfig;
