import { useState, useCallback } from 'react';
import { SubjectTree } from '../components/SubjectTree/SubjectTree';
import { PaperList } from '../components/PaperList/PaperList';
import { UploadDialog } from '../components/UploadDialog/UploadDialog';
import { SubjectManager } from '../components/SubjectManager/SubjectManager';
import { YearManager } from '../components/YearManager/YearManager';
import { useSubjects } from '../hooks/useSubjects';
import { useYears } from '../hooks/useYears';
import { usePapers } from '../hooks/usePapers';
import './Dashboard.css';

export function Dashboard() {
  const { subjects, createSubject, updateSubject, deleteSubject } = useSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  const { years, createYear, updateYear, deleteYear } = useYears(selectedSubjectId);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);

  const { papers, loading: papersLoading, uploadPaper, deletePaper, filters, setFilter, clearFilters } = 
    usePapers(selectedSubjectId, selectedYearId);

  const [showUpload, setShowUpload] = useState(false);
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [editingSubject, setEditingSubject] = useState<typeof subjects[0] | null>(null);
  const [showYearManager, setShowYearManager] = useState(false);
  const [editingYear, setEditingYear] = useState<typeof years[0] | null>(null);

  const handleSubjectSelect = useCallback((subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedYearId(null);
  }, []);

  const handleYearSelect = useCallback((subjectId: string, yearId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedYearId(yearId);
  }, []);

  const handleCreateSubject = useCallback(() => {
    setEditingSubject(null);
    setShowSubjectManager(true);
  }, []);

  const handleEditSubject = useCallback((subject: typeof subjects[0]) => {
    setEditingSubject(subject);
    setShowSubjectManager(true);
  }, []);

  const handleDeleteSubject = useCallback((subjectId: string) => {
    if (confirm('Delete this subject and all its years and papers?')) {
      deleteSubject(subjectId);
      if (selectedSubjectId === subjectId) {
        setSelectedSubjectId(null);
        setSelectedYearId(null);
      }
    }
  }, [deleteSubject, selectedSubjectId]);

  const handleCreateYear = useCallback(() => {
    setEditingYear(null);
    setShowYearManager(true);
  }, []);

  const handleEditYear = useCallback((year: typeof years[0]) => {
    setEditingYear(year);
    setShowYearManager(true);
  }, []);

  const handleDeleteYear = useCallback((yearId: string) => {
    if (confirm('Delete this year and all its papers?')) {
      deleteYear(yearId);
      if (selectedYearId === yearId) {
        setSelectedYearId(null);
      }
    }
  }, [deleteYear, selectedYearId]);

  const handleSubjectSubmit = useCallback(async (data: { name: string; code?: string; color?: string }) => {
    if (editingSubject) {
      await updateSubject(editingSubject.id, data);
    } else {
      await createSubject(data);
    }
    setShowSubjectManager(false);
    setEditingSubject(null);
  }, [createSubject, updateSubject, editingSubject]);

  const handleYearSubmit = useCallback(async (data: { year: number; label?: string }) => {
    if (!selectedSubjectId) return;
    if (editingYear) {
      await updateYear(editingYear.id, data);
    } else {
      await createYear(data);
    }
    setShowYearManager(false);
    setEditingYear(null);
  }, [createYear, updateYear, selectedSubjectId, editingYear]);

  const handleUpload = useCallback(async (_subjectId: string, _yearId: string, file: File, tags: string[]) => {
    await uploadPaper(file, tags);
  }, [uploadPaper]);

  const handlePaperSelect = useCallback((paperId: string) => {
    window.location.href = `/papers/${paperId}`;
  }, []);

  const handleDeletePaper = useCallback((paperId: string) => {
    if (confirm('Delete this paper and all its annotations?')) {
      deletePaper(paperId);
    }
  }, [deletePaper]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>PDF Past Paper Manager</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowUpload(true)} disabled={!selectedSubjectId || !selectedYearId}>
            Upload PDF
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <SubjectTree
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            selectedYearId={selectedYearId}
            onSelectSubject={handleSubjectSelect}
            onSelectYear={handleYearSelect}
            onCreateSubject={handleCreateSubject}
            onCreateYear={handleCreateYear}
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
            onEditYear={handleEditYear}
            onDeleteYear={handleDeleteYear}
          />
        </aside>

        <main className="main-content">
          {selectedSubjectId && selectedYearId ? (
            <PaperList
              papers={papers}
              loading={papersLoading}
              selectedPaperId={null}
              onSelectPaper={handlePaperSelect}
              onUpload={() => setShowUpload(true)}
              onDeletePaper={handleDeletePaper}
              filters={filters}
              onFilterChange={setFilter}
              onClearFilters={clearFilters}
            />
          ) : selectedSubjectId ? (
            <div className="year-selection">
              <h2>Select a Year</h2>
              <p>Choose a year from the sidebar to view papers, or create a new year.</p>
              {years.length === 0 && (
                <button className="btn-primary" onClick={handleCreateYear}>
                  Create Your First Year
                </button>
              )}
            </div>
          ) : (
            <div className="welcome">
              <h2>Welcome</h2>
              <p>Create a subject to get started, or select one from the sidebar.</p>
              <button className="btn-primary" onClick={handleCreateSubject}>Create Your First Subject</button>
            </div>
          )}
        </main>
      </div>

      <UploadDialog
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        selectedYearId={selectedYearId}
      />

      <SubjectManager
        isOpen={showSubjectManager}
        onClose={() => { setShowSubjectManager(false); setEditingSubject(null); }}
        onSubmit={handleSubjectSubmit}
        subject={editingSubject}
        loading={false}
      />

      <YearManager
        isOpen={showYearManager}
        onClose={() => { setShowYearManager(false); setEditingYear(null); }}
        onSubmit={handleYearSubmit}
        year={editingYear}
        loading={false}
      />
    </div>
  );
}