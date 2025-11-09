// ========== PAPERS MODULE ==========
// Handles paper CRUD operations, UI, and Semantic Scholar API integration

const Papers = {
    currentPaperId: null,
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

        // Close modal on background click
        document.getElementById('paper-modal').addEventListener('click', (e) => {
            if (e.target.id === 'paper-modal') {
                this.closePaperModal();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('search-papers');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = btn.dataset.filterType;
                const filterValue = btn.dataset.filterValue;
                this.applyFilter(filterType, filterValue, btn);
            });
        });

        // Semantic Scholar Search button
        const ssSearchBtn = document.getElementById('semantic-scholar-search-btn');
        if (ssSearchBtn) {
            ssSearchBtn.addEventListener('click', () => {
                this.openSemanticScholarSearch();
            });
        }

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
    },

    closeSemanticScholarModal() {
        const modal = document.getElementById('semantic-scholar-modal');
        if (modal) {
            modal.classList.remove('active');
            document.getElementById('ss-search-input').value = '';
            document.getElementById('ss-results').innerHTML = '';
        }
    },

    async performSemanticScholarSearch() {
        const query = document.getElementById('ss-search-input').value.trim();
        if (!query) {
            alert('Please enter a search query');
            return;
        }

        const resultsContainer = document.getElementById('ss-results');
        resultsContainer.innerHTML = '<div class="ss-loading">🔍 Searching Semantic Scholar...<br><small>This may take a moment</small></div>';

        try {
            // Try direct API call first
            const searchUrl = `${this.SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=paperId,title,abstract,authors,year,url,citationCount,publicationDate`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                resultsContainer.innerHTML = '<div class="ss-no-results">📭 No papers found. Try different keywords or check spelling.</div>';
                return;
            }

            this.renderSemanticScholarResults(data.data);
            console.log('✅ Semantic Scholar search successful:', data.data.length, 'results');
            
        } catch (error) {
            console.error('Semantic Scholar search error:', error);
            
            // Provide helpful error message with workaround
            let errorHtml = `
                <div class="ss-error">
                    <h3 style="margin-bottom: 16px;">❌ Search Not Available</h3>
                    <p style="margin-bottom: 16px;">Due to browser security restrictions (CORS), we cannot directly access the Semantic Scholar API from GitHub Pages.</p>
                    
                    <div style="background: var(--bg-color); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                        <h4 style="margin-bottom: 12px;">✨ Workaround:</h4>
                        <ol style="line-height: 1.8; padding-left: 20px;">
                            <li><strong>Visit</strong> <a href="https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}" target="_blank" style="color: var(--primary-color); font-weight: 600;">Semantic Scholar (opens in new tab)</a></li>
                            <li><strong>Find</strong> the paper you want</li>
                            <li><strong>Copy</strong> the paper's title and URL</li>
                            <li><strong>Return here</strong> and click "+ New Paper"</li>
                            <li><strong>Paste</strong> the information</li>
                        </ol>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 16px; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                        <strong>💡 Pro Tip:</strong> You can also paste any paper URL from arXiv, IEEE, ACM, or other sources!
                    </div>
                    
                    <button 
                        onclick="window.open('https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}', '_blank')" 
                        class="btn btn-primary" 
                        style="margin-top: 20px; padding: 12px 24px;"
                    >
                        🔗 Search on Semantic Scholar Website
                    </button>
                </div>
            `;
            
            resultsContainer.innerHTML = errorHtml;
        }
    },

    renderSemanticScholarResults(papers) {
        const resultsContainer = document.getElementById('ss-results');
        
        const html = papers.map(paper => {
            const authors = paper.authors ? paper.authors.slice(0, 3).map(a => a.name).join(', ') : 'Unknown';
            const moreAuthors = paper.authors && paper.authors.length > 3 ? ` et al.` : '';
            const abstract = paper.abstract || 'No abstract available';
            const shortAbstract = abstract.length > 200 ? abstract.substring(0, 200) + '...' : abstract;
            
            return `
                <div class="ss-result-card">
                    <div class="ss-result-header">
                        <h4 class="ss-result-title">${this.escapeHtml(paper.title)}</h4>
                        <button class="ss-add-btn" data-paper-id="${paper.paperId}" title="Add to library">
                            ➕
                        </button>
                    </div>
                    <div class="ss-result-meta">
                        <span>📅 ${paper.year || 'N/A'}</span>
                        <span>✍️ ${this.escapeHtml(authors)}${moreAuthors}</span>
                        <span>📊 ${paper.citationCount || 0} citations</span>
                    </div>
                    <p class="ss-result-abstract">${this.escapeHtml(shortAbstract)}</p>
                </div>
            `;
        }).join('');

        resultsContainer.innerHTML = html;

        // Add click listeners to add buttons
        resultsContainer.querySelectorAll('.ss-add-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const paperId = btn.dataset.paperId;
                await this.addPaperFromSemanticScholar(paperId);
            });
        });
    },

    async addPaperFromSemanticScholar(paperId) {
        try {
            // Show loading state
            const btn = document.querySelector(`[data-paper-id="${paperId}"]`);
            const originalText = btn.textContent;
            btn.textContent = '⏳';
            btn.disabled = true;

            // Fetch full paper details
            const url = `${this.SEMANTIC_SCHOLAR_API}/paper/${paperId}?fields=paperId,title,abstract,authors,year,url,citationCount,publicationDate,tldr`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch paper details: ${response.status}`);
            }

            const paper = await response.json();

            // Create paper object
            const authors = paper.authors ? paper.authors.map(a => a.name).join(', ') : 'Unknown';
            const summary = paper.tldr?.text || paper.abstract || 'No summary available';
            
            const newPaper = {
                title: paper.title,
                url: paper.url || `https://www.semanticscholar.org/paper/${paperId}`,
                summary: summary,
                notes: `Authors: ${authors}\nYear: ${paper.year || 'N/A'}\nCitations: ${paper.citationCount || 0}\n\nFull Abstract:\n${paper.abstract || 'No abstract available'}`,
                tags: this.generateTagsFromPaper(paper),
                folderId: Folders.currentFolderId === 'all' ? null : Folders.currentFolderId,
                priority: 'P2',
                status: 'To Read',
                semanticScholarId: paperId
            };

            // Save paper
            Storage.addPaper(newPaper);
            
            // Update UI
            this.renderPapers();
            Folders.updateCounts();

            // Show success
            btn.textContent = '✅';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Error adding paper from Semantic Scholar:', error);
            alert(`Failed to add paper. You can add it manually using the "+ New Paper" button instead.`);
            
            const btn = document.querySelector(`[data-paper-id="${paperId}"]`);
            if (btn) {
                btn.textContent = '❌';
                setTimeout(() => {
                    btn.textContent = '➕';
                    btn.disabled = false;
                }, 2000);
            }
        }
    },

    generateTagsFromPaper(paper) {
        const tags = [];
        
        // Add year tag
        if (paper.year) {
            tags.push(paper.year.toString());
        }
        
        // Add citation count category
        if (paper.citationCount) {
            if (paper.citationCount > 1000) tags.push('highly-cited');
            else if (paper.citationCount > 100) tags.push('influential');
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
        this.currentPaperId = paperId;
        const modal = document.getElementById('paper-modal');
        const title = document.getElementById('modal-title');

        if (paperId) {
            // Edit mode
            title.textContent = 'Edit Paper';
            const paper = Storage.getPaperById(paperId);
            if (paper) {
                document.getElementById('paper-title').value = paper.title || '';
                document.getElementById('paper-url').value = paper.url || '';
                document.getElementById('paper-summary').value = paper.summary || '';
                document.getElementById('paper-notes').value = paper.notes || '';
                document.getElementById('paper-tags').value = paper.tags ? paper.tags.join(', ') : '';
                document.getElementById('paper-folder').value = paper.folderId || '';
                document.getElementById('paper-priority').value = paper.priority || 'P2';
                document.getElementById('paper-status').value = paper.status || 'To Read';
            }
        } else {
            // New paper mode
            title.textContent = 'Add New Paper';
            document.getElementById('paper-title').value = '';
            document.getElementById('paper-url').value = '';
            document.getElementById('paper-summary').value = '';
            document.getElementById('paper-notes').value = '';
            document.getElementById('paper-tags').value = '';
            document.getElementById('paper-folder').value = Folders.currentFolderId === 'all' ? '' : Folders.currentFolderId;
            document.getElementById('paper-priority').value = 'P2';
            document.getElementById('paper-status').value = 'To Read';
        }

        // Populate folder dropdown
        this.populateFolderDropdown();

        modal.classList.add('active');
        document.getElementById('paper-title').focus();
    },

    closePaperModal() {
        const modal = document.getElementById('paper-modal');
        modal.classList.remove('active');
        this.currentPaperId = null;
    },

    populateFolderDropdown() {
        const select = document.getElementById('paper-folder');
        const folders = Storage.getFolders();

        let html = '<option value="">No folder</option>';
        folders.forEach(folder => {
            html += `<option value="${folder.id}">${folder.icon} ${this.escapeHtml(folder.name)}</option>`;
        });

        select.innerHTML = html;
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

        // Apply filters
        papers = this.filterPapers(papers);

        // Update folder title
        const titleElement = document.getElementById('current-folder-title');
        if (Folders.currentFolderId === 'all') {
            titleElement.textContent = 'All Papers';
        } else {
            const folder = Storage.getFolderById(Folders.currentFolderId);
            if (folder) {
                titleElement.textContent = `${folder.name}`;
            }
        }

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
        const folderBadge = folder ? 
            `<span class="paper-folder-badge">${folder.icon} ${this.escapeHtml(folder.name)}</span>` : '';
        
        const tags = paper.tags && paper.tags.length > 0 ? 
            paper.tags.slice(0, 3).map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('') : '';

        const priorityBadge = `<span class="priority-badge ${paper.priority}">${paper.priority || 'P2'}</span>`;
        const statusBadge = `<span class="status-badge ${paper.status?.toLowerCase().replace(' ', '-')}">${paper.status || 'To Read'}</span>`;

        const date = new Date(paper.createdAt).toLocaleDateString();

        return `
            <div class="paper-card" data-paper-id="${paper.id}">
                <div class="paper-metadata">
                    ${priorityBadge}
                    ${statusBadge}
                    ${folderBadge}
                </div>
                <div class="paper-card-header">
                    <h3 class="paper-title">${this.escapeHtml(paper.title)}</h3>
                </div>
                ${paper.summary ? `<p class="paper-summary">${this.escapeHtml(paper.summary)}</p>` : ''}
                <div class="paper-footer">
                    <span class="paper-date">${date}</span>
                    ${tags ? `<div class="paper-tags">${tags}</div>` : ''}
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

        const folder = paper.folderId ? Storage.getFolderById(paper.folderId) : null;
        const folderBadge = folder ? 
            `<span class="paper-folder-badge">${this.escapeHtml(folder.name)}</span>` : '';

        const tags = paper.tags && paper.tags.length > 0 ?
            paper.tags.map(tag => `<span class="paper-view-tag">${this.escapeHtml(tag)}</span>`).join('') : 
            '<span class="paper-view-tag">No tags</span>';

        const priorityBadge = `<span class="priority-badge ${paper.priority}">${paper.priority || 'P2'}</span>`;
        const statusBadge = `<span class="status-badge ${paper.status?.toLowerCase().replace(' ', '-')}">${paper.status || 'To Read'}</span>`;

        // Create or get full-screen view container
        let viewContainer = document.getElementById('paper-view-fullscreen');
        if (!viewContainer) {
            viewContainer = document.createElement('div');
            viewContainer.id = 'paper-view-fullscreen';
            viewContainer.className = 'paper-view-fullscreen';
            document.body.appendChild(viewContainer);
        }

        viewContainer.innerHTML = `
            <div class="paper-view-header">
                <div class="paper-view-back" onclick="Papers.closePaperView()">
                    Back to Papers
                </div>
                <div class="paper-view-actions">
                    <button class="btn btn-secondary" onclick="Papers.openPaperModal('${paper.id}')">
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="Papers.deletePaper('${paper.id}')">
                        Delete
                    </button>
                </div>
            </div>

            <div class="paper-view-content">
                <h1 class="paper-view-title">${this.escapeHtml(paper.title)}</h1>
                
                <div class="paper-view-metadata">
                    ${priorityBadge}
                    ${statusBadge}
                    ${folderBadge}
                    ${paper.url ? `<a href="${this.escapeHtml(paper.url)}" target="_blank" class="paper-view-link" rel="noopener noreferrer">Open Paper</a>` : ''}
                    <span class="paper-view-date">Added: ${new Date(paper.createdAt).toLocaleDateString()}</span>
                </div>

                ${paper.summary ? `
                    <div class="paper-view-section">
                        <h3 class="paper-view-section-title">Summary</h3>
                        <div class="paper-view-section-content">${this.escapeHtml(paper.summary)}</div>
                    </div>
                ` : ''}

                ${paper.notes ? `
                    <div class="paper-view-section">
                        <h3 class="paper-view-section-title">Notes</h3>
                        <div class="paper-view-section-content">${this.escapeHtml(paper.notes)}</div>
                    </div>
                ` : ''}

                <div class="paper-view-section">
                    <h3 class="paper-view-section-title">Tags</h3>
                    <div class="paper-view-tags">${tags}</div>
                </div>
            </div>
        `;

        viewContainer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },

    closePaperView() {
        const viewContainer = document.getElementById('paper-view-fullscreen');
        if (viewContainer) {
            viewContainer.classList.remove('active');
        }
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
        this.activeFilters[filterType] = filterValue;

        // Update button states
        const filterGroup = btnElement.parentElement;
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
