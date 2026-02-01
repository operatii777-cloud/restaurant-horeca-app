import React from 'react';

export default function KioskInventarIframePage() {
  return (
    <div style={{width: '100%', height: '100%', minHeight: '80vh', background: '#fff'}}>
      <iframe
        src="http://localhost:3001/admin-advanced.html#inventory"
        title="Inventar Admin Advanced"
        style={{width: '100%', height: '80vh', border: 'none'}}
        allowFullScreen
      />
    </div>
  );
}
