import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaperViewer } from '../components/PaperViewer/PaperViewer';
import WritingPad, { WritingPadHandle } from '../components/WritingPad/WritingPad';
import { QuestionPanel } from '../components/QuestionPanel/QuestionPanel';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { usePaper } from '../hooks/usePapers';
import { useQuestions } from '../hooks/useQuestions';
import { useAnnotations } from '../hooks/useAnnotations';
import { Tool } from '../components/Toolbar/Toolbar';
import { Annotation } from '../types';
import './PaperView.css';

export function PaperView() {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  
  const { paper, loading: paperLoading, error: paperError, rotatePage, refetch } = usePaper(paperId || null);
  const { questions, createQuestion, updateQuestion, deleteQuestion } = useQuestions(paperId || null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showQuestions, _setShowQuestions] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionPageRange, setNewQuestionPageRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const writingPadRef = useRef<WritingPadHandle>(null);
  const writingPadContainerRef = useRef<HTMLDivElement>(null);
  const currentPage = paper?.pages[currentPageIndex];
  const currentPageId = currentPage?.id;

  const { annotations, batchSaveAnnotations } = useAnnotations(
    paperId || null,
    currentPageId || null,
    selectedQuestionId || undefined
  );

  const handlePageChange = useCallback((index: number) => {
    setCurrentPageIndex(index);
    setSelectedQuestionId(null);
  }, []);

  // Sync active tool with writing pad
  useEffect(() => {
    if (writingPadRef.current) {
      writingPadRef.current.setTool(activeTool, color, strokeWidth);
    }
  }, [activeTool, color, strokeWidth]);

  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  const handleRotationChange = useCallback(async (pageId: string, _rotation: number) => {
    await rotatePage(pageId);
    await refetch();
  }, [rotatePage, refetch]);

  const handleCreateQuestion = useCallback(async () => {
    if (!newQuestionTitle.trim() || !newQuestionPageRange.start || !newQuestionPageRange.end) return;
    
    const startPage = paper?.pages.find(p => p.pageNumber === parseInt(newQuestionPageRange.start, 10));
    const endPage = paper?.pages.find(p => p.pageNumber === parseInt(newQuestionPageRange.end, 10));
    
    if (!startPage || !endPage) return;

    await createQuestion({
      paperId: paperId!,
      title: newQuestionTitle.trim(),
      pageIdStart: startPage.id,
      pageIdEnd: endPage.id,
      solvedStatus: 'unsolved',
      tags: [],
      notes: '',
    });
    
    setShowCreateQuestion(false);
    setNewQuestionTitle('');
    setNewQuestionPageRange({ start: '', end: '' });
  }, [paper, paperId, createQuestion, newQuestionTitle, newQuestionPageRange]);

  const handleUpdateQuestion = useCallback(async (id: string, data: Partial<{ title: string; solvedStatus: 'solved' | 'unsolved'; tags: string[]; notes: string }>) => {
    await updateQuestion(id, data as any);
  }, [updateQuestion]);

  const handleDeleteQuestion = useCallback(async (id: string) => {
    if (confirm('Delete this question?')) {
      await deleteQuestion(id);
      if (selectedQuestionId === id) setSelectedQuestionId(null);
    }
  }, [deleteQuestion, selectedQuestionId]);

  const handleLinkAnnotations = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId);
  }, []);

  const handleAnnotationChange = useCallback((annotations: Annotation[]) => {
    batchSaveAnnotations(annotations);
  }, [batchSaveAnnotations]);

  if (paperLoading) {
    return <div className="paper-view loading">Loading paper...</div>;
  }

  if (paperError || !paper) {
    return (
      <div className="paper-view error">
        <h2>Paper not found</h2>
        <button onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const totalPages = paper.pages.length;

  return (
    <div className="paper-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1>{paper.originalName}</h1>
        <div className="paper-status">
          <span className={`status-badge ${paper.solvedStatus}`}>{paper.solvedStatus}</span>
          <span>{totalPages} pages</span>
        </div>
      </div>

      <div className="view-layout">
        <div className="view-main">
          <Toolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            color={color}
            onColorChange={setColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            onUndo={writingPadRef.current?.undo ?? (() => {})}
            onRedo={writingPadRef.current?.redo ?? (() => {})}
            canUndo={writingPadRef.current?.canUndo ?? false}
            canRedo={writingPadRef.current?.canRedo ?? false}
          />

          <div className="viewer-container">
            <PaperViewer
              paperId={paperId!}
              pages={paper.pages}
              currentPageIndex={currentPageIndex}
              onPageChange={handlePageChange}
              onRotationChange={handleRotationChange}
              scale={scale}
              onScaleChange={handleScaleChange}
              writingPadRef={writingPadContainerRef}
            />
            
            <WritingPad
              paperId={paperId!}
              pageId={currentPageId!}
              annotations={annotations}
              onAnnotationsChange={handleAnnotationChange}
              containerRef={writingPadContainerRef}
            />
          </div>
        </div>

        {showQuestions && (
          <aside className="view-sidebar">
            <div className="sidebar-header">
              <h3>Questions</h3>
              <button className="icon-btn" onClick={() => setShowCreateQuestion(true)} title="Add Question">+</button>
            </div>
            
            <QuestionPanel
              questions={questions}
              pages={paper.pages}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={setSelectedQuestionId}
              onCreateQuestion={handleCreateQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onLinkAnnotations={handleLinkAnnotations}
            />
          </aside>
        )}
      </div>

      {showCreateQuestion && (
        <div className="modal-overlay" onClick={() => setShowCreateQuestion(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Question</h2>
              <button className="close-btn" onClick={() => setShowCreateQuestion(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateQuestion(); }} className="modal-body">
              <div className="form-group">
                <label htmlFor="qTitle">Title *</label>
                <input
                  id="qTitle"
                  type="text"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="e.g., Question 1"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Page Range *</label>
                <div className="page-range-inputs">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={newQuestionPageRange.start}
                    onChange={(e) => setNewQuestionPageRange(prev => ({ ...prev, start: e.target.value }))}
                    placeholder="Start"
                    required
                  />
                  <span>–</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={newQuestionPageRange.end}
                    onChange={(e) => setNewQuestionPageRange(prev => ({ ...prev, end: e.target.value }))}
                    placeholder="End"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateQuestion(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}