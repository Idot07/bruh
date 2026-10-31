import { useState, useEffect, useCallback, useRef } from 'react';
import { api, Annotation } from '../utils/api';

export function useAnnotations(paperId: string | null, pageId: string | null, questionId?: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const pendingAnnotations = useRef<Annotation[]>([]);

  const fetchAnnotations = useCallback(async () => {
    if (!paperId) {
      setAnnotations([]);
      return;
    }
    try {
      setLoading(true);
      const data = pageId 
        ? await api.getAnnotationsByPage(pageId)
        : await api.getAnnotations(paperId, undefined, questionId);
      setAnnotations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch annotations');
    } finally {
      setLoading(false);
    }
  }, [paperId, pageId, questionId]);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  const createAnnotation = async (data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const annotation = await api.createAnnotation(data);
    setAnnotations(prev => [...prev, annotation]);
    return annotation;
  };

  const batchSaveAnnotations = useCallback((newAnnotations: Annotation[]) => {
    pendingAnnotations.current = newAnnotations;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      try {
        await api.batchUpsertAnnotations(pendingAnnotations.current);
        pendingAnnotations.current = [];
      } catch (err) {
        console.error('Failed to batch save annotations:', err);
      }
    }, 1000);
  }, []);

  const updateAnnotation = async (id: string, data: Partial<Omit<Annotation, 'id' | 'paperId' | 'pageId' | 'questionId' | 'type' | 'createdAt'>>) => {
    const annotation = await api.updateAnnotation(id, data);
    setAnnotations(prev => prev.map(a => a.id === id ? annotation : a));
    return annotation;
  };

  const deleteAnnotation = async (id: string) => {
    await api.deleteAnnotation(id);
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (pendingAnnotations.current.length > 0) {
        api.batchUpsertAnnotations(pendingAnnotations.current).catch(console.error);
      }
    };
  }, []);

  return { annotations, loading, error, createAnnotation, batchSaveAnnotations, updateAnnotation, deleteAnnotation, refetch: fetchAnnotations };
}