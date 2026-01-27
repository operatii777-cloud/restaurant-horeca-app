/**
 * PHASE S8.3 - Generate UBL Button Component
 * 
 * Restaurant App V3 powered by QrOMS
 */

import React, { useState } from 'react';
import { generateUBL, downloadUBL } from '../../api/ublTipizateApi';
import UBLPreviewModal from './UBLPreviewModal';

interface GenerateUBLButtonProps {
  docType: string;
  docId: number;
  className?: string;
}

export default function GenerateUBLButton({ docType, docId, className }: GenerateUBLButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [xml, setXml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateUBL(docType, docId);
      if (result.success && result.data) {
        setXml(result.data.xml);
        setShowPreview(true);
      } else {
        setError(result.error || 'Failed to generate UBL');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate UBL');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadUBL(docType, docId);
    } catch (err: any) {
      setError(err.message || 'Failed to download UBL');
    }
  };

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={className || 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'}
      >
        {isGenerating ? 'Generating...' : 'Generate UBL'}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}

      {showPreview && xml && (
        <UBLPreviewModal
          xml={xml}
          docType={docType}
          docId={docId}
          onClose={() => {
            setShowPreview(false);
            setXml(null);
          }}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}


