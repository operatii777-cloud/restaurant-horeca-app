// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

// src/modules/tipizate/pages/AvizeTipizatePage.jsx
// Pagină pentru listarea avizelor cu buton PDF

import React from "react";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AvizeTipizatePage() {
  return (
    <div className="p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <h2 className="mb-0">
            <i className="fas fa-clipboard-list me-2"></i>
            Avize de însoțire marfă
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Funcționalitatea pentru avize este în dezvoltare.
          </div>
          <p className="text-muted">
            Aici vor fi listate avizele de însoțire marfă generate în sistem.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

