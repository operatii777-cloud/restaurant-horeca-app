import React, { useState, useEffect, useRef } from 'react';

/**
 * Voice Input (Web Speech API) - Comandă vocală pentru KIOSK
 * Permite ospătarilor să adauge produse sau să caute rapid prin voce
 */
export const KioskVoiceInput = ({ isListening, onToggle, onCommand }) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Verifică suportul Web Speech API
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn('Web Speech API nu este suportat în acest browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ro-RO'; // Română

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript;
          setTranscript(finalTranscript);
          
          // Procesează comanda
          if (onCommand) {
            processVoiceCommand(finalTranscript);
          }
          
          // Auto-stop după comandă finală
          setTimeout(() => {
            onToggle && onToggle();
          }, 1000);
        } else {
          interimTranscript += event.results[i][0].transcript;
          setTranscript(interimTranscript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Eroare recunoaștere vocală:', event.error);
      if (event.error === 'not-allowed') {
        alert('Accesul la microfon a fost refuzat. Permiteți accesul în setările browserului.');
      }
      onToggle && onToggle();
    };

    recognition.onend = () => {
      // Recognition s-a oprit
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onCommand, onToggle]);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recunoașterea vocală deja pornită');
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignoră
      }
    }
  }, [isListening]);

  /**
   * Procesează comanda vocală și extrage acțiunea
   */
  const processVoiceCommand = (text) => {
    const lowerText = text.toLowerCase();
    
    // Comenzi predefinite
    const commands = [
      {
        patterns: ['adaugă', 'adauga', 'pune', 'vreau', 'comandă'],
        action: 'add_product',
        extract: (t) => t.replace(/^(adaugă|adauga|pune|vreau|comandă)\s+/i, '')
      },
      {
        patterns: ['caută', 'cauta', 'găsește', 'gaseste'],
        action: 'search',
        extract: (t) => t.replace(/^(caută|cauta|găsește|gaseste)\s+/i, '')
      },
      {
        patterns: ['masa', 'selectează masa', 'deschide masa'],
        action: 'select_table',
        extract: (t) => {
          const match = t.match(/masa\s*(\d+)/i);
          return match ? match[1] : null;
        }
      },
      {
        patterns: ['notă', 'nota', 'bon', 'plată'],
        action: 'request_bill',
        extract: () => null
      },
      {
        patterns: ['anulează', 'anuleaza', 'șterge', 'sterge'],
        action: 'cancel',
        extract: () => null
      }
    ];

    for (const cmd of commands) {
      if (cmd.patterns.some(p => lowerText.includes(p))) {
        onCommand && onCommand({
          action: cmd.action,
          text: text,
          value: cmd.extract(text)
        });
        return;
      }
    }

    // Comandă generică - tratează ca search
    onCommand && onCommand({
      action: 'search',
      text: text,
      value: text
    });
  };

  if (!isSupported) {
    return null; // Nu afișa nimic dacă nu e suportat
  }

  if (!isListening) {
    return null;
  }

  return (
    <div 
      className="kiosk-voice-input"
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '9999px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      {/* Microfon animat */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite'
        }} />
        <div style={{
          position: 'relative',
          backgroundColor: '#dc2626',
          padding: '12px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          color: '#9ca3af',
          letterSpacing: '1px'
        }}>
          🎤 KIOSK Assistant
        </span>
        <span style={{
          fontSize: '18px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {transcript || 'Ascult...'}
        </span>
      </div>

      {/* Separator */}
      <div style={{
        width: '1px',
        height: '32px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        margin: '0 8px'
      }} />

      {/* Buton închide */}
      <button
        onClick={() => onToggle && onToggle()}
        style={{
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <style>{`
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0); 
          }
        }
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

/**
 * Buton pentru activarea Voice Input - poate fi adăugat în orice loc din KIOSK
 */
export const KioskVoiceButton = ({ onClick, style }) => {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  if (!isSupported) return null;

  return (
    <button
      onClick={onClick}
      title="Comandă vocală (Voice Input)"
      style={{
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={e => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.backgroundColor = '#2563eb';
      }}
      onMouseLeave={e => {
        e.target.style.transform = 'scale(1)';
        e.target.style.backgroundColor = '#3b82f6';
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
};

export default KioskVoiceInput;
