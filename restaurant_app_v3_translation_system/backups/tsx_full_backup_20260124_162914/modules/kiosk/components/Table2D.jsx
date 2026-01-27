import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../kiosk.css'; // Import CSS pentru animații

// Înlocuim framer-motion cu react-draggable pentru compatibilitate cu React 19
import Draggable from 'react-draggable';

// Funcție helper pentru detectare StandBy
const isStandBy = () => {
  return typeof window !== 'undefined' && window.__KIOSK_STANDBY__;
};

/**
 * Componentă Table2D - Masă 2D modernă cu drag & drop (vedere laterală)
 * Design inspirat din imaginea de referință: masă rotundă gri închis, picior central, place-card verde
 * 
 * @param {number} id - ID-ul mesei
 * @param {number} tableNumber - Numărul mesei (1-30)
 * @param {string} status - Status: "free" | "occupied" | "reserved"
 * @param {number} x - Poziția X
 * @param {number} y - Poziția Y
 * @param {function} onMove - Callback când masa este mutată (newX, newY)
 * @param {function} onClick - Callback când masa este clickată
 */
export const Table2D = ({ 
  id, 
  tableNumber, 
  status = 'free', 
  timer = null,
  x = 0, 
  y = 0, 
  onMove, 
  onClick 
}) => {
  // Flag pentru a detecta dacă s-a făcut drag
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef(null);
  const dragDistance = useRef(0);

  // Culori LED în funcție de status (conform cerințelor) - Gradient Premium
  const statusColors = {
    free: {
      bg: 'linear-gradient(135deg, #28a745 0%, #20c997 50%, #17a2b8 100%)',
      text: '#ffffff',
      glow: '#28a745',
      border: '#ffffff',
      shadow: 'rgba(40, 167, 69, 0.3)'
    },
    occupied: {
      bg: 'linear-gradient(135deg, #dc3545 0%, #c82333 50%, #bd2130 100%)',
      text: '#ffffff',
      glow: '#dc3545',
      border: '#ffffff',
      shadow: 'rgba(220, 53, 69, 0.3)'
    },
    reserved: {
      bg: 'linear-gradient(135deg, #007bff 0%, #0056b3 50%, #004085 100%)',
      text: '#ffffff',
      glow: '#007bff',
      border: '#ffffff',
      shadow: 'rgba(0, 123, 255, 0.3)'
    }
  };

  const color = statusColors[status] || statusColors.free;
  
  // Animație pulse pentru mesele ocupate
  const isOccupied = status === 'occupied';

  const handleStart = (event, data) => {
    // 🔒 Blocăm drag în StandBy
    if (isStandBy()) {
      return false;
    }
    setIsDragging(false);
    dragStartTime.current = Date.now();
    dragDistance.current = 0;
  };

  const handleDrag = (event, data) => {
    // 🔒 Blocăm drag în StandBy
    if (isStandBy()) {
      return false;
    }
    // Calculează distanța totală de drag
    dragDistance.current = Math.abs(data.deltaX) + Math.abs(data.deltaY);
    // Dacă s-a mutat măcar 10px, considerăm că e drag
    if (dragDistance.current > 10) {
      setIsDragging(true);
    }
  };

  const handleStop = (event, data) => {
    // 🔒 Blocăm drag în StandBy
    if (isStandBy()) {
      return;
    }
    const totalDistance = Math.abs(data.deltaX) + Math.abs(data.deltaY);
    const wasDragging = totalDistance > 10; // Threshold pentru drag
    
    if (wasDragging && onMove) {
      // react-draggable: data.x și data.y sunt pozițiile absolute finale
      const newX = Math.max(0, data.x); // Previne valori negative
      const newY = Math.max(0, data.y);
      console.log(`🔄 Table2D - Drag end: masa ${tableNumber}, poziție nouă: (${newX}, ${newY})`);
      onMove(newX, newY);
    }
    
    // 🔴 FIX: Resetăm imediat flag-urile pentru a permite click-uri rapide după drag
    setIsDragging(false);
    dragStartTime.current = null;
    dragDistance.current = 0;
  };

  const handleClick = (e) => {
    // 🔒 Blocăm click în StandBy
    if (isStandBy()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // 🔴 FIX: Verifică dacă s-a făcut drag DOAR dacă dragDistance este setat și > threshold
    // Resetăm dragDistance imediat după verificare pentru a permite click-uri rapide
    const wasDragging = isDragging || (dragDistance.current > 10);
    
    if (wasDragging) {
      console.log(`🚫 Table2D - Click blocat (drag detectat): masa ${tableNumber}, dragDistance: ${dragDistance.current}`);
      e.preventDefault();
      e.stopPropagation();
      // Resetăm imediat pentru următorul click
      dragDistance.current = 0;
      setIsDragging(false);
      return;
    }
    
    // Doar dacă nu s-a făcut drag, execută onClick
    if (onClick) {
      console.log(`✅ Table2D - Click pe masă ${tableNumber}, status: "Status"`);
      onClick();
    } else {
      console.warn(`⚠️ Table2D - onClick handler lipsă pentru masa ${tableNumber}`);
    }
  };

  const containerStyle = {
    cursor: isStandBy() ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
    zIndex: isDragging ? 1000 : 10,
    width: '85px',
    height: '85px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isStandBy() ? 0.9 : 1,
    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
    transition: isDragging ? 'none' : 'transform 0.15s ease, z-index 0s',
  };

  return (
    <Draggable
      disabled={isStandBy()}
      defaultPosition={{ x: x, y: y }}
      position={null} // Permite drag liber
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
      handle=".table-2d-draggable-handle"
    >
      <div
        className="table-2d-container"
        style={{
          ...containerStyle,
          position: 'absolute',
        }}
        onClick={handleClick}
      >
      {/* Masă 2D: Doar blat rotund cu gradient premium */}
      <div 
        className={`table-2d-top table-2d-draggable-handle ${isOccupied ? 'table-2d-occupied' : ''}`}
        data-status={status}
        style={{
          width: '85px',
          height: '85px',
          borderRadius: '50%',
          background: color.bg, // Gradient premium
          border: 'none',
          boxShadow: `0 8px 24px ${color.shadow}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%',
          cursor: 'pointer',
          ...(isOccupied && {
            animation: 'pulse-gradient-red 2s ease-in-out infinite'
          })
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.backgroundPosition = '100% 0%';
          e.currentTarget.style.boxShadow = `0 16px 48px ${color.shadow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundPosition = '0% 0%';
          e.currentTarget.style.boxShadow = `0 8px 24px ${color.shadow}`;
        }}
      >
        {/* Pattern subtil pentru carduri */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            pointerEvents: 'none',
            borderRadius: '50%'
          }}
        />
        {/* Place-card luminos pe masă - Rotund */}
        <div
          className="table-2d-place-card"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: color.bg,
            border: `2px solid ${color.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.4rem',
            color: color.text,
            boxShadow: `0 0 16px ${color.glow}, inset 0 2px 4px rgba(255,255,255,0.2)`,
            filter: `drop-shadow(0 0 8px ${color.glow})`,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%',
            transition: 'all 0.3s ease'
          }}
        >
          {tableNumber}
        </div>
      </div>

        {/* Timer pentru mese ocupate */}
        {status === 'occupied' && timer !== null && (
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(255, 193, 7, 0.5)',
              zIndex: 5,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
            title={`Masa ocupată de "Timer" minute`}
          >
            {timer}'
          </div>
        )}

        {/* Shadow sub masă - optimizat pentru dark mode */}
      <div
        className="table-2d-shadow"
        style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95px',
          height: '17px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          filter: 'blur(10px)',
          zIndex: 0
        }}
      />
      </div>
    </Draggable>
  );
};
