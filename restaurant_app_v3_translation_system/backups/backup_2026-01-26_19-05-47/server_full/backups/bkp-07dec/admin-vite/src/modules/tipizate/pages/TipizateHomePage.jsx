// src/modules/tipizate/pages/TipizateHomePage.jsx
// Pagina principală pentru tipizate - Tree View

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./TipizateHomePage.css";

// Verifică dacă CSS-ul se încarcă
console.log("TipizateHomePage component loaded");

// Structura ierarhică a documentelor
const documentTree = [
  {
    id: "nir",
    label: "NIR",
    icon: "fa-file-invoice",
    path: "/tipizate/nir",
    description: "Note de intrare receptie",
    children: []
  },
  {
    id: "bon-consum",
    label: "Bonuri de consum",
    icon: "fa-receipt",
    path: "/tipizate/bon-consum",
    description: "Bonuri de consum stoc",
    children: []
  },
  {
    id: "avize",
    label: "Avize",
    icon: "fa-clipboard-list",
    path: "/tipizate/avize",
    description: "Avize de insotire marfa",
    children: []
  },
  {
    id: "chitante",
    label: "Chitanțe",
    icon: "fa-file-invoice-dollar",
    path: "/tipizate/chitante",
    description: "Chitanțe de încasare",
    children: []
  },
  {
    id: "registru-casa",
    label: "Registru de casă",
    icon: "fa-cash-register",
    path: "/tipizate/registru-casa",
    description: "Registru de casă perioadă",
    children: []
  },
  {
    id: "fisa-magazie",
    label: "Fișă de magazie",
    icon: "fa-warehouse",
    path: "/tipizate/fisa-magazie",
    description: "Fișă magazie pe ingredient",
    children: []
  },
  {
    id: "raport-gestiune",
    label: "Rapoarte de gestiune",
    icon: "fa-chart-bar",
    path: "/tipizate/raport-gestiune",
    description: "Rapoarte gestiune perioadă",
    children: []
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: "fa-exchange-alt",
    path: "/tipizate/transfer",
    description: "Transfer între gestiuni",
    children: []
  },
  {
    id: "inventar",
    label: "Inventar",
    icon: "fa-clipboard-check",
    path: "/tipizate/inventar",
    description: "Inventar de gestiune",
    children: []
  }
];

function TreeNode({ node, level = 0, isActive, onToggle, isExpanded }) {
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 24;

  return (
    <div className="tree-node">
      <div
        className={`tree-node-content ${isActive ? "active" : ""}`}
        style={{ paddingLeft: `${indent}px` }}
      >
        {hasChildren && (
          <button
            className="tree-toggle"
            onClick={() => onToggle(node.id)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <i className={`fas fa-chevron-${isExpanded ? "down" : "right"}`}></i>
          </button>
        )}
        {!hasChildren && <span className="tree-spacer"></span>}
        
        <Link
          to={node.path}
          className="tree-node-link"
          title={node.description}
        >
          {node.icon && (
            <i className={`fas ${node.icon} tree-icon`}></i>
          )}
          <span className="tree-label">{node.label}</span>
          {node.description && (
            <span className="tree-description">{node.description}</span>
          )}
        </Link>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isActive={false}
              onToggle={onToggle}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TipizateHomePage() {
  const location = useLocation();
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isNodeActive = (node) => {
    return location.pathname === node.path;
  };

  return (
    <div className="tipizate-home-page">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">
            <i className="fas fa-file-alt me-2"></i>
            Generează documente tipizate (SAGA-like) pentru gestiune și casierie
          </h2>
        </Card.Header>
        <Card.Body>
          <div className="tree-container">
            {documentTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                isActive={isNodeActive(node)}
                onToggle={toggleNode}
                isExpanded={expandedNodes.has(node.id)}
              />
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
