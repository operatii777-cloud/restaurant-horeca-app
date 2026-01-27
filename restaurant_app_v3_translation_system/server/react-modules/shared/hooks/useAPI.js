/**
 * 🪝 useAPI - Custom Hook pentru API calls cu loading & error states
 * 
 * Folosire:
 *   const { data, loading, error, refetch } = useAPI(API.ingredients.getAll);
 */

import { useState, useEffect, useCallback } from 'react';

export function useAPI(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      // Unwrap response - suportă multiple structuri:
      // - {success, ingredients: [...]}
      // - {success, data: [...]}
      // - direct array [...]
      const unwrappedData = response.data?.ingredients || response.data?.data || response.data;
      setData(unwrappedData);
    } catch (err) {
      console.error('❌ useAPI Error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiCall, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * 🪝 useMutation - Custom Hook pentru mutations (POST/PUT/DELETE) cu loading & error
 * 
 * Folosire:
 *   const { mutate, loading, error } = useMutation(API.ingredients.create);
 *   await mutate({ name: 'Făină', unit: 'kg' });
 */
export function useMutation(apiCall) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args);
      
      // Unwrap response - suportă multiple structuri:
      // - {success, ingredient: {...}}
      // - {success, data: {...}}
      // - direct object {...}
      const unwrappedData = response.data?.ingredient || response.data?.data || response.data;
      return unwrappedData;
    } catch (err) {
      console.error('❌ useMutation Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return {
    mutate,
    loading,
    error,
    clearError: () => setError(null),
  };
}

