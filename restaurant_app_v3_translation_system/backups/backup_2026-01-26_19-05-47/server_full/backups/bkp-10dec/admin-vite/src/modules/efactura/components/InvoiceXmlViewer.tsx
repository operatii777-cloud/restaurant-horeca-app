/**
 * PHASE S11 - Invoice XML Viewer Component
 * 
 * Displays UBL XML with syntax highlighting and download option.
 */

import React, { useState } from 'react';
import './InvoiceXmlViewer.css';

interface InvoiceXmlViewerProps {
  xml: string;
  invoiceId: number;
}

export function InvoiceXmlViewer({ xml, invoiceId }: InvoiceXmlViewerProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceId}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy XML:', error);
    }
  };

  // Simple XML formatting (basic indentation)
  const formatXml = (xml: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    xml.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) indent--;
      formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n';
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input')) indent++;
    });

    return formatted.substring(1, formatted.length - 2);
  };

  const formattedXml = xml ? formatXml(xml) : '';

  return (
    <div className={`invoice-xml-viewer invoice-xml-viewer--${theme}`}>
      <div className="xml-viewer-header">
        <h3>UBL XML</h3>
        <div className="xml-viewer-actions">
          <button
            className="xml-action-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="xml-action-btn" onClick={handleCopy}>
            {copied ? '✓ Copiat' : '📋 Copiază'}
          </button>
          <button className="xml-action-btn" onClick={handleDownload}>
            ⬇️ Download
          </button>
        </div>
      </div>
      <div className="xml-viewer-content">
        <pre className="xml-code">
          <code>{formattedXml || 'XML nu este disponibil'}</code>
        </pre>
      </div>
    </div>
  );
}

