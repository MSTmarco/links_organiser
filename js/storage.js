// ========== STORAGE MODULE ==========
// Handles all data persistence (localStorage and Firebase sync)

const Storage = {
    // ========== LOCAL STORAGE KEYS ==========
    PAPERS_KEY: 'papers',
    FOLDERS_KEY: 'folders',

    // ========== PAPERS METHODS ==========
    
    getPapers() {
        const papers = localStorage.getItem(this.PAPERS_KEY);
        return papers ? JSON.parse(papers) : [];
    },

    savePapers(papers) {
        localStorage.setItem(this.PAPERS_KEY, JSON.stringify(papers));
        this.syncToCloud();
    },

    addPaper(paper) {
        const papers = this.getPapers();
        paper.id = this.generateId();
        paper.createdAt = new Date().toISOString();
        paper.updatedAt = new Date().toISOString();
        papers.push(paper);
        this.savePapers(papers);
        return paper;
    },

    updatePaper(id, updates) {
        const papers = this.getPapers();
        const index = papers.findIndex(p => p.id === id);
        if (index !== -1) {
            papers[index] = {
                ...papers[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.savePapers(papers);
            return papers[index];
        }
        return null;
    },

    deletePaper(id) {
        const papers = this.getPapers();
        const filtered = papers.filter(p => p.id !== id);
        this.savePapers(filtered);
    },

    getPaperById(id) {
        const papers = this.getPapers();
        return papers.find(p => p.id === id);
    },

    getPapersByFolder(folderId) {
        const papers = this.getPapers();
        if (folderId === 'all' || !folderId) {
            return papers;
        }
        return papers.filter(p => p.folderId === folderId);
    },

    searchPapers(query) {
        const papers = this.getPapers();
        const lowerQuery = query.toLowerCase();
        return papers.filter(p => {
            return (
                p.title.toLowerCase().includes(lowerQuery) ||
                (p.summary && p.summary.toLowerCase().includes(lowerQuery)) ||
                (p.notes && p.notes.toLowerCase().includes(lowerQuery)) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
            );
        });
    },

    // ========== FOLDERS METHODS ==========

    getFolders() {
        const folders = localStorage.getItem(this.FOLDERS_KEY);
        return folders ? JSON.parse(folders) : [];
    },

    saveFolders(folders) {
        localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
        this.syncToCloud();
    },

    addFolder(folder) {
        const folders = this.getFolders();
        folder.id = this.generateId();
        folder.createdAt = new Date().toISOString();
        folders.push(folder);
        this.saveFolders(folders);
        return folder;
    },

    updateFolder(id, updates) {
        const folders = this.getFolders();
        const index = folders.findIndex(f => f.id === id);
        if (index !== -1) {
            folders[index] = { ...folders[index], ...updates };
            this.saveFolders(folders);
            return folders[index];
        }
        return null;
    },

    deleteFolder(id) {
        const folders = this.getFolders();
        const filtered = folders.filter(f => f.id !== id);
        this.saveFolders(filtered);
        
        // Remove folder reference from papers
        const papers = this.getPapers();
        papers.forEach(paper => {
            if (paper.folderId === id) {
                paper.folderId = null;
            }
        });
        this.savePapers(papers);
    },

    getFolderById(id) {
        const folders = this.getFolders();
        return folders.find(f => f.id === id);
    },

    // ========== UTILITY METHODS ==========

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // ========== FIREBASE SYNC ==========

    async syncToCloud() {
        if (!FirebaseConfig.currentUser) return;

        try {
            const userId = FirebaseConfig.currentUser.uid;
            const papers = this.getPapers();
            const folders = this.getFolders();

            await window.firebaseDB.set(
                window.firebaseDB.ref(FirebaseConfig.database, `users/${userId}/papers`),
                papers
            );

            await window.firebaseDB.set(
                window.firebaseDB.ref(FirebaseConfig.database, `users/${userId}/folders`),
                folders
            );

            console.log('✅ Data synced to cloud');
        } catch (error) {
            console.error('❌ Sync to cloud failed:', error);
        }
    },

    async syncFromCloud() {
        if (!FirebaseConfig.currentUser) return;

        try {
            const userId = FirebaseConfig.currentUser.uid;

            // Get papers
            const papersSnapshot = await window.firebaseDB.get(
                window.firebaseDB.ref(FirebaseConfig.database, `users/${userId}/papers`)
            );

            if (papersSnapshot.exists()) {
                const papers = papersSnapshot.val();
                localStorage.setItem(this.PAPERS_KEY, JSON.stringify(papers));
            }

            // Get folders
            const foldersSnapshot = await window.firebaseDB.get(
                window.firebaseDB.ref(FirebaseConfig.database, `users/${userId}/folders`)
            );

            if (foldersSnapshot.exists()) {
                const folders = foldersSnapshot.val();
                localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
            }

            console.log('✅ Data synced from cloud');
        } catch (error) {
            console.error('❌ Sync from cloud failed:', error);
        }
    },

    // ========== EXPORT/IMPORT ==========

    exportData() {
        const data = {
            papers: this.getPapers(),
            folders: this.getFolders(),
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `papers-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.papers) {
                localStorage.setItem(this.PAPERS_KEY, JSON.stringify(data.papers));
            }
            
            if (data.folders) {
                localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(data.folders));
            }
            
            this.syncToCloud();
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    },

    // ========== CLEAR DATA ==========

    clearAllData() {
        if (confirm('Are you sure you want to delete all papers and folders? This cannot be undone.')) {
            localStorage.removeItem(this.PAPERS_KEY);
            localStorage.removeItem(this.FOLDERS_KEY);
            this.syncToCloud();
            location.reload();
        }
    }
};

// Make Storage available globally
window.Storage = Storage;
