/**
 * PHASE S11 - e-Factura Details Hook
 * 
 * Hook to load invoice details and UBL XML.
 */

import { useEffect, useState } from 'react';
import { efacturaApi } from '../../../core/api/efacturaApi';
import type { EFacturaInvoice } from '../../../types/invoice';

export function useEFacturaDetails(id: number) {
  const [invoice, setInvoice] = useState<EFacturaInvoice | null>(null);
  const [xml, setXml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [inv, xmlStr] = await Promise.all([
          efacturaApi.getInvoice(id),
          efacturaApi.getInvoiceXml(id).catch(() => null), // XML might not exist
        ]);

        if (!cancelled) {
          setInvoice(inv);
          setXml(xmlStr);
        }
      } catch (error) {
        console.error('[useEFacturaDetails] Error loading invoice:', error);
        if (!cancelled) {
          setInvoice(null);
          setXml(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { invoice, xml, loading, setInvoice };
}

