import { useState, useEffect } from 'react';
import { Year } from '../../types';
import './YearManager.css';

interface YearManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { year: number; label?: string }) => void;
  year: Year | null;
  loading: boolean;
}

export function YearManager({
  isOpen,
  onClose,
  onSubmit,
  year,
  loading,
}: YearManagerProps) {
  const [yearValue, setYearValue] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (year) {
        setYearValue(year.year.toString());
        setLabel(year.label || '');
      } else {
        setYearValue(new Date().getFullYear().toString());
        setLabel('');
      }
      setError(null);
    }
  }, [isOpen, year]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const yearNum = parseInt(yearValue, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setError('Please enter a valid year (1900-2100)');
      return;
    }
    onSubmit({ year: yearNum, label: label.trim() || undefined });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{year ? 'Edit Year' : 'Create Year'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="yearValue">Year *</label>
            <input
              id="yearValue"
              type="number"
              value={yearValue}
              onChange={(e) => setYearValue(e.target.value)}
              min="1900"
              max="2100"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="label">Label (optional)</label>
            <input
              id="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Summer 2023, 2023-24"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (year ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}