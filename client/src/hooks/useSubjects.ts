import { useState, useEffect, useCallback } from 'react';
import { api, Subject, SubjectWithYears } from '../utils/api';

export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectWithYears[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSubjects();
      // Transform to include years with paper counts
      const subjectsWithYears = await Promise.all(
        data.map(async (subject) => {
          const years = await api.getYears(subject.id);
          const yearsWithCounts = await Promise.all(
            years.map(async (year) => {
              const papers = await api.getPapers(subject.id, year.id);
              return { ...year, paperCount: papers.length };
            })
          );
          return { ...subject, years: yearsWithCounts };
        })
      );
      setSubjects(subjectsWithYears);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const createSubject = async (data: { name: string; code?: string; color?: string }) => {
    const subject = await api.createSubject(data);
    setSubjects(prev => [...prev, { ...subject, years: [] }]);
    return subject;
  };

  const updateSubject = async (id: string, data: Partial<Subject>) => {
    const subject = await api.updateSubject(id, data);
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...subject } : s));
    return subject;
  };

  const deleteSubject = async (id: string) => {
    await api.deleteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return { subjects, loading, error, createSubject, updateSubject, deleteSubject, refetch: fetchSubjects };
}