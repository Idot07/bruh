import { useState, useEffect } from 'react';
import { Subject } from '../../types';
import './SubjectManager.css';

interface SubjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; code?: string; color?: string }) => void;
  subject: Subject | null;
  loading: boolean;
}

export function SubjectManager({
  isOpen,
  onClose,
  onSubmit,
  subject,
  loading,
}: SubjectManagerProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (subject) {
        setName(subject.name);
        setCode(subject.code || '');
        setColor(subject.color || '#3b82f6');
      } else {
        setName('');
        setCode('');
        setColor('#3b82f6');
      }
      setError(null);
    }
  }, [isOpen, subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }
    onSubmit({ name: name.trim(), code: code.trim().toUpperCase() || undefined, color });
  };

  if (!isOpen) return null;

  const PRESET_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{subject ? 'Edit Subject' : 'Create Subject'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mathematics"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Code (optional)</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., MATH"
              maxLength={10}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="custom-color"
                title="Custom color"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : (subject ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}