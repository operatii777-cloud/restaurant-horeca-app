import React, { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './DocumentationPage.css';

export const DocumentationPage: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeError, setIframeError] = useState<string | null>(null);

  useEffect(() => {
    console.log('📚 DocumentationPage mounted');
    // Setează src-ul iframe-ului când componenta se montează
    if (iframeRef.current) {
      console.log('📚 Iframe ref found, setting src');
      const iframe = iframeRef.current;
      iframe.src = '/setup-guide.html';
      
      // Adaugă event listener pentru erori
      iframe.onerror = () => {
        console.error('❌ Iframe error');
        setIframeError('Eroare la încărcarea ghidului. Verifică dacă fișierul setup-guide.html există.');
      };
      
      // Adaugă event listener pentru încărcare
      iframe.onload = () => {
        console.log('✅ Iframe loaded');
        setIframeError(null);
      };
    } else {
      console.warn('⚠️ Iframe ref not found');
    }
  }, []);

  return (
    <div className="documentation-page">
      <PageHeader
        title="📚 Documentație & Ghid Setup"
        description="Ghid complet de setup și instrucțiuni pentru utilizarea aplicației"
      />
      
      {iframeError && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {iframeError}
        </div>
      )}
      
      <div className="documentation-container">
        <iframe
          ref={iframeRef}
          className="documentation-iframe"
          title="Ghid Setup"
          src="/setup-guide.html"
          style={{
            width: '100%',
            height: 'calc(100vh - 200px)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>
    </div>
  );
};

