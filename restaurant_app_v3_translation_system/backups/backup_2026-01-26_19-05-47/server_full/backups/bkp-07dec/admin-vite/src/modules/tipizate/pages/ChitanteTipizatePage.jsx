// src/modules/tipizate/pages/ChitanteTipizatePage.jsx
// Pagină pentru listarea chitanțelor cu buton PDF

import React from "react";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ChitanteTipizatePage() {
  return (
    <div className="p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <h2 className="mb-0">
            <i className="fas fa-file-invoice-dollar me-2"></i>
            Chitanțe de încasare
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Funcționalitatea pentru chitanțe este în dezvoltare.
          </div>
          <p className="text-muted">
            Aici vor fi listate chitanțele de încasare generate în sistem.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

