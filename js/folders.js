// ========== FOLDERS MODULE ==========
// Handles folder CRUD operations and UI

const Folders = {
    currentFolderId: 'all',
    initialized: false,

    // ========== INITIALIZATION ==========

    init() {
        if (this.initialized) {
            console.log('⚠️ Folders already initialized, skipping...');
            this.render();
            this.updateCounts();
            return;
        }
        
        this.setupEventListeners();
        this.render();
        this.updateCounts();
        this.initialized = true;
        console.log('✅ Folders initialized');
    },

    setupEventListeners() {
        // New folder button
        document.getElementById('new-folder-btn').addEventListener('click', () => {
            this.openFolderModal();
        });

        // Folder modal close
        document.getElementById('close-folder-modal').addEventListener('click', () => {
            this.closeFolderModal();
        });

        document.getElementById('cancel-folder').addEventListener('click', () => {
            this.closeFolderModal();
        });

        // Save folder
        document.getElementById('save-folder').addEventListener('click', () => {
            this.saveFolder();
        });

        // Close modal on background click
        document.getElementById('folder-modal').addEventListener('click', (e) => {
            if (e.target.id === 'folder-modal') {
                this.closeFolderModal();
            }
        });
    },

    // ========== RENDERING ==========

    render() {
        const container = document.getElementById('folder-list');
        const folders = Storage.getFolders();

        // SVG folder icon
        const folderSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 3A1.75 1.75 0 0 0 0 4.75v7.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-6.5A1.75 1.75 0 0 0 14.25 4H7.5a.25.25 0 0 1-.2-.1L6.07 2.09A1.75 1.75 0 0 0 4.671 1.5H1.75zM1.5 4.75a.25.25 0 0 1 .25-.25h2.921a.25.25 0 0 1 .2.1l1.232 1.81c.16.236.408.39.677.39h7.47a.25.25 0 0 1 .25.25v6.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V4.75z"/></svg>';

        // Always start with "All Papers"
        let html = `
            <div class="folder-item ${this.currentFolderId === 'all' ? 'active' : ''}" data-folder-id="all">
                <span class="folder-icon">${folderSvg}</span>
                <span class="folder-name">All Papers</span>
                <span class="paper-count">0</span>
            </div>
        `;

        // Add custom folders
        folders.forEach(folder => {
            html += `
                <div class="folder-item ${this.currentFolderId === folder.id ? 'active' : ''}" 
                     data-folder-id="${folder.id}"
                     data-folder-name="${this.escapeHtml(folder.name)}">
                    <span class="folder-icon">${folderSvg}</span>
                    <span class="folder-name">${this.escapeHtml(folder.name)}</span>
                    <span class="paper-count">0</span>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add click listeners
        container.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', () => {
                const folderId = item.dataset.folderId;
                this.selectFolder(folderId);
            });

            // Add right-click context menu for custom folders
            if (item.dataset.folderId !== 'all') {
                item.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showFolderContextMenu(e, item.dataset.folderId, item.dataset.folderName);
                });
            }
        });

        this.updateCounts();
    },

    updateCounts() {
        const papers = Storage.getPapers();
        const folders = Storage.getFolders();

        // Update "All Papers" count
        const allPapersCount = document.querySelector('[data-folder-id="all"] .paper-count');
        if (allPapersCount) {
            allPapersCount.textContent = papers.length;
        }

        // Update individual folder counts
        folders.forEach(folder => {
            const count = papers.filter(p => p.folderId === folder.id).length;
            const countElement = document.querySelector(`[data-folder-id="${folder.id}"] .paper-count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    },

    selectFolder(folderId) {
        this.currentFolderId = folderId;
        
        // Update active state
        document.querySelectorAll('.folder-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-folder-id="${folderId}"]`).classList.add('active');

        // Update main title
        const folderName = folderId === 'all' ? 'All Papers' : 
            Storage.getFolderById(folderId)?.name || 'All Papers';
        document.getElementById('current-folder-title').textContent = folderName;

        // Update papers view
        if (typeof Papers !== 'undefined' && Papers.renderPapers) {
            Papers.renderPapers();
        }
    },

    // ========== FOLDER MODAL ==========

    openFolderModal() {
        document.getElementById('folder-name').value = '';
        document.getElementById('folder-icon').value = '';
        document.getElementById('folder-modal').classList.add('active');
    },

    closeFolderModal() {
        document.getElementById('folder-modal').classList.remove('active');
    },

    saveFolder() {
        const name = document.getElementById('folder-name').value.trim();
        const icon = document.getElementById('folder-icon').value.trim() || '📁';

        if (!name) {
            alert('Please enter a folder name');
            return;
        }

        Storage.addFolder({ name, icon });
        this.closeFolderModal();
        this.render();
    },

    // ========== CONTEXT MENU ==========

    showFolderContextMenu(event, folderId, folderName) {
        // Remove any existing context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            min-width: 150px;
        `;

        menu.innerHTML = `
            <div class="context-menu-item" style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;" 
                 onmouseover="this.style.background='var(--bg-color)'" 
                 onmouseout="this.style.background='transparent'">
                ✏️ Rename
            </div>
            <div class="context-menu-item" style="padding: 10px 16px; cursor: pointer; transition: background 0.2s; color: var(--danger-color);" 
                 onmouseover="this.style.background='var(--bg-color)'" 
                 onmouseout="this.style.background='transparent'">
                🗑️ Delete
            </div>
        `;

        document.body.appendChild(menu);

        // Handle rename
        menu.querySelector('.context-menu-item:first-child').addEventListener('click', () => {
            this.renameFolder(folderId, folderName);
            menu.remove();
        });

        // Handle delete
        menu.querySelector('.context-menu-item:last-child').addEventListener('click', () => {
            this.deleteFolder(folderId, folderName);
            menu.remove();
        });

        // Close menu when clicking outside
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 0);
    },

    renameFolder(folderId, currentName) {
        const newName = prompt('Enter new folder name:', currentName);
        if (newName && newName.trim() && newName !== currentName) {
            Storage.updateFolder(folderId, { name: newName.trim() });
            this.render();
            
            // Update title if this folder is currently selected
            if (this.currentFolderId === folderId) {
                document.getElementById('current-folder-title').textContent = newName.trim();
            }
        }
    },

    deleteFolder(folderId, folderName) {
        const papers = Storage.getPapersByFolder(folderId);
        const message = papers.length > 0 ?
            `Delete "${folderName}"? ${papers.length} paper(s) will be moved to "No folder".` :
            `Delete "${folderName}"?`;

        if (confirm(message)) {
            Storage.deleteFolder(folderId);
            
            // If deleted folder was selected, switch to "All Papers"
            if (this.currentFolderId === folderId) {
                this.selectFolder('all');
            }
            
            this.render();
            Papers.render();
        }
    },

    // ========== UTILITY ==========

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Make Folders available globally
window.Folders = Folders;
