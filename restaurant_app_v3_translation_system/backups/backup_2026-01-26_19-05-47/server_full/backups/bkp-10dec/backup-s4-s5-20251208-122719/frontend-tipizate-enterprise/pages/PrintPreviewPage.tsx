/**
 * PHASE S5.6 - Print Preview Page
 * Full-page print preview with print/download options
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tipizateApi } from '../api/tipizateApi';
import { TipizatType } from '../api/types';
import { nameFor } from '../config/tipizate.config';

export default function PrintPreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const type = searchParams.get('type') as TipizatType | null;
  const id = searchParams.get('id');
  const format = (searchParams.get('format') || 'A4') as 'A4' | 'A5';
  const printerFriendly = searchParams.get('printerFriendly') === 'true' || searchParams.get('print') === 'true';
  const monochrome = searchParams.get('monochrome') === 'true' || searchParams.get('color') === 'false';

  useEffect(() => {
    if (!type || !id) {
      setError('Tip document și ID sunt obligatorii');
      setLoading(false);
      return;
    }

    loadPdf();
  }, [type, id, format, printerFriendly, monochrome]);

  const loadPdf = async () => {
    if (!type || !id) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await tipizateApi.pdf(parseInt(id), type, {
        format,
        printerFriendly,
        monochrome,
      });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea PDF-ului');
      console.error('PDF load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl || !type || !id) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${type}-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    navigate(-1);
  };

  if (!type || !id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Parametri lipsă
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tip document și ID sunt obligatorii
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Înapoi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Preview Print - {nameFor(type)}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Document #{id} | Format: {format} | {printerFriendly ? 'Printer-Friendly' : 'Standard'} | {monochrome ? 'Monochrome' : 'Color'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPdf}
            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Reîncarcă
          </button>
          {pdfUrl && (
            <>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <i className="bi bi-download me-1"></i>
                Descarcă
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                <i className="bi bi-printer me-1"></i>
                Tipărește
              </button>
            </>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Închide
          </button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Se încarcă PDF-ul...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center max-w-md">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <i className="bi bi-exclamation-triangle text-4xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Eroare
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={loadPdf}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Reîncearcă
              </button>
            </div>
          </div>
        )}

        {pdfUrl && !loading && !error && (
          <div className="flex justify-center">
            <iframe
              src={pdfUrl}
              className="w-full max-w-5xl h-full min-h-[800px] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg bg-white"
              title="PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}

