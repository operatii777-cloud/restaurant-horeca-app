/**
 * FAZA 1 - SplitBill Component (Generic)
 * 
 * UI real pentru split nota:
 * - pe persoane
 * - pe sume
 * - pe articole
 * 
 * Expune callback onSplitChange(splitPayload) cu structură clară pentru POS
 */

import React, { useState, useMemo } from 'react';
import { Button, Form, Badge } from 'react-bootstrap';
import './SplitBill.css';

/**
 * @typedef {Object} SplitGroup
 * @property {string} id - Unique group ID
 * @property {string} label - Group name (e.g., "Persoana 1", "Grup A")
 * @property {number} total - Total amount for this group
 * @property {Array<Object>} items - Items assigned to this group
 */

/**
 * @typedef {Object} SplitPayload
 * @property {Array<SplitGroup>} groups - Groups with assigned items
 * @property {Array<Object>} unassigned - Items not yet assigned to any group
 */

/**
 * @param {Object} props
 * @param {number} props.total - Total bill amount
 * @param {Array<Object>} props.items - Order items (should have: productId, name, qty, unitPrice, total)
 * @param {Function} props.onSplit - Callback when split is applied (receives SplitPayload)
 * @param {Function} props.onSplitChange - Callback when split changes (receives SplitPayload)
 */
