// ========== PAPERS MODULE ==========
// Handles paper CRUD operations and UI

const Papers = {
    currentPaperId: null,
    currentFilter: 'all',
    searchQuery: '',
    initialized: false,

    // ========== INITIALIZATION ==========

    init() {
        if (this.initialized) {
            console.log('⚠️ Papers already initialized, skipping...');
            this.render();
            return;
        }
        
        this.setupEventListeners();
        this.render();
        this.initialized = true;
        console.log('✅ Papers initialized');
    },

    setupEventListeners() {
        // New paper button
        document.getElementById('new-paper-btn').addEventListener('click', () => {
            this.openPaperModal();
        });

        // Paper modal close
        document.getElementById('close-paper-modal').addEventListener('click', () => {
            this.closePaperModal();
        });

        document.getElementById('cancel-paper').addEventListener('click', () => {
            this.closePaperModal();
        });

        // Save paper
        document.getElementById('save-paper').addEventListener('click', () => {
            this.savePaper();
        });

        // View paper modal close
        document.getElementById('close-view-paper-modal').addEventListener('click', () => {
            this.closeViewPaperModal();
        });

        // Edit paper
        document.getElementById('edit-paper').addEventListener('click', () => {
            this.editCurrentPaper();
        });

        // Delete paper
        document.getElementById('delete-paper').addEventListener('click', () => {
            this.deleteCurrentPaper();
        });

        // Search
        document.getElementById('search-box').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.render();
        });

        // Close modals on background click
        document.getElementById('paper-modal').addEventListener('click', (e) => {
            if (e.target.id === 'paper-modal') {
                this.closePaperModal();
            }
        });

        document.getElementById('view-paper-modal').addEventListener('click', (e) => {
            if (e.target.id === 'view-paper-modal') {
                this.closeViewPaperModal();
            }
        });
    },

    // ========== RENDERING ==========

    render() {
        const container = document.getElementById('papers-grid');
        let papers = [];

        if (this.searchQuery) {
            papers = Storage.searchPapers(this.searchQuery);
        } else {
            papers = Storage.getPapersByFolder(this.currentFilter);
        }

        // Sort by most recent first
        papers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (papers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>${this.searchQuery ? 'No papers found' : 'No papers yet'}</h3>
                    <p>${this.searchQuery ? 'Try a different search term' : 'Click "+ New Paper" to add your first research paper'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = papers.map(paper => this.createPaperCard(paper)).join('');

        // Add click listeners to cards
        container.querySelectorAll('.paper-card').forEach(card => {
            card.addEventListener('click', () => {
                const paperId = card.dataset.paperId;
                this.viewPaper(paperId);
            });
        });
    },

    createPaperCard(paper) {
        const date = new Date(paper.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const folder = paper.folderId ? Storage.getFolderById(paper.folderId) : null;
        const folderBadge = folder ? 
            `<span class="paper-folder-badge">${folder.icon} ${folder.name}</span>` : '';

        const tags = paper.tags && paper.tags.length > 0 ?
            `<div class="paper-tags">
                ${paper.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>` : '';

        const summary = paper.summary || 'No summary available';

        return `
            <div class="paper-card" data-paper-id="${paper.id}">
                <div class="paper-card-header">
                    <div class="paper-title">${this.escapeHtml(paper.title)}</div>
                    ${folderBadge}
                </div>
                <div class="paper-summary">${this.escapeHtml(summary)}</div>
                <div class="paper-footer">
                    <span class="paper-date">${date}</span>
                    ${tags}
                </div>
            </div>
        `;
    },

    // ========== PAPER MODAL ==========

    openPaperModal(paper = null) {
        this.currentPaperId = paper ? paper.id : null;
        const modal = document.getElementById('paper-modal');
        const title = document.getElementById('paper-modal-title');

        // Populate folder dropdown FIRST
        this.populateFolderDropdown();

        if (paper) {
            title.textContent = 'Edit Paper';
            document.getElementById('paper-title').value = paper.title || '';
            document.getElementById('paper-url').value = paper.url || '';
            document.getElementById('paper-folder').value = paper.folderId || '';
            document.getElementById('paper-summary').value = paper.summary || '';
            document.getElementById('paper-notes').value = paper.notes || '';
            document.getElementById('paper-tags').value = paper.tags ? paper.tags.join(', ') : '';
        } else {
            title.textContent = 'New Paper';
            document.getElementById('paper-title').value = '';
            document.getElementById('paper-url').value = '';
            document.getElementById('paper-folder').value = '';
            document.getElementById('paper-summary').value = '';
            document.getElementById('paper-notes').value = '';
            document.getElementById('paper-tags').value = '';
        }

        modal.classList.add('show');
    },

    closePaperModal() {
        document.getElementById('paper-modal').classList.remove('show');
        this.currentPaperId = null;
    },

    populateFolderDropdown() {
        const select = document.getElementById('paper-folder');
        const folders = Storage.getFolders();
        
        select.innerHTML = '<option value="">No folder</option>';
        folders.forEach(folder => {
            select.innerHTML += `<option value="${folder.id}">${folder.icon} ${folder.name}</option>`;
        });
    },

    savePaper() {
        const title = document.getElementById('paper-title').value.trim();
        const url = document.getElementById('paper-url').value.trim();
        const folderId = document.getElementById('paper-folder').value;
        const summary = document.getElementById('paper-summary').value.trim();
        const notes = document.getElementById('paper-notes').value.trim();
        const tagsString = document.getElementById('paper-tags').value.trim();

        if (!title) {
            alert('Please enter a title');
            return;
        }

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];

        const paperData = {
            title,
            url,
            folderId: folderId || null,
            summary,
            notes,
            tags
        };

        if (this.currentPaperId) {
            Storage.updatePaper(this.currentPaperId, paperData);
        } else {
            Storage.addPaper(paperData);
        }

        this.closePaperModal();
        this.render();
        Folders.updateCounts();
    },

    // ========== VIEW PAPER MODAL ==========

    viewPaper(paperId) {
        const paper = Storage.getPaperById(paperId);
        if (!paper) return;

        this.currentPaperId = paperId;

        document.getElementById('view-paper-title').textContent = paper.title;
        document.getElementById('view-paper-url').href = paper.url;
        document.getElementById('view-paper-url').textContent = 'Open Link 🔗';
        
        const date = new Date(paper.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('view-paper-date').textContent = `Added ${date}`;

        const folder = paper.folderId ? Storage.getFolderById(paper.folderId) : null;
        const folderBadge = document.getElementById('view-paper-folder');
        if (folder) {
            folderBadge.textContent = `${folder.icon} ${folder.name}`;
            folderBadge.style.display = 'inline-flex';
        } else {
            folderBadge.style.display = 'none';
        }

        // Summary
        const summarySection = document.getElementById('view-paper-summary-section');
        if (paper.summary) {
            document.getElementById('view-paper-summary').textContent = paper.summary;
            summarySection.style.display = 'flex';
        } else {
            summarySection.style.display = 'none';
        }

        // Notes
        const notesSection = document.getElementById('view-paper-notes-section');
        if (paper.notes) {
            document.getElementById('view-paper-notes').textContent = paper.notes;
            notesSection.style.display = 'flex';
        } else {
            notesSection.style.display = 'none';
        }

        // Tags
        const tagsSection = document.getElementById('view-paper-tags-section');
        const tagsContainer = document.getElementById('view-paper-tags');
        if (paper.tags && paper.tags.length > 0) {
            tagsContainer.innerHTML = paper.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('');
            tagsSection.style.display = 'flex';
        } else {
            tagsSection.style.display = 'none';
        }

        document.getElementById('view-paper-modal').classList.add('show');
    },

    closeViewPaperModal() {
        document.getElementById('view-paper-modal').classList.remove('show');
        this.currentPaperId = null;
    },

    editCurrentPaper() {
        const paper = Storage.getPaperById(this.currentPaperId);
        if (!paper) return;

        this.closeViewPaperModal();
        this.openPaperModal(paper);
    },

    deleteCurrentPaper() {
        if (!confirm('Are you sure you want to delete this paper?')) return;

        Storage.deletePaper(this.currentPaperId);
        this.closeViewPaperModal();
        this.render();
        Folders.updateCounts();
    },

    // ========== FILTER ==========

    setFilter(folderId) {
        this.currentFilter = folderId;
        this.searchQuery = '';
        document.getElementById('search-box').value = '';
        this.render();
    },

    // ========== UTILITY ==========

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Make Papers available globally
window.Papers = Papers;
