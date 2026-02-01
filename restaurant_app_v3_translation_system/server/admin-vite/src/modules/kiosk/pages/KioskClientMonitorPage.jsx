import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Volume2, VolumeX, Maximize, Minimize, ChefHat, Wine } from 'lucide-react';
import './KioskClientMonitorPage.css';

/**
 * Monitor Clienți - Display public pentru comenzi
 * Afișează comenzile "În Lucru" și "Gata de Livrare"
 * Centralizator live bucătărie + bar
 * Design inspirat din HorecaAI QueueMonitor
 */
const KioskClientMonitorPage = () => {
  const [inProgress, setInProgress] = useState([]);
  const [ready, setReady] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [flashingOrders, setFlashingOrders] = useState([]);
  const [lastReadyCount, setLastReadyCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const audioRef = useRef(null);

  // Fetch orders every 3 seconds
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders-display/client-monitor');
        if (res.ok) {
          const data = await res.json();
          setInProgress(data.inProgress || []);

          // Check for new ready orders
          const newReady = data.ready || [];
          if (newReady.length > lastReadyCount && lastReadyCount > 0) {
            // New orders are ready - trigger flash and sound
            const newOrderNumbers = newReady
              .slice(0, newReady.length - lastReadyCount)
              .map(o => o.orderNumber);

            setFlashingOrders(newOrderNumbers);

            if (audioEnabled) {
              playNotificationSound();
            }

            // Remove flash after 5 seconds
            setTimeout(() => setFlashingOrders([]), 5000);
          }

          setReady(newReady);
          setLastReadyCount(newReady.length);
        }
      } catch (err) {
        console.error('Eroare fetch client-monitor:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [audioEnabled, lastReadyCount]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playNotificationSound = () => {
    try {
      // Use Web Audio API for notification
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio notification blocked:', e);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  const getWaitTime = (timestamp) => {
    if (!timestamp) return 0;
    const start = new Date(timestamp).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 60000); // minutes
  };

  return (
    <div className="client-monitor">
      {/* Controls overlay */}
      <div className="client-monitor__controls">
        <div className="client-monitor__time">
          {currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="client-monitor__control-btn"
          title={audioEnabled ? 'Dezactivează sunet' : 'Activează sunet'}
        >
          {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
        <button
          onClick={toggleFullScreen}
          className="client-monitor__control-btn"
          title="Fullscreen"
        >
          {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </div>

      <div className="client-monitor__content">
        {/* În Lucru Column (Left) */}
        <div className="client-monitor__column client-monitor__column--progress">
          <div className="client-monitor__header client-monitor__header--progress">
            <Clock className="client-monitor__icon client-monitor__icon--spin" size={48} />
            <h1 className="client-monitor__title">ÎN LUCRU</h1>
            <span className="client-monitor__count">{inProgress.length}</span>
          </div>

          <div className="client-monitor__orders client-monitor__orders--compact">
            {inProgress.length === 0 ? (
              <div className="client-monitor__empty">
                <span>Nicio comandă în preparare</span>
              </div>
            ) : (
              <div className="client-monitor__number-list">
                {inProgress.map((order, idx) => (
                  <span
                    key={order.id}
                    className="client-monitor__number-badge client-monitor__number-badge--progress"
                    title={`${order.type === 'delivery' ? 'Delivery' : order.type === 'takeaway' ? 'Takeaway' : 'Masa ' + order.tableNumber} - ${getWaitTime(order.timestamp)} min`}
                  >
                    {order.orderNumber}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gata de Livrare Column (Right) */}
        <div className="client-monitor__column client-monitor__column--ready">
          <div className="client-monitor__header client-monitor__header--ready">
            <CheckCircle className="client-monitor__icon" size={56} />
            <h1 className="client-monitor__title client-monitor__title--glow">GATA DE LIVRARE</h1>
            <span className="client-monitor__count client-monitor__count--ready">{ready.length}</span>
          </div>

          <div className="client-monitor__orders client-monitor__orders--compact client-monitor__orders--ready">
            {ready.length === 0 ? (
              <div className="client-monitor__empty client-monitor__empty--ready">
                <span>PREGĂTIM</span>
                <span>BUNĂTĂȚI</span>
              </div>
            ) : (
              <div className="client-monitor__number-list client-monitor__number-list--ready">
                {ready.map((order, idx) => {
                  const isFlashing = flashingOrders.includes(order.orderNumber);
                  return (
                    <span
                      key={order.id}
                      className={`client-monitor__number-badge client-monitor__number-badge--ready ${isFlashing ? 'client-monitor__number-badge--flash' : ''}`}
                      title={order.type === 'delivery' ? 'Delivery' : order.type === 'takeaway' ? 'Takeaway' : 'Masa ' + order.tableNumber}
                    >
                      {order.orderNumber}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="client-monitor__footer">
        VĂ RUGĂM PĂSTRAȚI BONUL PENTRU RIDICAREA COMENZII
      </div>
    </div>
  );
};

export { KioskClientMonitorPage };
export default KioskClientMonitorPage;

