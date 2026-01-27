// src/components/T.tsx
// Workaround temporar pentru a opri erorile

import React from 'react';

interface TProps {
  children: React.ReactNode;
}

/**
 * Component temporar care returnează direct conținutul
 * fără a face traduceri
 */
export function T({ children }: TProps) {
  // Returnează direct textul, fără traducere
  return <>{children}</>;
}

export default T;
