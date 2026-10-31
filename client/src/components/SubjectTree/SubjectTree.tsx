import { SubjectWithYears } from '../../types';
import './SubjectTree.css';

interface SubjectTreeProps {
  subjects: SubjectWithYears[];
  selectedSubjectId: string | null;
  selectedYearId: string | null;
  onSelectSubject: (subjectId: string) => void;
  onSelectYear: (subjectId: string, yearId: string) => void;
  onCreateSubject: () => void;
  onCreateYear: () => void;
  onEditSubject: (subject: SubjectWithYears) => void;
  onDeleteSubject: (subjectId: string) => void;
  onEditYear: (year: SubjectWithYears['years'][0]) => void;
  onDeleteYear: (yearId: string) => void;
}

export function SubjectTree({
  subjects,
  selectedSubjectId,
  selectedYearId,
  onSelectSubject,
  onSelectYear,
  onCreateSubject,
  onCreateYear,
  onEditSubject,
  onDeleteSubject,
  onEditYear,
  onDeleteYear,
}: SubjectTreeProps) {
  return (
    <div className="subject-tree">
      <div className="tree-header">
        <h2>Subjects</h2>
        <button className="btn-add" onClick={onCreateSubject} title="Add Subject">
          +
        </button>
      </div>
      
      {subjects.length === 0 ? (
        <div className="empty-state">
          <p>No subjects yet</p>
          <button onClick={onCreateSubject}>Create your first subject</button>
        </div>
      ) : (
        <ul className="tree-list">
          {subjects.map(subject => (
            <SubjectNode
              key={subject.id}
              subject={subject}
              isSelected={subject.id === selectedSubjectId}
              selectedYearId={selectedYearId}
              onSelectSubject={onSelectSubject}
              onSelectYear={onSelectYear}
              onCreateYear={onCreateYear}
              onEditSubject={onEditSubject}
              onDeleteSubject={onDeleteSubject}
              onEditYear={onEditYear}
              onDeleteYear={onDeleteYear}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SubjectNodeProps {
  subject: SubjectWithYears;
  isSelected: boolean;
  selectedYearId: string | null;
  onSelectSubject: (subjectId: string) => void;
  onSelectYear: (subjectId: string, yearId: string) => void;
  onCreateYear: () => void;
  onEditSubject: (subject: SubjectWithYears) => void;
  onDeleteSubject: (subjectId: string) => void;
  onEditYear: (year: SubjectWithYears['years'][0]) => void;
  onDeleteYear: (yearId: string) => void;
}

function SubjectNode({
  subject,
  isSelected,
  selectedYearId,
  onSelectSubject,
  onSelectYear,
  onCreateYear,
  onEditSubject,
  onDeleteSubject,
  onEditYear,
  onDeleteYear,
}: SubjectNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const subjectColor = subject.color || '#3b82f6';

  const handleSubjectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectSubject(subject.id);
  };

  const handleYearClick = (e: React.MouseEvent, yearId: string) => {
    e.stopPropagation();
    onSelectYear(subject.id, yearId);
  };

  return (
    <li className="subject-node">
      <div 
        className={`subject-header ${isSelected ? 'selected' : ''}`}
        onClick={handleSubjectClick}
        style={{ borderLeftColor: subjectColor }}
      >
        <span className="expand-toggle" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          {expanded ? '▼' : '▶'}
        </span>
        <span className="subject-color-indicator" style={{ backgroundColor: subjectColor }}></span>
        <span className="subject-name">{subject.name}</span>
        {subject.code && <span className="subject-code">{subject.code}</span>}
        <div className="subject-actions">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEditSubject(subject); }} title="Edit">✏️</button>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject.id); }} title="Delete">🗑️</button>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onCreateYear(); }} title="Add Year">+</button>
        </div>
      </div>
      
      {expanded && subject.years.length > 0 && (
        <ul className="year-list">
          {subject.years.map(year => (
            <li key={year.id} className="year-item">
              <div 
                className={`year-header ${selectedYearId === year.id ? 'selected' : ''}`}
                onClick={(e) => handleYearClick(e, year.id)}
              >
                <span className="year-label">{year.label || year.year.toString()}</span>
                <span className="paper-count">{year.paperCount} paper{year.paperCount !== 1 ? 's' : ''}</span>
                <div className="year-actions">
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEditYear(year); }} title="Edit">✏️</button>
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDeleteYear(year.id); }} title="Delete">🗑️</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {expanded && subject.years.length === 0 && (
        <div className="empty-years" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onCreateYear()}>Add Year</button>
        </div>
      )}
    </li>
  );
}

import { useState } from 'react';