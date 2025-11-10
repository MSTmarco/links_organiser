 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/js/papers.js b/js/papers.js
index 66d3daec0ae83a57b589b32ce5ffb57b1d32e3c7..d4447efb41d00cad840bb9d08660a4b96a4ccb30 100644
--- a/js/papers.js
+++ b/js/papers.js
@@ -1,30 +1,31 @@
 // ========== PAPERS MODULE ==========
 // Handles paper CRUD operations, UI, and Semantic Scholar API integration
 
 const Papers = {
     currentPaperId: null,
+    isInlineEditing: false,
     initialized: false,
     activeFilters: {
         priority: 'All',
         status: 'All'
     },
 
     // ========== SEMANTIC SCHOLAR API ==========
     SEMANTIC_SCHOLAR_API: 'https://api.semanticscholar.org/graph/v1',
     
     // ========== INITIALIZATION ==========
 
     init() {
         if (this.initialized) {
             console.log('⚠️ Papers already initialized, skipping...');
             this.renderPapers();
             return;
         }
         
         this.setupEventListeners();
         this.renderPapers();
         this.initialized = true;
         console.log('✅ Papers initialized');
     },
 
     setupEventListeners() {
@@ -82,50 +83,60 @@ const Papers = {
         // SS Search modal close
         const closeSsModal = document.getElementById('close-ss-modal');
         if (closeSsModal) {
             closeSsModal.addEventListener('click', () => {
                 this.closeSemanticScholarModal();
             });
         }
 
         // SS Search button in modal
         const performSsSearch = document.getElementById('perform-ss-search');
         if (performSsSearch) {
             performSsSearch.addEventListener('click', () => {
                 this.performSemanticScholarSearch();
             });
         }
 
         // SS Search input enter key
         const ssSearchInput = document.getElementById('ss-search-input');
         if (ssSearchInput) {
             ssSearchInput.addEventListener('keypress', (e) => {
                 if (e.key === 'Enter') {
                     this.performSemanticScholarSearch();
                 }
             });
         }
+
+        document.addEventListener('keydown', (e) => {
+            if (e.key === 'Escape') {
+                if (this.isInlineEditing) {
+                    this.cancelInlineEdit();
+                } else {
+                    this.closePaperView();
+                }
+            }
+        });
     },
 
     // ========== SEMANTIC SCHOLAR INTEGRATION ==========
 
     openSemanticScholarSearch() {
         const modal = document.getElementById('semantic-scholar-modal');
         if (modal) {
             modal.classList.add('active');
             document.getElementById('ss-search-input').focus();
             
             // Show helpful message about CORS if it's the first time
             const resultsContainer = document.getElementById('ss-results');
             resultsContainer.innerHTML = `
                 <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                     <p style="margin-bottom: 16px;">💡 <strong>Note:</strong> Due to browser security (CORS), the Semantic Scholar API may not work directly from GitHub Pages.</p>
                     <p style="margin-bottom: 16px;">If search doesn't work, you can:</p>
                     <ol style="text-align: left; max-width: 500px; margin: 0 auto; line-height: 1.8;">
                         <li>Visit <a href="https://www.semanticscholar.org" target="_blank" style="color: var(--primary-color);">semanticscholar.org</a> to find papers</li>
                         <li>Copy the paper URL</li>
                         <li>Use the "+ New Paper" button to add it manually</li>
                     </ol>
                     <p style="margin-top: 20px; font-size: 14px;">Try searching anyway - it might work! 🚀</p>
                 </div>
             `;
         }
@@ -344,342 +355,595 @@ const Papers = {
         }
         
         // Extract keywords from title and abstract
         const text = (paper.title + ' ' + (paper.abstract || '')).toLowerCase();
         
         const keywords = [
             'machine learning', 'deep learning', 'neural network', 'ai', 'artificial intelligence',
             'nlp', 'computer vision', 'reinforcement learning', 'transformer',
             'bert', 'gpt', 'attention', 'cnn', 'rnn', 'lstm',
             'classification', 'detection', 'segmentation', 'generation',
             'supervised', 'unsupervised', 'semi-supervised'
         ];
         
         keywords.forEach(keyword => {
             if (text.includes(keyword)) {
                 tags.push(keyword.replace(/ /g, '-'));
             }
         });
         
         return tags.slice(0, 5); // Limit to 5 tags
     },
 
     // ========== PAPER MODAL ==========
 
     openPaperModal(paperId = null) {
+        this.closePaperView();
         this.currentPaperId = paperId;
         const modal = document.getElementById('paper-modal');
         const title = document.getElementById('modal-title');
 
+        let modalTitle = 'Add New Paper';
+        let titleValue = '';
+        let urlValue = '';
+        let summaryValue = '';
+        let notesValue = '';
+        let tagsValue = '';
+        let priorityValue = 'P2';
+        let statusValue = 'To Read';
+        let selectedFolderId = Folders.currentFolderId === 'all' ? '' : Folders.currentFolderId;
+
         if (paperId) {
             // Edit mode
-            title.textContent = 'Edit Paper';
+            modalTitle = 'Edit Paper';
             const paper = Storage.getPaperById(paperId);
             if (paper) {
-                document.getElementById('paper-title').value = paper.title || '';
-                document.getElementById('paper-url').value = paper.url || '';
-                document.getElementById('paper-summary').value = paper.summary || '';
-                document.getElementById('paper-notes').value = paper.notes || '';
-                document.getElementById('paper-tags').value = paper.tags ? paper.tags.join(', ') : '';
-                document.getElementById('paper-folder').value = paper.folderId || '';
-                document.getElementById('paper-priority').value = paper.priority || 'P2';
-                document.getElementById('paper-status').value = paper.status || 'To Read';
+                titleValue = paper.title || '';
+                urlValue = paper.url || '';
+                summaryValue = paper.summary || '';
+                notesValue = paper.notes || '';
+                tagsValue = paper.tags ? paper.tags.join(', ') : '';
+                selectedFolderId = paper.folderId || '';
+                priorityValue = paper.priority || 'P2';
+                statusValue = paper.status || 'To Read';
             }
-        } else {
-            // New paper mode
-            title.textContent = 'Add New Paper';
-            document.getElementById('paper-title').value = '';
-            document.getElementById('paper-url').value = '';
-            document.getElementById('paper-summary').value = '';
-            document.getElementById('paper-notes').value = '';
-            document.getElementById('paper-tags').value = '';
-            document.getElementById('paper-folder').value = Folders.currentFolderId === 'all' ? '' : Folders.currentFolderId;
-            document.getElementById('paper-priority').value = 'P2';
-            document.getElementById('paper-status').value = 'To Read';
         }
 
+        title.textContent = modalTitle;
+
         // Populate folder dropdown
-        this.populateFolderDropdown();
+        this.populateFolderDropdown(selectedFolderId);
+
+        document.getElementById('paper-title').value = titleValue;
+        document.getElementById('paper-url').value = urlValue;
+        document.getElementById('paper-summary').value = summaryValue;
+        document.getElementById('paper-notes').value = notesValue;
+        document.getElementById('paper-tags').value = tagsValue;
+        document.getElementById('paper-folder').value = selectedFolderId;
+        document.getElementById('paper-priority').value = priorityValue;
+        document.getElementById('paper-status').value = statusValue;
 
         modal.classList.add('active');
         document.getElementById('paper-title').focus();
     },
 
     closePaperModal() {
         const modal = document.getElementById('paper-modal');
         modal.classList.remove('active');
         this.currentPaperId = null;
     },
 
-    populateFolderDropdown() {
+    populateFolderDropdown(selectedId = '') {
         const select = document.getElementById('paper-folder');
+        this.populateFolderSelect(select, selectedId);
+    },
+
+    populateFolderSelect(selectElement, selectedId = '') {
+        if (!selectElement) return;
+
         const folders = Storage.getFolders();
 
         let html = '<option value="">No folder</option>';
         folders.forEach(folder => {
-            html += `<option value="${folder.id}">${folder.icon} ${this.escapeHtml(folder.name)}</option>`;
+            const safeName = this.escapeHtml(folder.name);
+            const safeIcon = folder.icon ? this.escapeHtml(folder.icon) : '📁';
+            html += `<option value="${folder.id}">${safeIcon} ${safeName}</option>`;
         });
 
-        select.innerHTML = html;
+        selectElement.innerHTML = html;
+        selectElement.value = selectedId || '';
     },
 
     savePaper() {
         const title = document.getElementById('paper-title').value.trim();
         const url = document.getElementById('paper-url').value.trim();
         const summary = document.getElementById('paper-summary').value.trim();
         const notes = document.getElementById('paper-notes').value.trim();
         const tagsInput = document.getElementById('paper-tags').value.trim();
         const folderId = document.getElementById('paper-folder').value || null;
         const priority = document.getElementById('paper-priority').value;
         const status = document.getElementById('paper-status').value;
 
         if (!title) {
             alert('Please enter a paper title');
             return;
         }
 
         const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
 
         const paperData = {
             title,
             url,
             summary,
             notes,
             tags,
             folderId,
             priority,
             status
         };
 
         if (this.currentPaperId) {
             // Update existing paper
             Storage.updatePaper(this.currentPaperId, paperData);
         } else {
             // Add new paper
             Storage.addPaper(paperData);
         }
 
         this.closePaperModal();
         this.renderPapers();
         Folders.updateCounts();
     },
 
     // ========== RENDERING ==========
 
     renderPapers() {
         const container = document.getElementById('papers-grid');
         let papers = Storage.getPapersByFolder(Folders.currentFolderId);
+        const totalInFolder = papers.length;
 
         // Apply filters
         papers = this.filterPapers(papers);
 
-        // Update folder title
-        const titleElement = document.getElementById('current-folder-title');
-        if (Folders.currentFolderId === 'all') {
-            titleElement.textContent = 'All Papers';
-        } else {
-            const folder = Storage.getFolderById(Folders.currentFolderId);
-            if (folder) {
-                titleElement.textContent = `${folder.name}`;
-            }
-        }
+        this.updateFolderTitle(papers.length, totalInFolder);
 
         if (papers.length === 0) {
             container.innerHTML = this.getEmptyState();
             return;
         }
 
         const html = papers.map(paper => this.createPaperCard(paper)).join('');
         container.innerHTML = html;
 
         // Add click listeners
         container.querySelectorAll('.paper-card').forEach(card => {
             card.addEventListener('click', (e) => {
                 // Don't open if clicking on a button
                 if (e.target.closest('button')) return;
                 
                 const paperId = card.dataset.paperId;
                 this.openPaperDetail(paperId);
             });
         });
     },
 
     createPaperCard(paper) {
         const folder = paper.folderId ? Storage.getFolderById(paper.folderId) : null;
-        const folderBadge = folder ? 
-            `<span class="paper-folder-badge">${folder.icon} ${this.escapeHtml(folder.name)}</span>` : '';
+        const folderIcon = folder ? this.escapeHtml(folder.icon || '📁') : '';
+        const folderBadge = folder ?
+            `<span class="paper-folder-badge"><span class="paper-folder-icon">${folderIcon}</span>${this.escapeHtml(folder.name)}</span>` : '';
         
         const tags = paper.tags && paper.tags.length > 0 ? 
             paper.tags.slice(0, 3).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('') : '';
 
         const priorityBadge = `<span class="priority-badge ${paper.priority}">${paper.priority || 'P2'}</span>`;
         const statusBadge = `<span class="status-badge ${paper.status?.toLowerCase().replace(' ', '-')}">${paper.status || 'To Read'}</span>`;
 
         const date = new Date(paper.createdAt).toLocaleDateString();
 
         return `
-            <div class="paper-card" data-paper-id="${paper.id}">
-                <div class="paper-metadata">
-                    ${priorityBadge}
-                    ${statusBadge}
-                    ${folderBadge}
-                </div>
-                <div class="paper-card-header">
-                    <h3 class="paper-title">${this.escapeHtml(paper.title)}</h3>
-                </div>
-                ${paper.summary ? `<p class="paper-summary">${this.escapeHtml(paper.summary)}</p>` : ''}
-                <div class="paper-footer">
-                    <span class="paper-date">${date}</span>
-                    ${tags ? `<div class="paper-tags">${tags}</div>` : ''}
+            <div class="paper-card-wrapper">
+                <div class="paper-card" data-paper-id="${paper.id}">
+                    <div class="paper-metadata">
+                        ${priorityBadge}
+                        ${statusBadge}
+                        ${folderBadge}
+                    </div>
+                    <div class="paper-card-header">
+                        <h3 class="paper-title">${this.escapeHtml(paper.title)}</h3>
+                    </div>
+                    ${paper.summary ? `<p class="paper-summary">${this.escapeHtml(paper.summary)}</p>` : ''}
+                    <div class="paper-footer">
+                        <span class="paper-date">${date}</span>
+                        ${tags ? `<div class="paper-tags">${tags}</div>` : ''}
+                    </div>
                 </div>
             </div>
         `;
     },
 
     getEmptyState() {
         const folderName = Folders.currentFolderId === 'all' ? 'any folder' : 'this folder';
         return `
             <div class="empty-state">
                 <div class="empty-icon">📄</div>
                 <h3>No papers yet</h3>
                 <p>Click "+ New Paper" to add your first research paper to ${folderName}</p>
                 <p style="margin-top: 10px; color: var(--text-secondary);">
                     Or try the "🔍 Search Semantic Scholar" button to browse academic papers!
                 </p>
             </div>
         `;
     },
 
     // ========== FULL-SCREEN PAPER VIEW ==========
 
     openPaperDetail(paperId) {
         const paper = Storage.getPaperById(paperId);
         if (!paper) return;
 
+        this.isInlineEditing = false;
+        const mainApp = document.getElementById('main-app');
+        if (!mainApp) return;
+
         const folder = paper.folderId ? Storage.getFolderById(paper.folderId) : null;
-        const folderBadge = folder ? 
-            `<span class="paper-folder-badge">${this.escapeHtml(folder.name)}</span>` : '';
+        const folderIcon = folder ? this.escapeHtml(folder.icon || '📁') : '';
+        const folderBadge = folder ?
+            `<span class="paper-folder-badge"><span class="paper-folder-icon">${folderIcon}</span>${this.escapeHtml(folder.name)}</span>` : '';
 
         const tags = paper.tags && paper.tags.length > 0 ?
-            paper.tags.map(tag => `<span class="paper-view-tag">${this.escapeHtml(tag)}</span>`).join('') : 
+            paper.tags.map(tag => `<span class="paper-view-tag">${this.escapeHtml(tag)}</span>`).join('') :
             '<span class="paper-view-tag">No tags</span>';
 
         const priorityBadge = `<span class="priority-badge ${paper.priority}">${paper.priority || 'P2'}</span>`;
         const statusBadge = `<span class="status-badge ${paper.status?.toLowerCase().replace(' ', '-')}">${paper.status || 'To Read'}</span>`;
 
         // Create or get full-screen view container
         let viewContainer = document.getElementById('paper-view-fullscreen');
         if (!viewContainer) {
             viewContainer = document.createElement('div');
             viewContainer.id = 'paper-view-fullscreen';
             viewContainer.className = 'paper-view-fullscreen';
-            document.body.appendChild(viewContainer);
+            viewContainer.setAttribute('tabindex', '-1');
+            mainApp.appendChild(viewContainer);
         }
 
+        mainApp.classList.add('paper-view-active');
+
         viewContainer.innerHTML = `
             <div class="paper-view-header">
                 <div class="paper-view-back" onclick="Papers.closePaperView()">
                     Back to Papers
                 </div>
-                <div class="paper-view-actions">
-                    <button class="btn btn-secondary" onclick="Papers.openPaperModal('${paper.id}')">
-                        Edit
-                    </button>
-                    <button class="btn btn-danger" onclick="Papers.deletePaper('${paper.id}')">
-                        Delete
-                    </button>
+                    <div class="paper-view-actions">
+                        <div class="paper-view-actions-group view-mode">
+                            <button class="btn btn-secondary" type="button" onclick="Papers.enterInlineEdit('${paper.id}')">
+                                Edit
+                            </button>
+                            <button class="btn btn-danger" type="button" onclick="Papers.deletePaper('${paper.id}')">
+                                Delete
+                            </button>
+                        </div>
+                        <div class="paper-view-actions-group edit-mode">
+                            <button class="btn btn-secondary" type="button" onclick="Papers.cancelInlineEdit()">
+                                Cancel
+                            </button>
+                        <button class="btn btn-primary" type="submit" form="paper-view-edit-form">
+                            Save Changes
+                        </button>
+                    </div>
                 </div>
             </div>
 
             <div class="paper-view-content">
-                <h1 class="paper-view-title">${this.escapeHtml(paper.title)}</h1>
-                
-                <div class="paper-view-metadata">
-                    ${priorityBadge}
-                    ${statusBadge}
-                    ${folderBadge}
-                    ${paper.url ? `<a href="${this.escapeHtml(paper.url)}" target="_blank" class="paper-view-link" rel="noopener noreferrer">Open Paper</a>` : ''}
-                    <span class="paper-view-date">Added: ${new Date(paper.createdAt).toLocaleDateString()}</span>
-                </div>
-
-                ${paper.summary ? `
-                    <div class="paper-view-section">
-                        <h3 class="paper-view-section-title">Summary</h3>
-                        <div class="paper-view-section-content">${this.escapeHtml(paper.summary)}</div>
+                <div class="paper-view-display">
+                    <h1 class="paper-view-title">${this.escapeHtml(paper.title)}</h1>
+
+                    <div class="paper-view-metadata">
+                        ${priorityBadge}
+                        ${statusBadge}
+                        ${folderBadge}
+                        ${paper.url ? `<a href="${this.escapeHtml(paper.url)}" target="_blank" class="paper-view-link" rel="noopener noreferrer">Open Paper</a>` : ''}
+                        <span class="paper-view-date">Added: ${new Date(paper.createdAt).toLocaleDateString()}</span>
                     </div>
-                ` : ''}
 
-                ${paper.notes ? `
+                    ${paper.summary ? `
+                        <div class="paper-view-section">
+                            <h3 class="paper-view-section-title">Summary</h3>
+                            <div class="paper-view-section-content">${this.escapeHtml(paper.summary)}</div>
+                        </div>
+                    ` : ''}
+
+                    ${paper.notes ? `
+                        <div class="paper-view-section">
+                            <h3 class="paper-view-section-title">Notes</h3>
+                            <div class="paper-view-section-content">${this.escapeHtml(paper.notes)}</div>
+                        </div>
+                    ` : ''}
+
                     <div class="paper-view-section">
-                        <h3 class="paper-view-section-title">Notes</h3>
-                        <div class="paper-view-section-content">${this.escapeHtml(paper.notes)}</div>
+                        <h3 class="paper-view-section-title">Tags</h3>
+                        <div class="paper-view-tags">${tags}</div>
                     </div>
-                ` : ''}
-
-                <div class="paper-view-section">
-                    <h3 class="paper-view-section-title">Tags</h3>
-                    <div class="paper-view-tags">${tags}</div>
                 </div>
+
+                <form id="paper-view-edit-form" class="paper-view-edit-form">
+                    <div class="form-group">
+                        <label for="paper-edit-title">Title *</label>
+                        <input type="text" id="paper-edit-title" required>
+                    </div>
+                    <div class="form-group">
+                        <label for="paper-edit-url">URL/Link</label>
+                        <input type="url" id="paper-edit-url" placeholder="https://...">
+                    </div>
+                    <div class="form-group">
+                        <label for="paper-edit-folder">Folder</label>
+                        <select id="paper-edit-folder">
+                            <option value="">No folder</option>
+                        </select>
+                    </div>
+                    <div class="form-group">
+                        <label for="paper-edit-priority">Priority</label>
+                        <select id="paper-edit-priority">
+                            <option value="P1">🔴 P1 - High Priority</option>
+                            <option value="P2">🟡 P2 - Medium Priority</option>
+                            <option value="P3">🟢 P3 - Low Priority</option>
+                        </select>
+                    </div>
+                    <div class="form-group">
+                        <label for="paper-edit-status">Reading Status</label>
+                        <select id="paper-edit-status">
+                            <option value="To Read">📚 To Read</option>
+                            <option value="Reading">📖 Currently Reading</option>
+                            <option value="Read">✅ Read</option>
+                        </select>
+                    </div>
+                    <div class="form-group">
+                        <label for="paper-edit-summary">Summary</label>
+                        <textarea id="paper-edit-summary" rows="6" placeholder="Brief summary of the paper..."></textarea>
+                    </div>
+                    <div class="form-group">
+                        <label for="paper-edit-notes">Notes</label>
+                        <textarea id="paper-edit-notes" rows="6" placeholder="Your notes, thoughts, key findings..."></textarea>
+                    </div>
+                    <div class="form-group">
+                        <label for="paper-edit-tags">Tags (comma separated)</label>
+                        <input type="text" id="paper-edit-tags" placeholder="machine learning, neural networks, NLP">
+                    </div>
+                </form>
             </div>
         `;
 
+        viewContainer.dataset.paperId = paper.id;
+        viewContainer.dataset.mode = 'view';
+        viewContainer.classList.remove('editing');
+        const header = viewContainer.querySelector('.paper-view-header');
+        if (header) {
+            header.classList.remove('editing');
+        }
+
+        const content = viewContainer.querySelector('.paper-view-content');
+        if (content) {
+            content.classList.remove('editing');
+        }
+
+        this.prefillInlineEditForm(viewContainer, paper);
+
+        const editForm = viewContainer.querySelector('#paper-view-edit-form');
+        if (editForm) {
+            editForm.addEventListener('submit', (event) => {
+                event.preventDefault();
+                this.saveInlineEdit(paper.id);
+            });
+        }
+
         viewContainer.classList.add('active');
+        viewContainer.scrollTop = 0;
+        viewContainer.focus();
         document.body.style.overflow = 'hidden'; // Prevent background scrolling
     },
 
+    prefillInlineEditForm(viewContainer, paper) {
+        if (!viewContainer) return;
+
+        const form = viewContainer.querySelector('#paper-view-edit-form');
+        if (!form) return;
+
+        const folderSelect = form.querySelector('#paper-edit-folder');
+        this.populateFolderSelect(folderSelect, paper.folderId || '');
+
+        const titleInput = form.querySelector('#paper-edit-title');
+        if (titleInput) titleInput.value = paper.title || '';
+
+        const urlInput = form.querySelector('#paper-edit-url');
+        if (urlInput) urlInput.value = paper.url || '';
+
+        const summaryInput = form.querySelector('#paper-edit-summary');
+        if (summaryInput) summaryInput.value = paper.summary || '';
+
+        const notesInput = form.querySelector('#paper-edit-notes');
+        if (notesInput) notesInput.value = paper.notes || '';
+
+        const tagsInput = form.querySelector('#paper-edit-tags');
+        if (tagsInput) tagsInput.value = paper.tags && paper.tags.length > 0 ? paper.tags.join(', ') : '';
+
+        const prioritySelect = form.querySelector('#paper-edit-priority');
+        if (prioritySelect) prioritySelect.value = paper.priority || 'P2';
+
+        const statusSelect = form.querySelector('#paper-edit-status');
+        if (statusSelect) statusSelect.value = paper.status || 'To Read';
+    },
+
+    enterInlineEdit(paperId) {
+        const viewContainer = document.getElementById('paper-view-fullscreen');
+        if (!viewContainer) return;
+
+        const paper = Storage.getPaperById(paperId);
+        if (!paper) return;
+
+        this.prefillInlineEditForm(viewContainer, paper);
+
+        viewContainer.classList.add('editing');
+        viewContainer.dataset.mode = 'edit';
+        const header = viewContainer.querySelector('.paper-view-header');
+        if (header) header.classList.add('editing');
+
+        const content = viewContainer.querySelector('.paper-view-content');
+        if (content) content.classList.add('editing');
+
+        this.isInlineEditing = true;
+
+        const titleInput = viewContainer.querySelector('#paper-edit-title');
+        if (titleInput) {
+            titleInput.focus();
+            const length = titleInput.value.length;
+            titleInput.setSelectionRange(length, length);
+        }
+    },
+
+    cancelInlineEdit() {
+        const viewContainer = document.getElementById('paper-view-fullscreen');
+        if (!viewContainer) return;
+
+        const paperId = viewContainer.dataset.paperId;
+        this.isInlineEditing = false;
+
+        viewContainer.classList.remove('editing');
+        viewContainer.dataset.mode = 'view';
+
+        if (paperId) {
+            this.openPaperDetail(paperId);
+            return;
+        }
+
+        const header = viewContainer.querySelector('.paper-view-header');
+        if (header) header.classList.remove('editing');
+
+        const content = viewContainer.querySelector('.paper-view-content');
+        if (content) content.classList.remove('editing');
+    },
+
+    saveInlineEdit(paperId) {
+        const viewContainer = document.getElementById('paper-view-fullscreen');
+        if (!viewContainer) return;
+
+        const form = viewContainer.querySelector('#paper-view-edit-form');
+        if (!form) return;
+
+        const titleInput = form.querySelector('#paper-edit-title');
+        if (!titleInput) return;
+
+        const title = titleInput.value.trim();
+        const urlInput = form.querySelector('#paper-edit-url');
+        const summaryInput = form.querySelector('#paper-edit-summary');
+        const notesInput = form.querySelector('#paper-edit-notes');
+        const tagsField = form.querySelector('#paper-edit-tags');
+        const folderSelect = form.querySelector('#paper-edit-folder');
+        const prioritySelect = form.querySelector('#paper-edit-priority');
+        const statusSelect = form.querySelector('#paper-edit-status');
+
+        if (!title) {
+            alert('Please enter a paper title');
+            titleInput.focus();
+            return;
+        }
+
+        const url = urlInput ? urlInput.value.trim() : '';
+        const summary = summaryInput ? summaryInput.value.trim() : '';
+        const notes = notesInput ? notesInput.value.trim() : '';
+        const tagsInput = tagsField ? tagsField.value.trim() : '';
+        const folderIdValue = folderSelect ? folderSelect.value : '';
+        const priority = prioritySelect ? prioritySelect.value : 'P2';
+        const status = statusSelect ? statusSelect.value : 'To Read';
+
+        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
+
+        viewContainer.classList.remove('editing');
+        viewContainer.dataset.mode = 'view';
+        Storage.updatePaper(paperId, {
+            title,
+            url,
+            summary,
+            notes,
+            tags,
+            folderId: folderIdValue ? folderIdValue : null,
+            priority,
+            status
+        });
+
+        this.isInlineEditing = false;
+        this.renderPapers();
+        Folders.updateCounts();
+        this.openPaperDetail(paperId);
+    },
+
     closePaperView() {
         const viewContainer = document.getElementById('paper-view-fullscreen');
+        const mainApp = document.getElementById('main-app');
+
+        this.isInlineEditing = false;
         if (viewContainer) {
-            viewContainer.classList.remove('active');
+            viewContainer.classList.remove('active', 'editing');
+            delete viewContainer.dataset.mode;
+            delete viewContainer.dataset.paperId;
+            viewContainer.innerHTML = '';
+        }
+
+        if (mainApp) {
+            mainApp.classList.remove('paper-view-active');
         }
+
         document.body.style.overflow = ''; // Restore scrolling
     },
 
     deletePaper(paperId) {
         if (confirm('Are you sure you want to delete this paper?')) {
             Storage.deletePaper(paperId);
             this.renderPapers();
             Folders.updateCounts();
             
             // Close full-screen view
             this.closePaperView();
         }
     },
 
     // ========== SEARCH & FILTERS ==========
 
     handleSearch(query) {
         const container = document.getElementById('papers-grid');
         
         if (!query.trim()) {
             this.renderPapers();
             return;
         }
 
         let papers = Storage.searchPapers(query);
         papers = this.filterPapers(papers);
 
+        const totalInFolder = Storage.getPapersByFolder(Folders.currentFolderId).length;
+        this.updateFolderTitle(papers.length, totalInFolder);
+
         if (papers.length === 0) {
             container.innerHTML = `
                 <div class="empty-state">
                     <div class="empty-icon">🔍</div>
                     <h3>No results found</h3>
                     <p>Try different keywords or clear the search</p>
                 </div>
             `;
             return;
         }
 
         const html = papers.map(paper => this.createPaperCard(paper)).join('');
         container.innerHTML = html;
 
         container.querySelectorAll('.paper-card').forEach(card => {
             card.addEventListener('click', (e) => {
                 if (e.target.closest('button')) return;
                 const paperId = card.dataset.paperId;
                 this.openPaperDetail(paperId);
             });
         });
     },
 
     applyFilter(filterType, filterValue, btnElement) {
         // Update active filter
@@ -690,37 +954,78 @@ const Papers = {
         filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
             btn.classList.remove('active');
         });
         btnElement.classList.add('active');
 
         // Re-render papers
         this.renderPapers();
     },
 
     filterPapers(papers) {
         let filtered = [...papers];
 
         // Priority filter
         if (this.activeFilters.priority !== 'All') {
             filtered = filtered.filter(p => p.priority === this.activeFilters.priority);
         }
 
         // Status filter
         if (this.activeFilters.status !== 'All') {
             filtered = filtered.filter(p => p.status === this.activeFilters.status);
         }
 
         return filtered;
     },
 
+    render() {
+        this.renderPapers();
+    },
+
+    updateFolderTitle(filteredCount, totalCount) {
+        const titleElement = document.getElementById('current-folder-title');
+        if (!titleElement) return;
+
+        const { name, icon } = this.getCurrentFolderMeta();
+        const safeName = this.escapeHtml(name);
+        const safeIcon = this.escapeHtml(icon);
+        const visibleCount = typeof filteredCount === 'number' ? filteredCount : 0;
+        const hasTotal = typeof totalCount === 'number';
+        const total = hasTotal ? totalCount : visibleCount;
+        const isFiltered = hasTotal && total !== visibleCount;
+        const countLabel = isFiltered ? `${visibleCount} of ${total}` : `${visibleCount}`;
+
+        titleElement.innerHTML = `
+            <span class="folder-title-icon">${safeIcon}</span>
+            <span class="folder-title-text">${safeName}</span>
+            <span class="folder-title-count${isFiltered ? ' is-filtered' : ''}">${countLabel}</span>
+        `;
+    },
+
+    getCurrentFolderMeta() {
+        if (typeof Folders === 'undefined') {
+            return { name: 'All Papers', icon: '📁' };
+        }
+
+        if (Folders.currentFolderId === 'all') {
+            return { name: 'All Papers', icon: '📁' };
+        }
+
+        const folder = Storage.getFolderById(Folders.currentFolderId);
+        const icon = folder?.icon && folder.icon.trim() ? folder.icon.trim() : '📁';
+        return {
+            name: folder?.name || 'All Papers',
+            icon
+        };
+    },
+
     // ========== UTILITY ==========
 
     escapeHtml(text) {
         if (!text) return '';
         const div = document.createElement('div');
         div.textContent = text;
         return div.innerHTML;
     }
 };
 
 // Make Papers available globally
 window.Papers = Papers;
 
EOF
)
