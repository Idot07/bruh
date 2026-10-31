import { useState, useEffect } from 'react';
import { SubjectWithYears } from '../../types';
import './UploadDialog.css';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (subjectId: string, yearId: string, file: File, tags: string[]) => void;
  subjects: SubjectWithYears[];
  selectedSubjectId: string | null;
  selectedYearId: string | null;
}

export function UploadDialog({
  isOpen,
  onClose,
  onUpload,
  subjects,
  selectedSubjectId,
  selectedYearId,
}: UploadDialogProps) {
  const [subjectId, setSubjectId] = useState(selectedSubjectId || '');
  const [yearId, setYearId] = useState(selectedYearId || '');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSubjectId(selectedSubjectId || '');
      setYearId(selectedYearId || '');
      setFile(null);
      setTags('');
      setError(null);
    }
  }, [isOpen, selectedSubjectId, selectedYearId]);

  // Update years when subject changes
  useEffect(() => {
    if (subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject && subject.years.length > 0) {
        setYearId(subject.years[0].id);
      } else {
        setYearId('');
      }
    } else {
      setYearId('');
    }
  }, [subjectId, subjects]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        setError('Only PDF files are allowed');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Only PDF files are allowed');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !yearId || !file) {
      setError('Please select subject, year, and a PDF file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await onUpload(subjectId, yearId, file, tagArray);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const selectedSubject = subjects.find(s => s.id === subjectId);
  const years = selectedSubject?.years || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload PDF Paper</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              disabled={uploading}
            >
              <option value="">Select a subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Year *</label>
            <select
              id="year"
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              required
              disabled={uploading || years.length === 0}
            >
              <option value="">Select a year</option>
              {years.map(y => (
                <option key={y.id} value={y.id}>{y.label || y.year}</option>
              ))}
              {years.length === 0 && <option value="" disabled>No years available for this subject</option>}
            </select>
          </div>

          <div className="form-group">
            <label>PDF File *</label>
            <div
              className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              {file ? (
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button type="button" className="remove-file" onClick={() => setFile(null)}>×</button>
                </div>
              ) : (
                <div className="drop-prompt">
                  <span className="drop-icon">☁️</span>
                  <p>Drag & drop a PDF file here, or click to browse</p>
                  <span className="drop-hint">Max 50MB • PDF only</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., calculus, exam, 2023"
              disabled={uploading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={uploading || !subjectId || !yearId || !file}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useRef } from 'react';