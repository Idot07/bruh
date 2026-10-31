import { useState } from 'react';
import { Paper } from '../../types';
import './PaperList.css';

interface PaperListProps {
  papers: Paper[];
  loading: boolean;
  selectedPaperId: string | null;
  onSelectPaper: (paperId: string) => void;
  onUpload: () => void;
  onDeletePaper: (paperId: string) => void;
  filters: { status?: string; tags?: string[]; search?: string };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export function PaperList({
  papers,
  loading,
  selectedPaperId,
  onSelectPaper,
  onUpload,
  onDeletePaper,
  filters,
  onFilterChange,
  onClearFilters,
}: PaperListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'solved', label: 'Solved' },
    { value: 'unsolved', label: 'Unsolved' },
    { value: 'partial', label: 'Partial' },
  ];

  if (loading) {
    return <div className="paper-list loading">Loading papers...</div>;
  }

  return (
    <div className="paper-list">
      <div className="paper-list-header">
        <div className="header-left">
          <h2>{papers.length} paper{papers.length !== 1 ? 's' : ''}</h2>
          <button className="btn-primary" onClick={onUpload}>Upload PDF</button>
        </div>
        <div className="header-right">
          <div className="filters">
            <input
              type="text"
              placeholder="Search papers..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="search-input"
            />
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value || undefined)}
              className="filter-select"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="view-toggle">
              <button 
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >⊞</button>
              <button 
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
                title="List view"
              >☰</button>
            </div>
          </div>
          {(filters.search || filters.status) && (
            <button className="btn-clear" onClick={onClearFilters}>Clear filters</button>
          )}
        </div>
      </div>

      {papers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No papers found</p>
          <button className="btn-primary" onClick={onUpload}>Upload your first paper</button>
        </div>
      ) : (
        <div className={`papers-container ${viewMode}`}>
          {papers.map(paper => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isSelected={paper.id === selectedPaperId}
              onClick={() => onSelectPaper(paper.id)}
              onDelete={(e) => { e.stopPropagation(); onDeletePaper(paper.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PaperCardProps {
  paper: Paper;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function PaperCard({ paper, isSelected, onClick, onDelete }: PaperCardProps) {
  const statusColor = paper.solvedStatus === 'solved' ? '#10b981' : 
                     paper.solvedStatus === 'unsolved' ? '#ef4444' : '#f59e0b';

  return (
    <div 
      className={`paper-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="paper-thumbnail">
        {paper.thumbnailPath ? (
          <img src={paper.thumbnailPath} alt={paper.originalName} />
        ) : (
          <div className="thumbnail-placeholder">📄</div>
        )}
        <div 
          className="status-badge"
          style={{ backgroundColor: statusColor }}
        >
          {paper.solvedStatus}
        </div>
      </div>
      <div className="paper-info">
        <h3 className="paper-title" title={paper.originalName}>{paper.originalName}</h3>
        <div className="paper-meta">
          <span>{paper.totalPages} pages</span>
          <span>•</span>
          <span>{new Date(paper.uploadDate).toLocaleDateString()}</span>
        </div>
        {paper.tags.length > 0 && (
          <div className="paper-tags">
            {paper.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {paper.tags.length > 3 && (
              <span className="tag more">+{paper.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
      <button className="delete-btn" onClick={onDelete} title="Delete paper">🗑️</button>
    </div>
  );
}