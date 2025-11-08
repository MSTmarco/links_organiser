// ========== MAIN APP ORCHESTRATOR ==========
// Handles authentication and coordinates all modules

const App = {
    // ========== INITIALIZATION ==========

    async init() {
        console.log('🚀 Initializing Research Paper Repository...');
        
        // Initialize Firebase
        await FirebaseConfig.init();
        
        // Setup auth UI
        this.setupAuthUI();
    },

    // ========== AUTHENTICATION UI ==========

    setupAuthUI() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Signup form
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSignup();
        });

        // Google sign in
        document.getElementById('google-signin').addEventListener('click', async () => {
            await this.handleGoogleSignIn();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            await this.handleLogout();
        });
    },

    switchAuthTab(tabName) {
        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');

        // Clear error messages
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('show');
            msg.textContent = '';
        });
    },

    // ========== AUTHENTICATION HANDLERS ==========

    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');

        try {
            await window.firebaseAuth.signInWithEmailAndPassword(
                FirebaseConfig.auth,
                email,
                password
            );
            // Success handled by onAuthStateChanged
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = this.getErrorMessage(error.code);
            errorElement.classList.add('show');
        }
    },

    async handleSignup() {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-password-confirm').value;
        const errorElement = document.getElementById('signup-error');

        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.classList.add('show');
            return;
        }

        if (password.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters';
            errorElement.classList.add('show');
            return;
        }

        try {
            await window.firebaseAuth.createUserWithEmailAndPassword(
                FirebaseConfig.auth,
                email,
                password
            );
            // Success handled by onAuthStateChanged
        } catch (error) {
            console.error('Signup error:', error);
            errorElement.textContent = this.getErrorMessage(error.code);
            errorElement.classList.add('show');
        }
    },

    async handleGoogleSignIn() {
        try {
            const provider = new window.firebaseAuth.GoogleAuthProvider();
            await window.firebaseAuth.signInWithPopup(FirebaseConfig.auth, provider);
            // Success handled by onAuthStateChanged
        } catch (error) {
            console.error('Google sign in error:', error);
            alert('Google sign in failed. Please try again.');
        }
    },

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await window.firebaseAuth.signOut(FirebaseConfig.auth);
                // Will trigger onAuthStateChanged
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            }
        }
    },

    // ========== APP STATE ==========

    async showMainApp(user) {
        // Hide auth screen
        document.getElementById('auth-screen').style.display = 'none';
        
        // Show main app
        document.getElementById('main-app').style.display = 'flex';
        
        // Set user email
        document.getElementById('user-email').textContent = user.email;

        // Sync data from cloud
        await Storage.syncFromCloud();

        // Initialize modules
        Folders.init();
        Papers.init();

        console.log('✅ App ready!');
    },

    hideMainApp() {
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    },

    // ========== UTILITY ==========

    getErrorMessage(errorCode) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password is too weak',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid email or password',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        };

        return messages[errorCode] || 'An error occurred. Please try again.';
    },

    // ========== EXPORT/IMPORT ==========

    exportData() {
        Storage.exportData();
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const success = Storage.importData(event.target.result);
                    if (success) {
                        alert('Data imported successfully!');
                        location.reload();
                    } else {
                        alert('Import failed. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
};

// ========== FIREBASE AUTH STATE LISTENER ==========
// This is called by FirebaseConfig when auth state changes

window.onAuthStateChanged = (user) => {
    if (user) {
        App.showMainApp(user);
    } else {
        App.hideMainApp();
    }
};

// ========== START THE APP ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App available globally
window.App = App;
