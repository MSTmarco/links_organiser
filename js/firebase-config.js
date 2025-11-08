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
            const { ref, set } = window.firebaseDB;
            const userPath = `users/${this.currentUser.uid}/${path}`;
            await set(ref(this.database, userPath), data);
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
            const { ref, get } = window.firebaseDB;
            const userPath = `users/${this.currentUser.uid}/${path}`;
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
            // Get journal entries
            const entries = await this.getFromCloud('journal/entries');
            if (entries) {
                localStorage.setItem('journal_entries', JSON.stringify(entries));
                console.log('✅ Synced journal entries from cloud');
            }

            // Get projects
            const projects = await this.getFromCloud('projects/projects');
            if (projects) {
                localStorage.setItem('projects', JSON.stringify(projects));
                console.log('✅ Synced projects from cloud');
            }

            // Refresh UI
            if (window.Journal) window.Journal.updateStats();
            if (window.Projects) {
                window.Projects.updateStats();
                window.Projects.loadProjects();
            }
            if (window.Calendar) window.Calendar.update();

        } catch (error) {
            console.error('❌ Sync error:', error);
        }
    },

    async migrateLocalDataToCloud() {
        if (!this.currentUser) return;

        console.log('🔄 Migrating local data to cloud...');

        try {
            // Migrate journal entries
            const entries = localStorage.getItem('journal_entries');
            if (entries) {
                await this.saveToCloud('journal/entries', JSON.parse(entries));
            }

            // Migrate projects
            const projects = localStorage.getItem('projects');
            if (projects) {
                await this.saveToCloud('projects/projects', JSON.parse(projects));
            }

            console.log('✅ Local data migrated to cloud');
        } catch (error) {
            console.error('❌ Migration error:', error);
        }
    },

    // ========== UI MANAGEMENT ==========

    showAuthScreen() {
        const authScreen = document.getElementById('authScreen');
        const mainContainer = document.querySelector('.container');
        const userBar = document.getElementById('userBar');
        
        if (authScreen) {
            authScreen.classList.add('show');
            authScreen.style.display = 'flex';
        }
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }
        if (userBar) {
            userBar.classList.remove('show');
        }
    },

    showMainApp() {
        const authScreen = document.getElementById('authScreen');
        const mainContainer = document.querySelector('.container');
        const userBar = document.getElementById('userBar');
        
        if (authScreen) {
            authScreen.classList.remove('show');
            authScreen.style.display = 'none';
        }
        if (mainContainer) {
            mainContainer.style.display = 'block';
        }
        if (userBar) {
            userBar.classList.add('show');
        }

        // Update user email display
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && this.currentUser) {
            userEmailElement.textContent = this.currentUser.email;
            
            // Update avatar
            const avatar = this.currentUser.email.charAt(0).toUpperCase();
            const avatarElement = document.getElementById('userAvatar');
            if (avatarElement) {
                avatarElement.textContent = avatar;
            }
        }
    }
};

// Make available globally
window.FirebaseConfig = FirebaseConfig;
