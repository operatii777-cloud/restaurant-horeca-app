/**
 * Security Module Exports
 * 
 * PIN Authentication, Lock Screen, Auto-Lock
 */

// Components
export { default as PINNumpad } from './components/PINNumpad';
export { default as StandbyLockScreen } from './components/StandbyLockScreen';

// Hooks
export { useAutoLock } from './hooks/useAutoLock';

// Types
export interface Employee {
  id: number;
  name: string;
  username: string;
  role: string;
  avatarUrl: string | null;
  hasPIN: boolean;
  initials: string;
}

export interface PINLoginResponse {
  success: boolean;
  data?: {
    user: {
      id: number;
      name: string;
      username: string;
      role: string;
    };
    sessionToken: string;
    loginMethod: string;
    loginTime: string;
  };
  error?: string;
  attemptsRemaining?: number;
  lockedUntil?: string;
}

