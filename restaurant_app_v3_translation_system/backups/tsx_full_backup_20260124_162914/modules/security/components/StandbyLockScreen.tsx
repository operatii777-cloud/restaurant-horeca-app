// import { useTranslation } from '@/i18n/I18nContext';
/**
 * Standby Lock Screen Component
 * 
 * Full-screen lock screen for POS/Kiosk terminals
 * Similar to Toast/Lightspeed standby mode
 */

import React, { useState, useEffect, useCallback } from 'react';
import PINNumpad from './PINNumpad';
import './StandbyLockScreen.css';

interface Employee {
  id: number;
  name: string;
  username: string;
  role: string;
  avatarUrl: string | null;
  hasPIN: boolean;
  initials: string;
}

interface StandbyLockScreenProps {
  isLocked: boolean;
  onUnlock: (userId: number, sessionData: any) => void;
  restaurantName?: string;
  logoUrl?: string;
  showClock?: boolean;
}

const StandbyLockScreen: React.FC<StandbyLockScreenProps> = ({
  isLocked,
  onUnlock,
  restaurantName = 'Restaurant App',
  logoUrl = '/assets/logo.png',
  showClock = true
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Update clock every second
  useEffect(() => {
    if (!showClock) return;
    
    const timer = setInterval(() => {
//   const { t } = useTranslation();
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showClock]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/auth/pin/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data.filter((emp: Employee) => emp.hasPIN));
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  }, [pin]);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
    setError('');
  }, []);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && selectedEmployee) {
      handleLogin();
    }
  }, [pin, selectedEmployee]);

  const handleLogin = async () => {
    if (!selectedEmployee || pin.length !== 4) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/pin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedEmployee.id,
          pin: pin
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Success - unlock screen
        onUnlock(selectedEmployee.id, data.data);
        setPin('');
        setSelectedEmployee(null);
      } else {
        setError(data.error || 'Invalid PIN');
        setPin('');
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        if (data.lockedUntil) {
          setError(`Account locked until ${new Date(data.lockedUntil).toLocaleTimeString()}`);
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPin('');
    setError('');
    setAttemptsRemaining(3);
  };

  const handleBack = () => {
    setSelectedEmployee(null);
    setPin('');
    setError('');
  };

  if (!isLocked) return null;

  return (
    <div className="standby-lock-screen">
      {/* Background gradient overlay */}
      <div className="lock-screen-overlay" />
      
      {/* Header with logo and time */}
      <div className="lock-screen-header">
        <div className="lock-screen-branding">
          {logoUrl && <img src={logoUrl} alt={restaurantName} className="lock-screen-logo" />}
          <h1 className="lock-screen-title">{restaurantName}</h1>
        </div>
        
        {showClock && (
          <div className="lock-screen-clock">
            <div className="clock-time">
              {currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="clock-date">
              {currentTime.toLocaleDateString('ro-RO', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lock-screen-content">
        {!selectedEmployee ? (
          /* Employee Selection Grid */
          <div className="employee-selection">
            <h2 className="selection-title">"selecteaza angajatul"</h2>
            <div className="employee-grid">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  className="employee-card"
                  onClick={() => handleEmployeeSelect(emp)}
                >
                  <div className="employee-avatar">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt={emp.name} />
                    ) : (
                      <span className="employee-initials">{emp.initials}</span>
                    )}
                  </div>
                  <span className="employee-name">{emp.name}</span>
                  <span className="employee-role">{emp.role}</span>
                </button>
              ))}
            </div>
            
            {employees.length === 0 && (
              <div className="no-employees">
                <p>"nu exista angajati cu pin configurat"</p>
                <p>"configurati pin ul din setari"</p>
              </div>
            )}
          </div>
        ) : (
          /* PIN Entry */
          <div className="pin-entry-section">
            <button className="back-button" onClick={handleBack}>
              ← Înapoi
            </button>
            
            <div className="selected-employee">
              <div className="employee-avatar large">
                {selectedEmployee.avatarUrl ? (
                  <img src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} />
                ) : (
                  <span className="employee-initials">{selectedEmployee.initials}</span>
                )}
              </div>
              <h3>{selectedEmployee.name}</h3>
              <span className="role-badge">{selectedEmployee.role}</span>
            </div>
            
            <div className="pin-display">
              <div className="pin-dots">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`pin-dot ${i < pin.length ? 'filled' : ''} ${loading ? 'loading' : ''}`}
                  />
                ))}
              </div>
              {error && <div className="pin-error">{error}</div>}
            </div>
            
            <PINNumpad
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onClear={handleClear}
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="lock-screen-footer">
        <span>"powered by restaurant app enterprise"</span>
      </div>
    </div>
  );
};

export default StandbyLockScreen;




