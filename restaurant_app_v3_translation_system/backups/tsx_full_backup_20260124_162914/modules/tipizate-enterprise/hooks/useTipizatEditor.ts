/**
 * PHASE S5.4 - useTipizatEditor Hook
 * Enterprise editor hook for all tipizate documents
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tipizateApi } from '../api/tipizateApi';
import { TipizatType } from '../api/types';
import { headerFor, columnsFor, totalsFor, nameFor, schemaFor } from '../config/tipizate.config';
import { useTipizateStore } from '../store/tipizateStore';

export function useTipizatEditor(type: TipizatType) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const store = useTipizateStore();
  const isNew = id === 'new' || !id;

  // State
  const [form, setForm] = useState<Record<string, any>>({});
  const [lines, setLines] = useState<any[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  // Check cache first
  const cachedDoc = !isNew && id ? store.getDocCache(type, parseInt(id)) : null;

  // Load document
  const query = useQuery({
    enabled: !isNew && !!id,
    queryKey: ['tipizate', type, id, store.reloadToken],
    queryFn: async () => {
      const data = await tipizateApi.get(type, parseInt(id!));
      
      // Cache the document
      if (data && id) {
        store.setDocCache(type, parseInt(id), data);
        store.setLastOpened(type, parseInt(id));
      }
      
      return data;
    },
    initialData: cachedDoc,
    onSuccess: (data: any) => {
      if (data) {
        setForm({
          series: data.series || '',
          number: data.number || '',
          date: data.date || new Date().toISOString().split('T')[0],
          locationName: data.locationName || '',
          warehouseId: data.warehouseId || null,
          ...data,
        });
        setLines(data.lines || []);
        setTotals(data.totals || {});
        
        // Push to history for undo/redo
        store.pushHistory({ form: data, lines: data.lines || [], totals: data.totals || {} });
      }
    },
  });

  // Initialize defaults for new document
  useEffect(() => {
    if (isNew && !query.isLoading) {
      const defaults: Record<string, any> = {
        series: type.substring(0, 3).toUpperCase(),
        number: '',
        date: new Date().toISOString().split('T')[0],
        status: 'DRAFT',
      };
      setForm(defaults);
      setLines([]);
      setTotals({});
    }
  }, [isNew, type, query.isLoading]);

  // Auto-calculate totals
  useEffect(() => {
    const calculated: Record<string, number> = {};
    let subtotal = 0;
    let totalVat = 0;

    lines.forEach((line) => {
      const lineTotal = (line.quantity || 0) * (line.unitPrice || 0);
      subtotal += lineTotal;
      totalVat += (lineTotal * (line.vatRate || 0)) / 100;
    });

    calculated.subtotal = subtotal;
    calculated.vatAmount = totalVat;
    calculated.total = subtotal + totalVat;

    // Add document-specific totals
    totalsFor(type).forEach((field) => {
        if (!calculated[field]) {
          calculated[field] = 0;
      }
    });

    setTotals(calculated);
    
    // Push to history for undo/redo (only if document exists)
    if (!isNew && id && Object.keys(calculated).length > 0) {
      store.pushHistory({ form, lines, totals: calculated });
    }
  }, [lines, type, form, isNew, id, store]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        lines,
        totals,
        type,
      };
      if (isNew) {
        return tipizateApi.create(type, payload);
      } else {
        return tipizateApi.update(type, parseInt(id!), payload);
      }
    },
    onSuccess: (data: any) => {
      // Update cache
      if (data && !isNew && id) {
        store.setDocCache(type, parseInt(id), data);
      } else if (data && isNew && data.id) {
        store.setDocCache(type, data.id, data);
        store.setLastOpened(type, data.id);
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tipizate', type] });
      store.reload(); // Trigger cross-tab sync
      
      if (isNew && data?.id) {
        navigate(`/tipizate-enterprise/${type.toLowerCase().replace('_', '-')}/${data.id}`);
      }
    },
  });

  // Sign mutation
  const signMutation = useMutation({
    mutationFn: () => tipizateApi.sign(type, parseInt(id!)),
    onSuccess: async () => {
      // Refresh document from API
      const updated = await tipizateApi.get(type, parseInt(id!));
      if (updated && id) {
        store.setDocCache(type, parseInt(id), updated);
      }
      queryClient.invalidateQueries({ queryKey: ['tipizate', type, id] });
      store.reload();
    },
  });

  // Lock mutation
  const lockMutation = useMutation({
    mutationFn: () => tipizateApi.lock(type, parseInt(id!)),
    onSuccess: async () => {
      // Refresh document from API
      const updated = await tipizateApi.get(type, parseInt(id!));
      if (updated && id) {
        store.setDocCache(type, parseInt(id), updated);
      }
      queryClient.invalidateQueries({ queryKey: ['tipizate', type, id] });
      store.reload();
    },
  });

  // PDF handler
  const loadPdf = async () => {
    if (!id || isNew) return;
    try {
      const blob = await tipizateApi.pdf(parseInt(id), type);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfOpen(true);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleSign = () => {
    if (!id || isNew) return;
    signMutation.mutate();
  };

  const handleLock = () => {
    if (!id || isNew) return;
    lockMutation.mutate();
  };

  const handlePdf = () => {
    loadPdf();
  };

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: ['tipizate', type, id] });
  };

  return {
    isNew,
    loading: query.isLoading,
    saving: saveMutation.isPending,
    signing: signMutation.isPending,
    locking: lockMutation.isPending,
    name: nameFor(type),
    schema: schemaFor(type),
    headerFields: headerFor(type),
    columns: columnsFor(type),
    form,
    setForm,
    lines,
    setLines,
    totals,
    save: handleSave,
    update: handleSave,
    sign: handleSign,
    lock: handleLock,
    pdf: handlePdf,
    pdfUrl,
    pdfOpen,
    setPdfOpen,
    reload,
    document: query.data,
  };
}


