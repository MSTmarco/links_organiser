/* ========== FOLDER ITEMS ========== */
.folder-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
}

.folder-item:hover {
    background: var(--bg-color);
}

.folder-item.active {
    background: rgba(74, 144, 226, 0.1);
    border-left-color: var(--primary-color);
}

.folder-icon {
    font-size: 20px;
}

.folder-name {
    flex: 1;
    font-weight: 500;
    color: var(--text-primary);
}

.paper-count {
    background: var(--bg-color);
    color: var(--text-secondary);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.folder-item.active .paper-count {
    background: var(--primary-color);
    color: white;
}

/* ========== PAPERS GRID ========== */
.papers-grid {
    padding: 24px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    align-content: start;
}

/* ========== PAPER CARD ========== */
.paper-card {
    background: var(--card-bg);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--shadow);
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.paper-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.paper-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.paper-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.paper-folder-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--bg-color);
    border-radius: 4px;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
}

.paper-summary {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.paper-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
}

.paper-date {
    font-size: 12px;
    color: var(--text-secondary);
}

.paper-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.tag {
    display: inline-block;
    padding: 4px 8px;
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-color);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
}

/* ========== PAPER DETAIL VIEW ========== */
.paper-detail {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.paper-meta {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
}

.paper-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
}

.paper-link:hover {
    text-decoration: underline;
}

.paper-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.paper-section h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.paper-section p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    white-space: pre-wrap;
}

.tags-container {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tags-container .tag {
    font-size: 12px;
}

/* ========== NO PAPERS STATE ========== */
.papers-grid .empty-state {
    grid-column: 1 / -1;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
    .papers-grid {
        grid-template-columns: 1fr;
        padding: 16px;
    }

    .paper-card {
        padding: 16px;
    }
}

/* ========== FILTERS SECTION ========== */
.filter-section {
    padding: 0 20px 20px 20px;
}

.filter-group {
    margin-bottom: 20px;
}

.filter-label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.filter-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-btn {
    padding: 8px 12px;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    color: var(--text-primary);
}

.filter-btn:hover {
    background: #e9ecef;
}

.filter-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

/* ========== PRIORITY & STATUS BADGES ========== */
.paper-metadata {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.priority-badge,
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
}

.priority-badge {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

.priority-badge.P2 {
    background: rgba(255, 193, 7, 0.1);
    color: #ff9800;
}

.priority-badge.P3 {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
}

.status-badge {
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-color);
}

.status-badge.reading {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
}

.status-badge.read {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
}
