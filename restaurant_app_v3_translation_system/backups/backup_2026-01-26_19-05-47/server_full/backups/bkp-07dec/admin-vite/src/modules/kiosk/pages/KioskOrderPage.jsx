import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Form, InputGroup, Badge, Alert, Offcanvas } from 'react-bootstrap';
import { getProducts, getOrder, updateOrder, createOrder, checkKioskSession, claimOrder, getOrderByTable } from '../api/KioskApi';
import { useKioskCart } from '../hooks/useKioskCart';
import { KioskCartModal } from '../components/KioskCartModal';
import { KioskCartSidebar } from '../components/KioskCartSidebar';
import { KioskTransferTableModal } from '../components/KioskTransferTableModal';
import { KioskMergeTablesModal } from '../components/KioskMergeTablesModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../kiosk.css';

const QUICK_NOTES = [
  'Fără ceapă',
  'Extra sos',
  'Fără sare',
  'Picant',
  'Fără gluten',
  'Vegetarian',
  'Vegan',
];

export const KioskOrderPage = () => {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  
  // 🟢 KIOSK: Redirecționează către comanda-supervisor11.html
  useEffect(() => {
    console.log('🔄 KioskOrderPage - Început redirect către comanda-supervisor11.html');
    console.log('🔄 KioskOrderPage - tableId:', tableId, 'orderId:', orderId);
    
    const url = `/comanda-supervisor11.html?kiosk=true&table=${tableId}${orderId ? `&order_id=${orderId}` : ''}`;
    console.log('🔄 KioskOrderPage - Redirect la:', url);
    
    // 🟢 FIX: Folosim window.location.href în loc de replace pentru a permite navigare normală
    // Adăugăm și timestamp pentru a forța reîncărcarea paginii
    const urlWithCacheBust = `${url}&_t=${Date.now()}`;
    window.location.href = urlWithCacheBust;
  }, [tableId, orderId]);
  
  // Nu randează nimic, doar redirecționează
  return null;
};
