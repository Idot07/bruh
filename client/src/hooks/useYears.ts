import { useState, useEffect, useCallback } from 'react';
import { api, Year } from '../utils/api';

export function useYears(subjectId: string | null) {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYears = useCallback(async () => {
    if (!subjectId) {
      setYears([]);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getYears(subjectId);
      setYears(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch years');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  const createYear = async (data: { year: number; label?: string }) => {
    if (!subjectId) throw new Error('No subject selected');
    const year = await api.createYear(subjectId, data);
    setYears(prev => [...prev, year].sort((a, b) => b.year - a.year));
    return year;
  };

  const updateYear = async (id: string, data: Partial<Year>) => {
    if (!subjectId) throw new Error('No subject selected');
    const year = await api.updateYear(subjectId, id, data);
    setYears(prev => prev.map(y => y.id === id ? year : y));
    return year;
  };

  const deleteYear = async (id: string) => {
    if (!subjectId) throw new Error('No subject selected');
    await api.deleteYear(subjectId, id);
    setYears(prev => prev.filter(y => y.id !== id));
  };

  return { years, loading, error, createYear, updateYear, deleteYear, refetch: fetchYears };
}