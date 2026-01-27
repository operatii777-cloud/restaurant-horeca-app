// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

// src/modules/tipizate/pages/TransferTipizatePage.jsx
// Pagină pentru listarea transferurilor cu buton PDF

import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TransferTipizatePage() {
  return (
    <div className="p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-warning text-dark">
          <h2 className="mb-0">
            <i className="fas fa-exchange-alt me-2"></i>
            Transfer între gestiuni
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-warning">
            <i className="fas fa-info-circle me-2"></i>
            Pentru gestionarea transferurilor, folosește modulul dedicat.
          </div>
          <p className="text-muted mb-3">
            Transferurile între gestiuni pot fi gestionate din modulul de stocuri.
          </p>
          <Link to="/stocks/transfer">
            <Button variant="primary">
              <i className="fas fa-arrow-right me-2"></i>
              Accesează modulul Transfer
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}

