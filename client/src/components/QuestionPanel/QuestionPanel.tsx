import { useState } from 'react';
import { Question, Page } from '../../types';
import './QuestionPanel.css';

interface QuestionPanelProps {
  questions: Question[];
  pages: Page[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onCreateQuestion: () => void;
  onUpdateQuestion: (id: string, data: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
  onLinkAnnotations: (questionId: string) => void;
}

export function QuestionPanel({
  questions,
  pages,
  selectedQuestionId,
  onSelectQuestion,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onLinkAnnotations,
}: QuestionPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');

  const getPageNumber = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    return page ? page.pageNumber : '?';
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionTitle.trim()) {
      // This will be handled by the parent with proper page range
      onCreateQuestion();
      setNewQuestionTitle('');
    }
  };

  return (
    <div className="question-panel">
      <div className="panel-header">
        <h3>Questions</h3>
        <button className="btn-add" onClick={onCreateQuestion} title="Add Question">+</button>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <p>No questions defined</p>
          <form onSubmit={handleCreateQuestion} className="create-question-form">
            <input
              type="text"
              placeholder="Question title..."
              value={newQuestionTitle}
              onChange={(e) => setNewQuestionTitle(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary">Create</button>
          </form>
        </div>
      ) : (
        <div className="questions-list">
          {questions.map(question => (
            <QuestionItem
              key={question.id}
              question={question}
              pageStart={getPageNumber(question.pageIdStart)}
              pageEnd={getPageNumber(question.pageIdEnd)}
              isSelected={question.id === selectedQuestionId}
              isEditing={editingId === question.id}
              onSelect={() => onSelectQuestion(question.id)}
              onEdit={() => setEditingId(question.id)}
              onCancel={() => setEditingId(null)}
              onSave={(data) => {
                onUpdateQuestion(question.id, data);
                setEditingId(null);
              }}
              onDelete={() => onDeleteQuestion(question.id)}
              onLinkAnnotations={() => onLinkAnnotations(question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuestionItemProps {
  question: Question;
  pageStart: number | string;
  pageEnd: number | string;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: Partial<Question>) => void;
  onDelete: () => void;
  onLinkAnnotations: () => void;
}

function QuestionItem({
  question,
  pageStart,
  pageEnd,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onLinkAnnotations,
}: QuestionItemProps) {
  const [editTitle, setEditTitle] = useState(question.title);
  const [editSolved, setEditSolved] = useState(question.solvedStatus);

  const pageRange = pageStart === pageEnd ? `p. ${pageStart}` : `pp. ${pageStart}–${pageEnd}`;

  const statusColor = question.solvedStatus === 'solved' ? '#10b981' : '#ef4444';

  if (isEditing) {
    return (
      <div className="question-item editing">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave({ title: editTitle, solvedStatus: editSolved });
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="edit-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={editSolved === 'solved'}
              onChange={(e) => setEditSolved(e.target.checked ? 'solved' : 'unsolved')}
            />
            Solved
          </label>
          <button className="btn-save" onClick={() => onSave({ title: editTitle, solvedStatus: editSolved })}>Save</button>
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`question-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="question-main">
        <div className="question-title-row">
          <h4 className="question-title">{question.title}</h4>
          <span 
            className="question-status"
            style={{ backgroundColor: statusColor }}
          >
            {question.solvedStatus}
          </span>
        </div>
        <div className="question-meta">
          <span className="page-range">{pageRange}</span>
          {question.tags.length > 0 && (
            <span className="tags">
              {question.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </span>
          )}
        </div>
        {question.notes && (
          <p className="question-notes">{question.notes}</p>
        )}
      </div>
      <div className="question-actions">
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onLinkAnnotations(); }} title="Link annotations">🔗</button>
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit">✏️</button>
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">🗑️</button>
      </div>
    </div>
  );
}