import { useState, useEffect, useCallback } from 'react';
import { api, Paper, PaperWithDetails } from '../utils/api';

export function usePapers(subjectId: string | null, yearId: string | null) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: string; tags?: string[]; search?: string }>({});

  const fetchPapers = useCallback(async () => {
    if (!subjectId || !yearId) {
      setPapers([]);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getPapers(subjectId, yearId, filters);
      setPapers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  }, [subjectId, yearId, filters]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const uploadPaper = async (file: File, tags: string[] = []) => {
    if (!subjectId || !yearId) throw new Error('No subject/year selected');
    const paper = await api.uploadPaper(subjectId, yearId, file, tags);
    setPapers(prev => [paper, ...prev]);
    return paper;
  };

  const deletePaper = async (id: string) => {
    await api.deletePaper(id);
    setPapers(prev => prev.filter(p => p.id !== id));
  };

  const updatePaperTags = async (id: string, tags: string[]) => {
    const paper = await api.updatePaper(id, { tags });
    setPapers(prev => prev.map(p => p.id === id ? paper : p));
    return paper;
  };

  const setFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return { papers, loading, error, filters, uploadPaper, deletePaper, updatePaperTags, setFilter, clearFilters, refetch: fetchPapers };
}

export function usePaper(paperId: string | null) {
  const [paper, setPaper] = useState<PaperWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaper = useCallback(async () => {
    if (!paperId) {
      setPaper(null);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getPaper(paperId);
      setPaper(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch paper');
    } finally {
      setLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const reorderPages = async (pageIds: string[]) => {
    if (!paper) return;
    const updated = await api.reorderPages(paper.id, pageIds);
    setPaper(updated);
    return updated;
  };

  const rotatePage = async (pageId: string) => {
    if (!paper) return;
    const page = await api.rotatePage(paper.id, pageId);
    setPaper(prev => prev ? { ...prev, pages: prev.pages.map(p => p.id === pageId ? page : p) } : null);
    return page;
  };

  const deletePage = async (pageId: string) => {
    if (!paper) return;
    const updated = await api.deletePage(paper.id, pageId);
    setPaper(updated);
    return updated;
  };

  return { paper, loading, error, reorderPages, rotatePage, deletePage, refetch: fetchPaper };
}