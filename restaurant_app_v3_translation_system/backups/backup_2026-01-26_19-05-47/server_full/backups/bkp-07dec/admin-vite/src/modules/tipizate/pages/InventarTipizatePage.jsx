// src/modules/tipizate/pages/InventarTipizatePage.jsx
// Pagină pentru listarea inventarelor cu buton PDF

import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function InventarTipizatePage() {
  return (
    <div className="p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">
            <i className="fas fa-clipboard-check me-2"></i>
            Inventar de gestiune
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Pentru gestionarea inventarelor, folosește modulul dedicat.
          </div>
          <p className="text-muted mb-3">
            Inventarele de gestiune pot fi gestionate din modulul de stocuri.
          </p>
          <Link to="/stocks/inventory">
            <Button variant="primary">
              <i className="fas fa-arrow-right me-2"></i>
              Accesează modulul Inventar
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}

