import { useState, useEffect, useCallback } from 'react';
import { api, Question } from '../utils/api';

export function useQuestions(paperId: string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!paperId) {
      setQuestions([]);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getQuestions(paperId);
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const createQuestion = async (data: Omit<Question, 'id'>) => {
    const question = await api.createQuestion(data);
    setQuestions(prev => [...prev, question].sort((a, b) => a.pageIdStart.localeCompare(b.pageIdStart)));
    return question;
  };

  const updateQuestion = async (id: string, data: Partial<Omit<Question, 'id' | 'paperId'>>) => {
    const question = await api.updateQuestion(id, data);
    setQuestions(prev => prev.map(q => q.id === id ? question : q));
    return question;
  };

  const deleteQuestion = async (id: string) => {
    await api.deleteQuestion(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return { questions, loading, error, createQuestion, updateQuestion, deleteQuestion, refetch: fetchQuestions };
}