export default function SplitBill({ total, items = [], onSplit, onSplitChange }) {
  const [groups, setGroups] = useState([
    { id: 'group-1', label: 'Persoana 1', items: [] },
  ]);
  const [nextGroupId, setNextGroupId] = useState(2);
  const [splitMode, setSplitMode] = useState<'items' | 'amounts'>('items');

  // Calculate totals for each group
  const groupsWithTotals = useMemo(() => {
    return groups.map((group) => {
      const groupTotal = group.items.reduce((sum, item) => {
        const itemData = items.find((i) => i.productId === item.productId);
        if (!itemData) return sum;
        return sum + (itemData.total * (item.percentage || 1));
      }, 0);
      return { ...group, total: groupTotal };
    });
  }, [groups, items]);

  // Unassigned items
  const unassignedItems = useMemo(() => {
    const assignedItemIds = new Set();
    groups.forEach((group) => {
      group.items.forEach((item) => {
        assignedItemIds.add(item.productId);
      });
    });
    return items.filter((item) => !assignedItemIds.has(item.productId));
  }, [items, groups]);

  // Total assigned
  const totalAssigned = useMemo(() => {
    return groupsWithTotals.reduce((sum, group) => sum + group.total, 0);
  }, [groupsWithTotals]);

  // Generate split payload
  const generateSplitPayload = () => {
    return {
      groups: groupsWithTotals.map((group) => ({
        id: group.id,
        label: group.label,
        total: group.total,
        items: group.items.map((item) => {
          const itemData = items.find((i) => i.productId === item.productId);
          return {
            productId: item.productId,
            name: itemData?.name || '',
            qty: itemData?.qty || 0,
            unitPrice: itemData?.unitPrice || 0,
            total: itemData ? itemData.total * (item.percentage || 1) : 0,
            percentage: item.percentage || 1,
          };
        }),
      })),
      unassigned: unassignedItems,
    };
  };

  // Add new group
  const handleAddGroup = () => {
    const newGroup = {
      id: `group-${nextGroupId}`,
      label: `Persoana ${nextGroupId}`,
      items: [],
    };
    setGroups([...groups, newGroup]);
    setNextGroupId(nextGroupId + 1);
  };

  // Remove group
  const handleRemoveGroup = (groupId) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  // Update group label
  const handleUpdateGroupLabel = (groupId, newLabel) => {
    setGroups(
      groups.map((g) => (g.id === groupId ? { ...g, label: newLabel } : g))
    );
  };

  // Assign item to group
  const handleAssignItem = (item, groupId) => {
    setGroups(
      groups.map((g) => {
        if (g.id === groupId) {
          // Check if item already exists in this group
          const existingIndex = g.items.findIndex(
            (i) => i.productId === item.productId
          );
          if (existingIndex >= 0) {
            // Update existing
            const updated = [...g.items];
            updated[existingIndex] = { ...item, percentage: 1 };
            return { ...g, items: updated };
          } else {
            // Add new
            return {
              ...g,
              items: [...g.items, { productId: item.productId, percentage: 1 }],
            };
          }
        }
        // Remove from other groups
        return {
          ...g,
          items: g.items.filter((i) => i.productId !== item.productId),
        };
      })
    );
    
    // Notify parent
    if (onSplitChange) {
      onSplitChange(generateSplitPayload());
    }
  };

  // Remove item from group
  const handleRemoveItemFromGroup = (groupId, productId) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.filter((i) => i.productId !== productId) }
          : g
      )
    );
    
    // Notify parent
    if (onSplitChange) {
      onSplitChange(generateSplitPayload());
    }
  };

  // Update item percentage in group
  const handleUpdateItemPercentage = (groupId, productId, percentage) => {
    const clampedPercentage = Math.max(0, Math.min(1, percentage));
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: g.items.map((i) =>
                i.productId === productId
                  ? { ...i, percentage: clampedPercentage }
                  : i
              ),
            }
          : g
      )
    );
    
    // Notify parent
    if (onSplitChange) {
      onSplitChange(generateSplitPayload());
    }
  };

  // Apply split
  const handleApplySplit = () => {
    const payload = generateSplitPayload();
    if (onSplit) {
      onSplit(payload);
    }
    if (onSplitChange) {
      onSplitChange(payload);
    }
  };

  return (
    <div className="split-bill">
      <div className="split-bill-header">
        <h4>Split Bill</h4>
        <div className="split-bill-total">
          Total: <strong>{Number(total || 0).toFixed(2)} RON</strong>
        </div>
      </div>

      {/* Split Mode Selector */}
      <div className="split-bill-mode">
        <Form.Check
          type="radio"
          label="Pe Articole"
          checked={splitMode === 'items'}
          onChange={() => setSplitMode('items')}
        />
        <Form.Check
          type="radio"
          label="Pe Sume"
          checked={splitMode === 'amounts'}
          onChange={() => setSplitMode('amounts')}
        />
      </div>

      {/* Groups */}
      <div className="split-bill-groups">
        {groupsWithTotals.map((group) => (
          <div key={group.id} className="split-bill-group">
            <div className="split-bill-group-header">
              <Form.Control
                type="text"
                value={group.label}
                onChange={(e) => handleUpdateGroupLabel(group.id, e.target.value)}
                placeholder="Nume grup/persoană"
                style={{ width: 'auto', flex: 1, marginRight: '8px' }}
              />
              <Badge bg="primary">
                {group.total.toFixed(2)} RON
              </Badge>
              {groups.length > 1 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveGroup(group.id)}
                >
                  <i className="fas fa-trash"></i>
                </Button>
              )}
            </div>

            {/* Items in this group */}
            <div className="split-bill-group-items">
              {group.items.length === 0 ? (
                <p className="text-muted small">Nu sunt articole alocate</p>
              ) : (
                group.items.map((item) => {
                  const itemData = items.find((i) => i.productId === item.productId);
                  if (!itemData) return null;
                  
                  const itemTotal = itemData.total * (item.percentage || 1);
                  
                  return (
                    <div key={item.productId} className="split-bill-group-item">
                      <div className="split-bill-item-info">
                        <span className="split-bill-item-name">{itemData.name}</span>
                        <span className="split-bill-item-qty">
                          {itemData.qty}× {itemData.unitPrice.toFixed(2)} RON
                        </span>
                      </div>
                      {splitMode === 'items' ? (
                        <div className="split-bill-item-actions">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={item.percentage || 1}
                            onChange={(e) =>
                              handleUpdateItemPercentage(
                                group.id,
                                item.productId,
                                parseFloat(e.target.value)
                              )
                            }
                            style={{ width: '100px' }}
                          />
                          <span className="split-bill-item-percentage">
                            {Math.round((item.percentage || 1) * 100)}%
                          </span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItemFromGroup(group.id, item.productId)}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      ) : (
                        <div className="split-bill-item-amount">
                          <Form.Control
                            type="number"
                            min="0"
                            max={itemData.total}
                            step="0.01"
                            value={itemTotal.toFixed(2)}
                            onChange={(e) => {
                              const amount = parseFloat(e.target.value) || 0;
                              const percentage = amount / itemData.total;
                              handleUpdateItemPercentage(
                                group.id,
                                item.productId,
                                percentage
                              );
                            }}
                            style={{ width: '100px' }}
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItemFromGroup(group.id, item.productId)}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      )}
                      <div className="split-bill-item-total">
                        {itemTotal.toFixed(2)} RON
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned Items */}
      {unassignedItems.length > 0 && (
        <div className="split-bill-unassigned">
          <h5>Articole Nealocate</h5>
          <div className="split-bill-unassigned-list">
            {unassignedItems.map((item) => (
              <div key={item.productId} className="split-bill-unassigned-item">
                <span>{item.name}</span>
                <span>{item.total.toFixed(2)} RON</span>
                <div className="split-bill-assign-buttons">
                  {groups.map((group) => (
                    <Button
                      key={group.id}
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleAssignItem(item, group.id)}
                    >
                      → {group.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="split-bill-summary">
        <div className="split-bill-summary-row">
          <span>Total Alocat:</span>
          <span>{totalAssigned.toFixed(2)} RON</span>
        </div>
        <div className="split-bill-summary-row">
          <span>Total Nealocat:</span>
          <span>
            {(total - totalAssigned).toFixed(2)} RON
          </span>
        </div>
        {Math.abs(total - totalAssigned) > 0.01 && (
          <div className="split-bill-summary-warning">
            ⚠️ Diferență: {Math.abs(total - totalAssigned).toFixed(2)} RON
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="split-bill-actions">
        <Button variant="outline-secondary" onClick={handleAddGroup}>
          <i className="fas fa-plus me-1"></i>
          Adaugă Grup
        </Button>
        <Button
          variant="primary"
          onClick={handleApplySplit}
          disabled={Math.abs(total - totalAssigned) > 0.01}
        >
          Aplică Split
        </Button>
      </div>
    </div>
  );
}
