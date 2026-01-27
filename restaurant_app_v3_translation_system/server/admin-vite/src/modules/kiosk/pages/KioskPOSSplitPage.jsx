import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { 
  ShoppingCart, Send, CreditCard, Trash2, Plus, Minus, 
  ChefHat, Wine, RefreshCw, Users, Clock, Search,
  X, Check, ArrowLeft, Utensils, Bike, Car, Home, 
  UserPlus, UserMinus, Settings, Package, LogOut
} from 'lucide-react';
import { 
  getProducts, getTablesStatus, createOrder, updateOrder, 
  getOrderByTable, processPayment, checkKioskSession 
} from '../api/KioskApi';
import { useKioskTheme } from '../context/KioskThemeContext';
import { useKioskLoginModal } from '../context/KioskLoginModalContext';
import { Table2D } from '../components/Table2D';
import { useTablesPositions } from '../hooks/useTablesPositions';
import { KioskPaymentsModal } from '../components/KioskPaymentsModal';
import { useHappyHour } from '../hooks/useHappyHour';
import './KioskPOSSplitPage.css';

/**
 * KioskPOSSplitPage - POS Split Screen Enterprise
 * Layout: Stânga = Mese/Produse | Dreapta = Coș Comandă
 */
const TOTAL_TABLES = 30;

export const KioskPOSSplitPage = () => {
  const navigate = useNavigate();
  const { theme } = useKioskTheme();
  const { openLoginModal } = useKioskLoginModal();
  
  // Session
  const [session, setSession] = useState(null);
  
  // Tables State - FIX: Inițializăm cu tabele default IMEDIAT pentru render instant
  const [tables, setTables] = useState(() => {
    // Generează tabele default imediat pentru render instant
    const defaultTables = [];
    for (let i = 1; i <= TOTAL_TABLES; i++) {
      defaultTables.push({
        number: i,
        status: 'free',
        order_id: null,
        timer: null,
        total: 0,
      });
    }
    return defaultTables;
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const { positions, loading: positionsLoading, updatePosition } = useTablesPositions(TOTAL_TABLES);
  
  // Products State - FIX: Inițializăm cu array-uri goale (nu mai blocăm)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Order State
  const [cartItems, setCartItems] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  
  // Order Options
  const [orderType, setOrderType] = useState('dine-in');
  const [orderMode, setOrderMode] = useState('together');
  const [deliveryType, setDeliveryType] = useState('here');
  
  // Split Bill State
  const [splitBillGroups, setSplitBillGroups] = useState([]);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [activeSplitGroup, setActiveSplitGroup] = useState(null);
  
  // Modifiers Modal
  const [showModifiersModal, setShowModifiersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [itemNotes, setItemNotes] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  
  // Daily Offer & Menu State
  const [dailyOffer, setDailyOffer] = useState(null);
  const [dailyMenu, setDailyMenu] = useState(null);
  const [dailyMenuData, setDailyMenuData] = useState(null); // Full daily menu data (soup + mainCourse)
  const [showDailyOfferModal, setShowDailyOfferModal] = useState(false);
  const [showDailyMenuModal, setShowDailyMenuModal] = useState(false);
  const [currentDailyOfferData, setCurrentDailyOfferData] = useState(null);
  const [dailyOfferSelections, setDailyOfferSelections] = useState({ conditions: [], benefits: [] });
  
  // Order Notes Modal
  const [showOrderNotesModal, setShowOrderNotesModal] = useState(false);
  const [orderFoodNotes, setOrderFoodNotes] = useState('');
  const [orderDrinkNotes, setOrderDrinkNotes] = useState('');
  const [orderGeneralNotes, setOrderGeneralNotes] = useState('');
  
  // UI State - FIX: Nu mai folosim loading global
  const [productsLoading, setProductsLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [viewMode, setViewMode] = useState('tables');
  
  // Check session
  useEffect(() => {
    const currentSession = checkKioskSession();
    setSession(currentSession);
  }, []);

  // Load products and categories - FIX: Loading separat pentru produse
  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const productsData = await getProducts();
      
      if (Array.isArray(productsData)) {
        setProducts(productsData);
        
        // Extract unique categories
        const allAvailableCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
        
        // Ordinea fixă de categorii conform cerințelor
        // 1. Oferta Zilei (va fi adăugată dacă există)
        // 2. Meniul Zilei (va fi adăugată întotdeauna)
        // 3. Băuturi
        // 4. Categorii pentru mâncare
        // 5. Salate
        // 6. Deserturi
        // 7. Sosuri și Pâine
        
        const orderedCategories = [
          'Băuturi și Coctailuri',
          'Cafea/Ciocolată/Ceai',
          'Răcoritoare',
          'Băuturi Spirtoase',
          'Coctailuri Non-Alcoolice',
          'Vinuri',
          'Aperitive Calde',
          'Aperitive Reci',
          'Ciorbe',
          'Fel Principal',
          'Paste',
          'Pizza',
          'Peste și Fructe de Mare',
          'Fast Food',
          'Garnituri',
          'Mic Dejun',
          'Salate',
          'Salate Însoțitoare',
          'Deserturi',
          'Sosuri și Pâine'
        ];
        
        // Verifică dacă există Oferta Zilei și Meniul Zilei
        const specialCategories = [];
        
        // Verifică Oferta Zilei
        try {
          const offerResponse = await fetch('/api/daily-offer');
          if (offerResponse.ok) {
            const offerData = await offerResponse.json();
            if (offerData.offer && offerData.offer.id) {
              specialCategories.push('Oferta Zilei');
              setDailyOffer(offerData.offer);
            }
          }
        } catch (err) {
          console.log('No daily offer available');
        }
        
        // Verifică Meniul Zilei
        try {
          const menuResponse = await fetch('/api/daily-menu');
          if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            if (menuData && menuData.id) {
              setDailyMenu(menuData);
            }
          }
        } catch (err) {
          console.log('No daily menu available');
        }
        
        // Adaugă Meniul Zilei întotdeauna
        specialCategories.push('Meniul Zilei');
        
        // Combine special categories with ordered categories
        const finalCategories = [
          ...specialCategories, // Special categories first
          ...orderedCategories.filter(cat => 
            allAvailableCategories.includes(cat) && !specialCategories.includes(cat)
          ), // Ordered categories (only if they exist)
          ...allAvailableCategories.filter(cat => 
            !specialCategories.includes(cat) && !orderedCategories.includes(cat)
          ) // Rest of categories (sorted alphabetically)
        ];
        
        // Elimină duplicatele
        const uniqueCategories = Array.from(new Set(finalCategories));
        
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(uniqueCategories[0]);
        }
      } else {
        console.warn('⚠️ getProducts returned non-array:', productsData);
        setProducts([]);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
      setCategories([]);
      console.warn('⚠️ Produsele nu s-au încărcat, dar continuăm');
    } finally {
      setProductsLoading(false);
    }
  }, [selectedCategory]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load tables status - FIX: Loading separat și timeout
  const loadTablesStatus = useCallback(async () => {
    try {
      setTablesLoading(true);
      
      // Timeout pentru request - max 5 secunde
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading tables')), 5000)
      );
      
      const tablesData = await Promise.race([
        getTablesStatus(),
        timeoutPromise
      ]);
      
      // Asigură-te că tablesData este un array
      if (!Array.isArray(tablesData)) {
        console.warn('⚠️ getTablesStatus returned non-array:', tablesData);
        throw new Error('Invalid tables data format');
      }
      
      const allTables = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        const tableData = tablesData.find((t) => t.number === i || t.table_number === i);
        allTables.push({
          number: i,
          status: tableData?.status || 'free',
          order_id: tableData?.order_id || null,
          timer: tableData?.timer || null,
          total: tableData?.total || 0,
        });
      }
      setTables(allTables);
    } catch (err) {
      console.error('Error loading tables:', err);
      // Set empty tables on error - PAGINA TREBUIE SĂ SE RANDEZE
      const emptyTables = [];
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        emptyTables.push({
          number: i,
          status: 'free',
          order_id: null,
          timer: null,
          total: 0,
        });
      }
      setTables(emptyTables);
    } finally {
      setTablesLoading(false);
    }
  }, []);

  // Load tables on mount and refresh every 10 seconds
  useEffect(() => {
    loadTablesStatus(); // Load immediately on mount
    const interval = setInterval(loadTablesStatus, 10000);
    return () => clearInterval(interval);
  }, [loadTablesStatus]);

  // Handle table move
  const handleTableMove = useCallback((tableNumber, newX, newY) => {
    updatePosition(tableNumber, newX, newY);
  }, [updatePosition]);

  // Handle table selection
  const handleTableSelect = useCallback(async (table) => {
    console.log(`🔍 handleTableSelect apelat pentru masa ${table.number}, status: ${table.status}, session:`, session);
    
    if (!session) {
      console.warn('⚠️ Nu există sesiune, deschid modal de login');
      openLoginModal();
      return;
    }
    
    console.log(`✅ Selectez masa ${table.number}, trec la modul products`);
    setSelectedTable(table);
    setViewMode('products');
    setCartItems([]);
    
    if (table.status === 'occupied' && table.order_id) {
      console.log(`📦 Masa ${table.number} este ocupată, încarc comanda ${table.order_id}`);
      try {
        const orderData = await getOrderByTable(table.number);
        if (orderData) {
          setActiveOrder(orderData);
          let items = [];
          if (orderData.items) {
            if (typeof orderData.items === 'string') {
              try {
                items = JSON.parse(orderData.items);
              } catch (e) {
                console.warn('Error parsing order items:', e);
                items = [];
              }
            } else if (Array.isArray(orderData.items)) {
              items = orderData.items;
            }
          }
          setCartItems(items);
          console.log(`✅ Comanda încărcată: ${items.length} items`);
        } else {
          setActiveOrder(null);
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setActiveOrder(null);
        setCartItems([]);
      }
    } else {
      console.log(`🆕 Masa ${table.number} este liberă, pregătesc pentru comandă nouă`);
      setActiveOrder(null);
    }
  }, [session, openLoginModal]);

  // Back to tables
  const handleBackToTables = () => {
    setSelectedTable(null);
    setViewMode('tables');
    setCartItems([]);
    setActiveOrder(null);
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    navigate('/kiosk/dashboard');
  };

  // Click pe produs - deschide modal dacă are opțiuni, altfel adaugă direct
  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedModifiers([]);
    setItemNotes('');
    
    // Dacă produsul are opțiuni, deschide modalul
    if (product.customizations && product.customizations.length > 0) {
      setShowModifiersModal(true);
    } else {
      // Fără opțiuni - adaugă direct în coș
      addProductToCart(product, [], '');
    }
  }, []);

  // Adaugă produs în coș (folosit din modal și direct)
  const addProductToCart = useCallback((product, modifiers, notes) => {
    const modifierTotal = modifiers.reduce((sum, m) => sum + (m.extra_price || 0), 0);
    const finalPrice = product.price + modifierTotal;
    
    setCartItems(prev => [...prev, {
      itemId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      basePrice: product.price,
      quantity: 1,
      station: product.station || 'kitchen',
      status: 'pending',
      customizations: modifiers,
      notes: notes
    }]);
  }, []);

  // Confirmă și adaugă în coș din modal
  const handleAddToCart = useCallback(() => {
    if (selectedProduct) {
      addProductToCart(selectedProduct, selectedModifiers, itemNotes);
      setShowModifiersModal(false);
      setSelectedProduct(null);
      setSelectedModifiers([]);
      setItemNotes('');
    }
  }, [selectedProduct, selectedModifiers, itemNotes, addProductToCart]);

  // Selectează/deselectează opțiune
  const handleToggleOption = useCallback((option) => {
    console.log('🔘 CLICK pe opțiune:', option.option_name, option.id);
    setSelectedModifiers(prev => {
      const exists = prev.find(m => m.id === option.id);
      console.log('🔘 Există deja?', !!exists, 'Lista curentă:', prev.length);
      const newList = exists 
        ? prev.filter(m => m.id !== option.id)
        : [...prev, option];
      console.log('🔘 Noua listă:', newList.length);
      return newList;
    });
  }, []);

  // Update quantity
  const updateQuantity = useCallback((itemId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.itemId === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.itemId !== itemId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Handle adding offer items to cart
  const handleAddOfferToCart = useCallback(() => {
    if (!currentDailyOfferData) return;

    let isValid = true;

    // Validate condition selections
    dailyOfferSelections.conditions.forEach((selection, index) => {
      if (!selection.productId) {
        isValid = false;
      }
    });

    // Validate benefit selections
    dailyOfferSelections.benefits.forEach((selection, index) => {
      if (!selection.productId) {
        isValid = false;
      }
    });

    if (!isValid) {
      alert('Te rugăm să selectezi toate produsele pentru a beneficia de ofertă.');
      return;
    }

    // Add condition products (with normal price)
    dailyOfferSelections.conditions.forEach((selection) => {
      const condition = currentDailyOfferData.conditions[selection.conditionIndex];
      const product = condition?.products?.find(p => p.id === selection.productId);
      if (product) {
        // Direct add to cart to avoid modal loop issues
        addProductToCart(product, [], '');
      }
    });

    // Add benefit products (free)
    dailyOfferSelections.benefits.forEach((selection) => {
      const product = currentDailyOfferData.benefit_products?.find(p => p.id === selection.productId);
      if (product) {
        // Add as free item (price 0)
        const freeProduct = { ...product, price: 0 };
        addProductToCart(freeProduct, [], '');
      }
    });

    alert('Oferta a fost adăugată cu succes în coș!');
    // Reset selections so user can add the offer again if needed
    setDailyOfferSelections(prev => {
      const newConditions = prev.conditions.map(sel => ({ ...sel, productId: null }));
      const newBenefits = prev.benefits.map(sel => ({ productId: null }));
      return { conditions: newConditions, benefits: newBenefits };
    });
  }, [currentDailyOfferData, dailyOfferSelections, handleProductClick]);

  // Handle condition selection change
  const handleConditionSelectionChange = useCallback((globalIndex, productId) => {
    setDailyOfferSelections(prev => ({
      ...prev,
      conditions: prev.conditions.map((sel) => 
        sel.globalIndex === globalIndex ? { ...sel, productId: productId ? parseInt(productId) : null } : sel
      )
    }));
  }, []);

  // Handle benefit selection change
  const handleBenefitSelectionChange = useCallback((selectionIndex, productId) => {
    setDailyOfferSelections(prev => ({
      ...prev,
      benefits: prev.benefits.map((sel, idx) => 
        idx === selectionIndex ? { productId: productId ? parseInt(productId) : null } : sel
      )
    }));
  }, []);

  // Totals
  // Happy Hour hook
  const { activeHappyHour, discounts, calculateDiscounts } = useHappyHour();
  
  // Debug Happy Hour - verifică dacă se încarcă corect
  useEffect(() => {
    console.log('🎉 [POS] Happy Hour Status:', {
      activeHappyHour,
      active: activeHappyHour?.active,
      settings: activeHappyHour?.settings,
      settingsLength: activeHappyHour?.settings?.length,
      hasSettings: activeHappyHour?.settings && activeHappyHour.settings.length > 0,
      shouldDisplay: activeHappyHour && activeHappyHour.active === true && activeHappyHour.settings && activeHappyHour.settings.length > 0
    });
    
    // Test API call
    if (!activeHappyHour) {
      fetch('/api/happyhour/active')
        .then(res => res.json())
        .then(data => {
          console.log('🔍 [POS] Direct API call result:', data);
        })
        .catch(err => console.error('❌ [POS] API call error:', err));
    }
  }, [activeHappyHour]);

  // Calculate Happy Hour discounts when cart items change
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const cartItemsForDiscount = cartItems.map(item => ({
        productId: item.productId,
        finalPrice: item.price + (item.customizations?.reduce((sum, c) => sum + (c.extra_price || 0), 0) || 0),
        quantity: item.quantity,
        isFree: item.is_free || false
      }));
      calculateDiscounts(cartItemsForDiscount);
    } else {
      calculateDiscounts([]);
    }
  }, [cartItems, calculateDiscounts]);

  const totals = useMemo(() => {
    let subtotal = cartItems.reduce((sum, item) => {
      const itemPrice = item.price + (item.customizations?.reduce((sum, c) => sum + (c.extra_price || 0), 0) || 0);
      if (!item.is_free) {
        return sum + (itemPrice * item.quantity);
      }
      return sum;
    }, 0);

    // Apply Happy Hour discounts
    let happyHourDiscount = 0;
    if (discounts && discounts.hasDiscount && discounts.items.length > 0) {
      cartItems.forEach((item, index) => {
        const discountItem = discounts.items[index];
        if (discountItem && !item.is_free) {
          happyHourDiscount += discountItem.discount * item.quantity;
        }
      });
    }

    // Apply Daily Menu discount
    let dailyMenuDiscount = 0;
    if (dailyMenuData && dailyMenuData.discount) {
      const dailyMenuItems = cartItems.filter(item => item.isDailyMenu);
      if (dailyMenuItems.length > 0) {
        // Count pairs of soup + main course
        const soupItems = dailyMenuItems.filter(item => item.dailyMenuType === 'soup');
        const mainCourseItems = dailyMenuItems.filter(item => item.dailyMenuType === 'mainCourse');
        const soupQuantity = soupItems.reduce((sum, item) => sum + item.quantity, 0);
        const mainCourseQuantity = mainCourseItems.reduce((sum, item) => sum + item.quantity, 0);
        const menuPairs = Math.min(soupQuantity, mainCourseQuantity);
        // Apply discount for each pair
        dailyMenuDiscount = dailyMenuData.discount * menuPairs;
      }
    }

    const discountedSubtotal = subtotal - happyHourDiscount - dailyMenuDiscount;
    return {
      subtotal: discountedSubtotal,
      total: discountedSubtotal,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      happyHourDiscount,
      dailyMenuDiscount
    };
  }, [cartItems, discounts, dailyMenuData]);

  // Split Bill Functions
  const initializeSplitBill = useCallback(() => {
    if (orderMode === 'separate' && cartItems.length > 0) {
      // Initialize with 2 groups if not already set
      if (splitBillGroups.length === 0) {
        setSplitBillGroups([
          { id: 1, name: 'Grup 1', items: [], color: '#667eea' },
          { id: 2, name: 'Grup 2', items: [], color: '#f093fb' }
        ]);
      }
      setShowSplitBillModal(true);
    }
  }, [orderMode, cartItems.length, splitBillGroups.length]);

  const addSplitBillGroup = useCallback(() => {
    const newGroup = {
      id: splitBillGroups.length + 1,
      name: `Grup ${splitBillGroups.length + 1}`,
      items: [],
      color: `hsl(${splitBillGroups.length * 60}, 70%, 60%)`
    };
    setSplitBillGroups([...splitBillGroups, newGroup]);
  }, [splitBillGroups]);

  const removeSplitBillGroup = useCallback((groupId) => {
    if (splitBillGroups.length <= 2) return; // Minimum 2 groups
    const updatedGroups = splitBillGroups
      .filter(g => g.id !== groupId)
      .map((g, idx) => ({ ...g, id: idx + 1, name: `Grup ${idx + 1}` }));
    setSplitBillGroups(updatedGroups);
  }, [splitBillGroups]);

  const assignItemToGroup = useCallback((itemId, groupId) => {
    setSplitBillGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        // Add item if not already in group
        const item = cartItems.find(i => i.itemId === itemId);
        if (item && !group.items.find(i => i.itemId === itemId)) {
          return { ...group, items: [...group.items, item] };
        }
      } else {
        // Remove item from other groups
        return { ...group, items: group.items.filter(i => i.itemId !== itemId) };
      }
      return group;
    }));
  }, [cartItems]);

  const removeItemFromGroup = useCallback((itemId, groupId) => {
    setSplitBillGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, items: group.items.filter(i => i.itemId !== itemId) };
      }
      return group;
    }));
  }, []);

  const getGroupTotal = useCallback((groupId) => {
    const group = splitBillGroups.find(g => g.id === groupId);
    if (!group) return 0;
    return group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [splitBillGroups]);

  const getSplitBillData = useCallback(() => {
    if (orderMode !== 'separate' || splitBillGroups.length === 0) return null;
    
    const allAssignedItems = splitBillGroups.flatMap(g => g.items.map(i => i.itemId));
    const unassignedItems = cartItems.filter(i => !allAssignedItems.includes(i.itemId));
    
    if (unassignedItems.length > 0) {
      return null; // Not all items assigned
    }

    // Folosește structura corectă pentru splitBillService
    return {
      mode: 'split',
      version: '1.0',
      createdAt: new Date().toISOString(),
      groups: splitBillGroups.map(g => ({
        id: g.id,
        name: g.name,
        items: g.items.map(i => ({
          itemId: i.itemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        total: getGroupTotal(g.id)
      }))
    };
  }, [orderMode, splitBillGroups, cartItems, getGroupTotal]);

  // Submit order
  // Open order notes modal before submitting
  const handleSubmitOrder = useCallback(() => {
    if (cartItems.length === 0) {
      setError('Coșul este gol! Adaugă produse în coș înainte de a trimite comanda.');
      return;
    }
    
    if (!selectedTable && orderType === 'dine-in') {
      setError('⚠️ Selectează o masă! Pentru comenzi Dine-In, trebuie să selectezi o masă din planul de mese.');
      return;
    }

    // Open notes modal
    setShowOrderNotesModal(true);
  }, [cartItems.length, selectedTable, orderType]);

  // Actually submit order with notes
  const handleConfirmSubmitOrder = useCallback(async () => {
    try {
      // Format items pentru backend - FIX: folosește product_id în loc de id
      const formattedItems = cartItems.map(item => ({
        product_id: item.productId,
        product_name: item.name,
        name: item.name,
        price: item.basePrice || item.price,
        quantity: item.quantity,
        station: item.station || 'kitchen',
        status: 'pending',
        customizations: item.customizations || [],
        notes: item.notes || ''
      }));

      // Get split bill data if in separate mode
      const splitBillData = getSplitBillData();
      
      // FIX: type trebuie să fie 'dine_in' pentru restaurant, nu 'restaurant'
      const orderTypeMapped = orderType === 'dine-in' ? 'dine_in' : (orderType === 'delivery' ? 'delivery' : 'takeaway');
      
      const orderData = {
        table_id: selectedTable?.number || selectedTable?.id || 1,
        table_number: selectedTable?.number || selectedTable?.id || 1,
        type: orderTypeMapped,
        items: formattedItems,
        status: 'pending',
        isTogether: orderMode === 'together' ? 1 : 0,
        delivery_type: deliveryType,
        split_bill: splitBillData ? JSON.stringify(splitBillData) : null, // Save split bill structure
        food_notes: orderFoodNotes.trim() || null,
        drink_notes: orderDrinkNotes.trim() || null,
        general_notes: orderGeneralNotes.trim() || null,
        total: totals.total // Adaugă totalul calculat
      };

      console.log('📤 Trimit comanda:', orderData);
      if (splitBillData) {
        console.log('💰 Split Bill configurat:', splitBillData);
      }

      if (activeOrder?.id) {
        const existingItems = typeof activeOrder.items === 'string' 
          ? JSON.parse(activeOrder.items) 
          : (activeOrder.items || []);
        
        await updateOrder(activeOrder.id, { 
          items: [...existingItems, ...formattedItems],
          status: 'preparing',
          split_bill: splitBillData ? JSON.stringify(splitBillData) : null
        });
      } else {
        await createOrder(orderData);
      }

      setCartItems([]);
      setActiveOrder(null);
      setOrderFoodNotes('');
      setOrderDrinkNotes('');
      setOrderGeneralNotes('');
      setShowOrderNotesModal(false);
      await loadTablesStatus();
      setError(null);
      alert('✅ Comanda a fost trimisă!');
      handleBackToTables();
      
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Eroare la trimiterea comenzii');
    }
  }, [cartItems, selectedTable, orderType, orderMode, deliveryType, activeOrder, loadTablesStatus, orderFoodNotes, orderDrinkNotes, orderGeneralNotes, getSplitBillData, handleBackToTables]);

  // Payment
  const handleOpenPayment = useCallback(() => {
    if (!activeOrder?.id && cartItems.length === 0) {
      setError('Nu există comandă de încasat!');
      return;
    }
    
    // Validate split bill if in separate mode
    if (orderMode === 'separate') {
      const splitData = getSplitBillData();
      if (!splitData) {
        setError('Toate item-urile trebuie alocate la grupuri pentru split bill!');
        setShowSplitBillModal(true);
        return;
      }
    }
    
    setShowPayment(true);
  }, [activeOrder, cartItems, orderMode, getSplitBillData]);

  // Filter products (folosește 'category' din API)
  // FIX: Căutarea ignoră categoria selectată - când cauți, vezi toate produsele
  const filteredProducts = useMemo(() => {
    console.log('[KioskPOSSplit] filteredProducts - searchTerm:', searchTerm, 'selectedCategory:', selectedCategory, 'products:', products.length);
    
    const filtered = products.filter(p => {
      if (p.active === false) return false;
      
      // Dacă există searchTerm, ignoră categoria selectată și caută în toate produsele
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const nameEn = (p.name_en || '').toLowerCase();
        const category = ((p.category || p.category_name) || '').toLowerCase();
        const description = ((p.description || '') + ' ' + (p.description_en || '')).toLowerCase();
        const matches = name.includes(term) || nameEn.includes(term) || category.includes(term) || description.includes(term);
        return matches;
      }
      
      // Dacă nu există searchTerm, filtrează după categorie
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesCategory;
    });
    
    console.log('[KioskPOSSplit] filteredProducts result:', filtered.length, 'products');
    return filtered;
  }, [products, selectedCategory, searchTerm]);

  // Group products by category for display (folosește 'category' din API)
  const productsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = products.filter(p => p.category === cat && p.active !== false);
    });
    return grouped;
  }, [products, categories]);

  // FIX: Pagina se randează IMEDIAT - nu mai blocăm render-ul
  // Loading overlay doar dacă e necesar (nu mai blocăm render-ul)
  const isLoading = productsLoading || tablesLoading || positionsLoading;
  
  // FIX: tables este deja inițializat cu date default, deci nu mai avem nevoie de displayTables

  return (
    <div className="pos-split-page">
      {/* Loading Overlay - doar dacă e necesar, nu mai blocăm render-ul */}
      {isLoading && (
        <div className="pos-split-loading-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <Spinner animation="border" variant="warning" size="sm" />
            <span style={{ marginLeft: '10px' }}>Se încarcă...</span>
          </div>
        </div>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError(null)}
          className="pos-split-alert"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            minWidth: '400px',
            maxWidth: '600px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {error}
        </Alert>
      )}

      {/* MAIN HEADER */}
      <div className="pos-main-header">
        <div className="pos-main-header-left">
          <Button 
            variant="outline-secondary" 
            onClick={handleBackToDashboard}
            className="pos-exit-btn"
          >
            <LogOut size={18} /> Ieșire POS
          </Button>
          <h1 className="pos-main-title">
            <ShoppingCart size={28} /> POS Vânzare
          </h1>
          
          {/* Happy Hour Info - Afișat după "POS Vânzare" (with full details like comanda.html) */}
          {activeHappyHour?.active && activeHappyHour?.settings?.length > 0 && (() => {
            const hh = activeHappyHour.settings[0];
            const formatDays = (daysArray) => {
              if (!daysArray) return '';
              const fullDays = {
                '1': 'Luni', '2': 'Marți', '3': 'Miercuri', '4': 'Joi', 
                '5': 'Vineri', '6': 'Sâmbătă', '7': 'Duminică', '0': 'Duminică',
                'all': 'Toate Zilele'
              };
              if (Array.isArray(daysArray)) {
                if (daysArray.length === 7 || daysArray.includes('all')) return 'Toate Zilele';
                return daysArray.map(day => fullDays[String(day).trim().toLowerCase()] || day).join(', ');
              }
              if (String(daysArray).toLowerCase().trim() === 'all') return 'Toate Zilele';
              return fullDays[String(daysArray).trim()] || daysArray;
            };
            const daysText = formatDays(hh.days_of_week);
            const discountPercent = hh.discount_percentage || 0;
            const discountFixed = hh.discount_fixed || 0;
            const name = hh.name || 'Happy Hour';
            
            // Determine discount type display
            let discountText = 'O Reducere Specială';
            if (discountPercent > 0) {
              discountText = `${discountPercent}% reducere`;
            } else if (discountFixed > 0) {
              discountText = `${discountFixed} RON reducere`;
            }
            
            return (
              <div className="pos-happy-hour-banner" style={{
                background: '#fffbe9',
                border: '1px solid #d4c185',
                color: '#dc2626',
                fontFamily: "'Dancing Script', cursive",
                fontSize: '1.1em',
                fontWeight: '700',
                padding: '15px 20px',
                borderRadius: '15px',
                boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)',
                marginBottom: '10px'
              }}>
                <div style={{ lineHeight: '1.3' }}>
                  <div>🎉 <strong>Happy Hour Activ!</strong> {name} ({daysText})</div>
                  <div>⏰ Astăzi, de la <strong>{hh.start_time}</strong> la <strong>{hh.end_time}</strong>.</div>
                  <div>💰 Comandă acum și beneficiezi de <strong>{discountText}!</strong></div>
                  {discounts && discounts.hasDiscount && discounts.totalDiscount > 0 && (
                    <div style={{ marginTop: '5px', fontSize: '0.95em', color: '#16a34a' }}>
                      ✨ Reducere aplicată: <strong>{discounts.totalDiscount.toFixed(2)} RON</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
        <div className="pos-main-header-right">
          <Badge bg="success" className="pos-session-badge">
            {session?.name || 'Guest'}
          </Badge>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={loadTablesStatus}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* SPLIT CONTAINER */}
      <div className="pos-split-container">
        {/* LEFT PANEL */}
        <div className="pos-split-left">
          {/* Left Header */}
          <div className="pos-panel-header">
            {viewMode === 'products' && (
              <Button 
                variant="warning" 
                onClick={handleBackToTables}
                className="pos-back-btn"
              >
                <ArrowLeft size={18} /> Înapoi la Mese
              </Button>
            )}
            <h2 className="pos-panel-title">
              {viewMode === 'tables' ? (
                <>
                  <Users size={22} /> Plan Mese
                </>
              ) : (
                <>
                  <Utensils size={22} /> 
                  Masa {selectedTable?.number}
                  {activeOrder && (
                    <Badge bg="warning" className="ms-2">
                      #{activeOrder.id}
                    </Badge>
                  )}
                </>
              )}
            </h2>
            
            {/* Search Box - Doar când suntem în modul products */}
            {viewMode === 'products' && (
              <div className="pos-search-box" style={{ marginLeft: 'auto', marginRight: '1rem', maxWidth: '400px', flex: '1' }}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Caută produs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="link" size="sm" onClick={() => setSearchTerm('')} style={{ padding: '0', minWidth: 'auto' }}>
                    <X size={16} />
                  </Button>
                )}
              </div>
            )}
            
            {/* Butoane Header - Dine-In / Delivery / Drive-Thru */}
            {viewMode === 'tables' && (
              <div className="pos-header-tabs">
                <button 
                  className={`pos-tab-btn ${orderType === 'dine-in' ? 'active' : ''}`}
                  onClick={() => {
                    setOrderType('dine-in');
                    setError(null);
                  }}
                >
                  <i className="fas fa-utensils"></i> Dine-In
                </button>
                <button 
                  className="pos-tab-btn"
                  onClick={() => window.open('/comanda-supervisor11.html?type=delivery', '_blank')}
                >
                  <i className="fas fa-motorcycle"></i> Delivery
                </button>
                <button 
                  className="pos-tab-btn"
                  onClick={() => window.open('/comanda-supervisor11.html?type=drive-thru', '_blank')}
                >
                  <i className="fas fa-car"></i> Drive-Thru
                </button>
                <div className="pos-tab-separator"></div>
                <button 
                  className="pos-action-btn btn-report"
                  onClick={() => navigate('/kiosk/reports/staff-live')}
                >
                  <i className="fas fa-chart-line"></i> Raport
                </button>
                <button 
                  className="pos-action-btn btn-shift"
                  onClick={() => navigate('/kiosk/shift-handover')}
                >
                  <i className="fas fa-clipboard-check"></i> Tură
                </button>
                <button 
                  className="pos-action-btn btn-tv"
                  onClick={() => navigate('/kiosk/menu-board')}
                >
                  <i className="fas fa-tv"></i> TV
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="pos-panel-content">
            {viewMode === 'tables' ? (
              /* TABLE MAP */
              <div className="pos-table-map">
                {tables.map((table) => {
                  const position = positions[table.number] || { 
                    x: ((table.number - 1) % 6) * 120 + 20, 
                    y: Math.floor((table.number - 1) / 6) * 130 + 20 
                  };
                  return (
                    <Table2D
                      key={`table-${table.number}`}
                      id={table.number}
                      tableNumber={table.number}
                      status={table.status}
                      timer={table.timer}
                      x={position.x}
                      y={position.y}
                      onMove={(newX, newY) => handleTableMove(table.number, newX, newY)}
                      onClick={() => handleTableSelect(table)}
                    />
                  );
                })}
              </div>
            ) : (
              /* PRODUCTS WITH CATEGORIES */
              <div className="pos-products-panel">
                {/* Categories Buttons */}
                <div className="pos-category-nav">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'warning' : 'outline-secondary'}
                      size="sm"
                      onClick={() => {
                        if (cat === 'Oferta Zilei') {
                          setSelectedCategory('Oferta Zilei');
                          // Load daily offer data
                          fetch('/api/daily-offer')
                            .then(response => {
                              if (response.ok) {
                                return response.json();
                              }
                              throw new Error('No active offer');
                            })
                            .then(data => {
                              if (data.offer) {
                                setCurrentDailyOfferData(data.offer);
                                // Initialize selections with global index
                                const conditionSelections = [];
                                let globalIndex = 0;
                                data.offer.conditions?.forEach((condition, conditionIndex) => {
                                  for (let i = 0; i < condition.quantity; i++) {
                                    conditionSelections.push({ 
                                      globalIndex: globalIndex++,
                                      conditionIndex: conditionIndex, 
                                      productId: null 
                                    });
                                  }
                                });
                                const benefitSelections = [];
                                for (let i = 0; i < (data.offer.benefit_quantity || 0); i++) {
                                  benefitSelections.push({ productId: null });
                                }
                                setDailyOfferSelections({ conditions: conditionSelections, benefits: benefitSelections });
                              } else {
                                setCurrentDailyOfferData(null);
                              }
                            })
                            .catch(error => {
                              console.log('No daily offer for today');
                              setCurrentDailyOfferData(null);
                            });
                        } else if (cat === 'Meniul Zilei') {
                          setSelectedCategory('Meniul Zilei');
                          setCurrentDailyOfferData(null);
                          // Load daily menu data
                          fetch('/api/daily-menu')
                            .then(res => res.json())
                            .then(data => {
                              if (data && data.soup && data.mainCourse) {
                                setDailyMenuData(data);
                                console.log('[KioskPOSSplitPage] Daily menu loaded:', data);
                              } else {
                                setDailyMenuData(null);
                                console.log('[KioskPOSSplitPage] No daily menu data available');
                              }
                            })
                            .catch(err => {
                              console.error('[KioskPOSSplitPage] Error loading daily menu:', err);
                              setDailyMenuData(null);
                            });
                        } else {
                          setSelectedCategory(cat);
                          setCurrentDailyOfferData(null);
                        }
                      }}
                      className="pos-category-btn"
                    >
                      {cat}
                      <Badge bg="dark" className="ms-1">
                        {cat === 'Oferta Zilei' || cat === 'Meniul Zilei' ? 0 : (productsByCategory[cat]?.length || 0)}
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                {/* Products Grid / Daily Offer UI */}
                <div className="pos-products-content">
                  {/* Show Daily Offer UI if "Oferta Zilei" is selected */}
                  {selectedCategory === 'Oferta Zilei' && !searchTerm ? (
                    currentDailyOfferData ? (
                      <div className="daily-offer-container" style={{ width: '100%', padding: '2rem', color: '#f1f5f9' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                          <h1 style={{ color: '#ff6b35', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                            🎯 {currentDailyOfferData.title}
                          </h1>
                          <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                            {currentDailyOfferData.description}
                          </p>
                        </div>

                        <div className="daily-offer-card" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                          {/* Step 1: Condition Products */}
                          <h3 style={{ color: '#fbbf24', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Pasul 1: Alege produsele pentru ofertă
                          </h3>
                          {currentDailyOfferData.conditions?.map((condition, conditionIndex) => {
                            const conditionSelections = dailyOfferSelections.conditions.filter(
                              sel => sel.conditionIndex === conditionIndex
                            );
                            return (
                              <div key={conditionIndex} style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                                  {condition.category} (Cumpără {condition.quantity} x)
                                </h4>
                                {conditionSelections.map((selection, selIndex) => (
                                  <div key={selection.globalIndex} style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#f1f5f9', fontSize: '1.1rem' }}>
                                      Alege {condition.category} #{selIndex + 1}
                                    </label>
                                    <select
                                      className="form-control"
                                      value={selection.productId || ''}
                                      onChange={(e) => handleConditionSelectionChange(selection.globalIndex, e.target.value)}
                                      required
                                      style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        borderRadius: '8px', 
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: '#f1f5f9',
                                        fontSize: '1rem'
                                      }}
                                    >
                                      <option value="" style={{ color: '#333' }}>-- Selectează un produs --</option>
                                      {condition.products?.map(product => (
                                        <option key={product.id} value={product.id} style={{ color: '#333' }}>
                                          {product.name} - {product.price?.toFixed(2)} RON
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                            );
                          })}

                          {/* Step 2: Benefit Products */}
                          <h3 style={{ color: '#22c55e', marginTop: '2.5rem', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Pasul 2: Alege beneficiul gratuit
                          </h3>
                          {dailyOfferSelections.benefits.map((selection, index) => (
                            <div key={index} style={{ marginBottom: '1rem' }}>
                              <label style={{ fontWeight: 'bold', color: '#22c55e', display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                Alege Beneficiu #{index + 1} (Gratuit)
                              </label>
                              <select
                                className="form-control"
                                value={selection.productId || ''}
                                onChange={(e) => handleBenefitSelectionChange(index, e.target.value)}
                                required
                                style={{ 
                                  width: '100%', 
                                  padding: '12px', 
                                  borderRadius: '8px', 
                                  border: '2px solid rgba(34, 197, 94, 0.5)',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#f1f5f9',
                                  fontSize: '1rem'
                                }}
                              >
                                <option value="" style={{ color: '#333' }}>-- Selectează un produs gratuit --</option>
                                {currentDailyOfferData.benefit_products?.map(product => (
                                  <option key={product.id} value={product.id} style={{ color: '#333' }}>
                                    {product.name} - {product.price?.toFixed(2)} RON
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}

                          <Button
                            variant="success"
                            onClick={handleAddOfferToCart}
                            style={{ 
                              width: '100%', 
                              padding: '1rem', 
                              fontSize: '1.3rem', 
                              marginTop: '2rem',
                              fontWeight: 'bold',
                              borderRadius: '12px'
                            }}
                          >
                            <ShoppingCart size={24} className="me-2" />
                            Adaugă Oferta Completă în Coș
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pos-order-empty" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
                        <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Nu există Ofertă Zilei astăzi</h3>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Te rugăm să revii mâine.</p>
                      </div>
                    )
                  ) : selectedCategory === 'Meniul Zilei' && !searchTerm ? (
                    dailyMenuData && dailyMenuData.soup && dailyMenuData.mainCourse ? (
                      <div className="daily-menu-container">
                        <div className="daily-menu-card">
                          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h1 style={{ color: '#ff6b35', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                              🍲 Meniul Zilei
                            </h1>
                          </div>
                          
                          <div style={{ marginBottom: '1.5rem' }}>
                            {/* Soup */}
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              marginBottom: '1rem',
                              padding: '1rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                {dailyMenuData.soup.image_url ? (
                                  <img 
                                    src={dailyMenuData.soup.image_url} 
                                    alt={dailyMenuData.soup.name}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                  />
                                ) : (
                                  <div style={{ width: '60px', height: '60px', background: '#ff6b35', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                    🍲
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <h3 style={{ color: '#f1f5f9', margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                    {dailyMenuData.soup.name}
                                  </h3>
                                  {dailyMenuData.soup.description && (
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                                      {dailyMenuData.soup.description}
                                    </p>
                                  )}
                                  {dailyMenuData.soup.allergens && (
                                    <p style={{ color: '#94a3b8', margin: 0, marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                      <strong style={{ color: '#f1f5f9' }}>Alergeni:</strong> {dailyMenuData.soup.allergens}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fbbf24', marginLeft: '1rem' }}>
                                {dailyMenuData.soup.price?.toFixed(2)} RON
                              </span>
                            </div>
                            
                            {/* Plus symbol */}
                            <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#ff6b35', margin: '1rem 0', fontWeight: 'bold' }}>+</div>
                            
                            {/* Main Course */}
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '1rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                {dailyMenuData.mainCourse.image_url ? (
                                  <img 
                                    src={dailyMenuData.mainCourse.image_url} 
                                    alt={dailyMenuData.mainCourse.name}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                  />
                                ) : (
                                  <div style={{ width: '60px', height: '60px', background: '#ff6b35', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                    🍽️
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <h3 style={{ color: '#f1f5f9', margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                    {dailyMenuData.mainCourse.name}
                                  </h3>
                                  {dailyMenuData.mainCourse.description && (
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                                      {dailyMenuData.mainCourse.description}
                                    </p>
                                  )}
                                  {dailyMenuData.mainCourse.allergens && (
                                    <p style={{ color: '#94a3b8', margin: 0, marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                      <strong style={{ color: '#f1f5f9' }}>Alergeni:</strong> {dailyMenuData.mainCourse.allergens}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fbbf24', marginLeft: '1rem' }}>
                                {dailyMenuData.mainCourse.price?.toFixed(2)} RON
                              </span>
                            </div>
                          </div>
                          
                          <hr style={{ margin: '1.5rem 0', border: '1px dashed rgba(255, 255, 255, 0.3)' }} />
                          
                          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ marginBottom: '0.75rem' }}>
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                Total: {(dailyMenuData.soup.price + dailyMenuData.mainCourse.price).toFixed(2)} RON
                              </span>
                              <br />
                              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35' }}>
                                Preț Ofertă: {((dailyMenuData.soup.price + dailyMenuData.mainCourse.price) - (dailyMenuData.discount || 0)).toFixed(2)} RON
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            variant="danger"
                            onClick={() => {
                              // Add soup with daily menu flag
                              setCartItems(prev => [...prev, {
                                itemId: `daily_soup_${dailyMenuData.soup.id}_${Date.now()}`,
                                productId: dailyMenuData.soup.id,
                                name: dailyMenuData.soup.name,
                                price: dailyMenuData.soup.price,
                                basePrice: dailyMenuData.soup.price,
                                quantity: 1,
                                station: 'kitchen',
                                status: 'pending',
                                customizations: [],
                                notes: '',
                                isDailyMenu: true,
                                dailyMenuType: 'soup'
                              }]);
                              // Add main course with daily menu flag
                              setCartItems(prev => [...prev, {
                                itemId: `daily_main_${dailyMenuData.mainCourse.id}_${Date.now()}`,
                                productId: dailyMenuData.mainCourse.id,
                                name: dailyMenuData.mainCourse.name,
                                price: dailyMenuData.mainCourse.price,
                                basePrice: dailyMenuData.mainCourse.price,
                                quantity: 1,
                                station: 'kitchen',
                                status: 'pending',
                                customizations: [],
                                notes: '',
                                isDailyMenu: true,
                                dailyMenuType: 'mainCourse'
                              }]);
                            }}
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem', 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold',
                              borderRadius: '8px',
                              background: '#ff6b35',
                              border: '2px solid #ff6b35',
                              boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)'
                            }}
                          >
                            <ShoppingCart size={14} className="me-2" />
                            Adaugă în Comandă
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pos-order-empty" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍲</div>
                        <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Nu există Meniu al Zilei astăzi</h3>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Te rugăm să revii mâine.</p>
                      </div>
                    )
                  ) : (
                    <div className="pos-products-grid">
                      {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="pos-product-card"
                        onClick={() => handleProductClick(product)}
                      >
                        {/* Station indicator */}
                        <div className="pos-product-station-icon">
                          {product.station === 'bar' ? (
                            <Wine size={14} className="text-purple" />
                          ) : (
                            <ChefHat size={14} className="text-orange" />
                          )}
                        </div>
                        
                        {/* Has customizations indicator */}
                        {product.customizations && product.customizations.length > 0 && (
                          <div className="pos-product-mods-indicator">
                            <Settings size={12} />
                            <span>{product.customizations.length}</span>
                          </div>
                        )}
                        
                        <div className="pos-product-name">{product.name}</div>
                        <div className="pos-product-price">{product.price} lei</div>
                        
                        {/* Show available customizations preview */}
                        {product.customizations && product.customizations.length > 0 && (
                          <div className="pos-product-mods-preview">
                            {product.customizations.slice(0, 3).map((mod, idx) => (
                              <span key={idx} className="pos-mod-tag">
                                {mod.option_name}
                              </span>
                            ))}
                            {product.customizations.length > 3 && (
                              <span className="pos-mod-more">+{product.customizations.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - ORDER */}
        <div className="pos-split-right">
          <div className="pos-order-header">
            <h3>
              <ShoppingCart size={20} />
              Comandă
              {totals.itemCount > 0 && (
                <Badge bg="warning" className="ms-2">{totals.itemCount}</Badge>
              )}
            </h3>
            {cartItems.length > 0 && (
              <Button variant="link" className="text-danger" onClick={clearCart}>
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          {/* Order Options */}
          <div className="pos-order-options">
            <div className="pos-opt-row">
              <label>Tip:</label>
              <div className="pos-opt-btns">
                <Button 
                  variant={orderType === 'dine-in' ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setOrderType('dine-in')}
                >
                  <Utensils size={14} /> Restaurant
                </Button>
                <Button 
                  variant={orderType === 'delivery' ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setOrderType('delivery')}
                >
                  <Bike size={14} /> Delivery
                </Button>
              </div>
            </div>

            <div className="pos-opt-row">
              <label>Servire:</label>
              <div className="pos-opt-btns">
                <Button 
                  variant={deliveryType === 'here' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setDeliveryType('here')}
                >
                  <Home size={14} /> Pentru Aici
                </Button>
                <Button 
                  variant={deliveryType === 'home' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setDeliveryType('home')}
                >
                  <Car size={14} /> Pentru Acasă
                </Button>
              </div>
            </div>

            <div className="pos-opt-row">
              <label>Plată:</label>
              <div className="pos-opt-btns">
                <Button 
                  variant={orderMode === 'together' ? 'info' : 'outline-secondary'}
                  size="sm"
                  onClick={() => {
                    setOrderMode('together');
                    setSplitBillGroups([]);
                    setShowSplitBillModal(false);
                  }}
                >
                  <UserPlus size={14} /> Împreună
                </Button>
                <Button 
                  variant={orderMode === 'separate' ? 'info' : 'outline-secondary'}
                  size="sm"
                  onClick={() => {
                    setOrderMode('separate');
                    initializeSplitBill();
                  }}
                >
                  <UserMinus size={14} /> Separat
                </Button>
              </div>
            </div>
            
            {/* Split Bill Button */}
            {orderMode === 'separate' && cartItems.length > 0 && (
              <div className="pos-opt-row">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={initializeSplitBill}
                  className="w-100"
                >
                  <Users size={14} className="me-2" />
                  Configurează Split Bill
                  {splitBillGroups.length > 0 && (
                    <Badge bg="success" className="ms-2">{splitBillGroups.length}</Badge>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="pos-order-items">
            {cartItems.length === 0 ? (
              <div className="pos-order-empty">
                <ShoppingCart size={48} strokeWidth={1} />
                <p>Coșul este gol</p>
                <small>Selectează o masă și adaugă produse</small>
              </div>
            ) : (
              cartItems.map((item) => {
                // Verifică dacă produsul are opțiuni disponibile
                const originalProduct = products.find(p => p.id === item.productId);
                const hasOptions = originalProduct?.customizations?.length > 0;
                
                return (
                  <div key={item.itemId} className="pos-cart-item">
                    <div className="pos-cart-item-info">
                      <div className="pos-cart-item-header">
                        <div className="pos-cart-item-name">{item.name}</div>
                      </div>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="pos-cart-item-mods">
                          {item.customizations.map((mod, idx) => (
                            <span key={idx} className="pos-cart-mod">
                              + {mod.option_name} {mod.extra_price > 0 && `(+${mod.extra_price})`}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <div className="pos-cart-item-notes">📝 {item.notes}</div>
                      )}
                      <div className="pos-cart-item-price">
                        {(item.price * item.quantity).toFixed(2)} lei
                      </div>
                    </div>
                    <div className="pos-cart-item-qty">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.itemId, -1)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.itemId, 1)}
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="link"
                        className="text-danger"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pos-order-footer">
            {/* Happy Hour Banner removed - already displayed in header */}

            {/* Split Bill Summary */}
            {orderMode === 'separate' && splitBillGroups.length > 0 && (
              <div className="pos-split-summary mb-2 p-2" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                {splitBillGroups.map(group => {
                  const groupTotal = getGroupTotal(group.id);
                  return (
                    <div key={group.id} className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: group.color, fontWeight: 'bold' }}>
                        {group.name}:
                      </span>
                      <span>{groupTotal.toFixed(2)} lei</span>
                    </div>
                  );
                })}
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2" style={{ borderTop: '1px solid #dee2e6' }}>
                  <span><strong>Total:</strong></span>
                  <span><strong>{totals.total.toFixed(2)} lei</strong></span>
                </div>
              </div>
            )}
            
            {totals.dailyMenuDiscount > 0 && (
              <div className="pos-order-discount" style={{ 
                padding: '0.5rem', 
                background: 'rgba(255, 107, 53, 0.1)', 
                borderRadius: '8px',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#ff6b35', fontWeight: '600' }}>
                  🍲 Discount Meniul Zilei:
                </span>
                <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                  -{totals.dailyMenuDiscount.toFixed(2)} lei
                </span>
              </div>
            )}
            {totals.happyHourDiscount > 0 && (
              <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.9rem' }}>
                <span className="text-success">
                  <i className="fas fa-tag me-1"></i>Happy Hour:
                </span>
                <strong className="text-success">-{totals.happyHourDiscount.toFixed(2)} lei</strong>
              </div>
            )}
            
            <div className="pos-order-total">
              <span>Total</span>
              <span className="pos-total-amount">{totals.total.toFixed(2)} lei</span>
            </div>
            
            <div className="pos-order-actions">
              {cartItems.length > 0 ? (
                <Button
                  variant="warning"
                  size="lg"
                  className="pos-btn-send"
                  onClick={handleSubmitOrder}
                >
                  <Send size={20} /> Trimite
                </Button>
              ) : activeOrder ? (
                <Button
                  variant="success"
                  size="lg"
                  className="pos-btn-pay"
                  onClick={handleOpenPayment}
                >
                  <CreditCard size={20} /> Încasează
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modifiers Overlay */}
      {showModifiersModal && selectedProduct && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h5>
                <Settings size={20} className="me-2" />
                Personalizează: {selectedProduct.name}
              </h5>
              <button 
                className="custom-modal-close"
                onClick={() => {
                  setShowModifiersModal(false);
                  setSelectedModifiers([]);
                  setItemNotes('');
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="custom-modal-body">
              {selectedProduct.customizations && selectedProduct.customizations.length > 0 ? (
                <>
                  <h6 className="text-warning mb-3">Extra opțiuni disponibile:</h6>
                  <div className="custom-options-grid">
                    {selectedProduct.customizations.map((mod) => {
                      const isSelected = selectedModifiers.find(m => m.id === mod.id);
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          className={`custom-option-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            console.log('👆 CLICK!', mod.option_name);
                            handleToggleOption(mod);
                          }}
                        >
                          <span className="custom-option-check">
                            {isSelected ? '✓' : '○'}
                          </span>
                          <span>{mod.option_name}</span>
                          {mod.extra_price > 0 && (
                            <span className="custom-option-price">+{mod.extra_price} lei</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-muted">Nu există opțiuni suplimentare.</p>
              )}
              
              <div className="custom-notes-section">
                <label>Notițe speciale:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Fără ceapă, extra sos..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </div>
              
              <div className="custom-price-preview">
                <span>Preț final:</span>
                <span className="custom-price-total">
                  {(selectedProduct.price || 0) + selectedModifiers.reduce((s, m) => s + (m.extra_price || 0), 0)} lei
                </span>
              </div>
            </div>
            
            <div className="custom-modal-footer">
              <button 
                className="custom-btn-cancel"
                onClick={() => {
                  setShowModifiersModal(false);
                  setSelectedModifiers([]);
                  setItemNotes('');
                }}
              >
                Anulează
              </button>
              <button 
                className="custom-btn-add"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} /> Adaugă în Coș
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && activeOrder && (
        <KioskPaymentsModal
          show={showPayment}
          onHide={() => setShowPayment(false)}
          orderId={activeOrder.id}
          total={activeOrder.total || totals.total}
          session={session}
          splitBillData={getSplitBillData()}
          onPaymentComplete={() => {
            setShowPayment(false);
            handleBackToTables();
            loadTablesStatus();
          }}
        />
      )}

      {/* Split Bill Configuration Modal */}
      <Modal
        show={showSplitBillModal}
        onHide={() => setShowSplitBillModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <Users size={20} className="me-2" />
            Configurează Split Bill
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Grupuri de plată:</span>
              <div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={addSplitBillGroup}
                  className="me-2"
                >
                  <UserPlus size={14} /> Adaugă Grup
                </Button>
              </div>
            </div>
            
            {splitBillGroups.map((group) => (
              <div
                key={group.id}
                className="mb-3 p-3 border rounded"
                style={{ borderLeft: `4px solid ${group.color}` }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong style={{ color: group.color }}>{group.name}</strong>
                    <Badge bg="info" className="ms-2">
                      {getGroupTotal(group.id).toFixed(2)} lei
                    </Badge>
                  </div>
                  {splitBillGroups.length > 2 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeSplitBillGroup(group.id)}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
                
                <div className="mb-2">
                  <small className="text-muted">Item-uri alocate:</small>
                  <div className="mt-1">
                    {group.items.length === 0 ? (
                      <span className="text-muted">Niciun item alocat</span>
                    ) : (
                      group.items.map((item) => (
                        <Badge
                          key={item.itemId}
                          bg="secondary"
                          className="me-1 mb-1"
                        >
                          {item.name} x{item.quantity} - {(item.price * item.quantity).toFixed(2)} lei
                          <Button
                            variant="link"
                            className="text-white p-0 ms-1"
                            style={{ fontSize: '10px' }}
                            onClick={() => removeItemFromGroup(item.itemId, group.id)}
                          >
                            <X size={12} />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-top pt-3">
            <h6>Item-uri disponibile:</h6>
            <div className="d-flex flex-wrap gap-2">
              {cartItems.map((item) => {
                const assignedGroup = splitBillGroups.find(g =>
                  g.items.some(i => i.itemId === item.itemId)
                );
                return (
                  <Button
                    key={item.itemId}
                    variant={assignedGroup ? "success" : "outline-secondary"}
                    size="sm"
                    onClick={() => {
                      if (assignedGroup) {
                        removeItemFromGroup(item.itemId, assignedGroup.id);
                      } else {
                        // Assign to first group or active group
                        const targetGroup = activeSplitGroup || splitBillGroups[0];
                        if (targetGroup) {
                          assignItemToGroup(item.itemId, targetGroup.id);
                        }
                      }
                    }}
                    style={{
                      borderColor: assignedGroup?.color,
                      backgroundColor: assignedGroup ? assignedGroup.color : undefined
                    }}
                  >
                    {item.name} x{item.quantity}
                    {assignedGroup && (
                      <Badge bg="light" text="dark" className="ms-1">
                        {assignedGroup.name}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {(() => {
            const allAssigned = cartItems.every(item =>
              splitBillGroups.some(g => g.items.some(i => i.itemId === item.itemId))
            );
            if (!allAssigned && cartItems.length > 0) {
              return (
                <Alert variant="warning" className="mt-3">
                  <strong>Atentie:</strong> Toate item-urile trebuie alocate la grupuri!
                </Alert>
              );
            }
            return null;
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSplitBillModal(false)}>
            Anulează
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const allAssigned = cartItems.every(item =>
                splitBillGroups.some(g => g.items.some(i => i.itemId === item.itemId))
              );
              if (allAssigned) {
                setShowSplitBillModal(false);
              }
            }}
            disabled={!cartItems.every(item =>
              splitBillGroups.some(g => g.items.some(i => i.itemId === item.itemId))
            )}
          >
            Salvează
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Notes Modal - Mențiuni generale înainte de plasarea comenzii */}
      <Modal
        show={showOrderNotesModal}
        onHide={() => setShowOrderNotesModal(false)}
        size="xl"
        centered
        dialogClassName="order-notes-modal-custom"
        contentClassName="order-notes-modal-content-custom"
      >
        <Modal.Header closeButton style={{ background: '#0f172a', borderBottom: '1px solid #334155', border: 'none' }}>
          <Modal.Title style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={20} /> Mențiuni pentru comandă
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1e293b', color: '#f8fafc' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Food Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f59e0b', fontWeight: '600' }}>
                📝 Mențiuni pentru mâncare (ex: fără ceapă, fără castraveți)
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ex: Fără ceapă, fără castraveți, extra sos..."
                value={orderFoodNotes}
                onChange={(e) => setOrderFoodNotes(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.75rem'
                }}
              />
            </div>

            {/* Drink Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f59e0b', fontWeight: '600' }}>
                🥤 Mențiuni pentru băuturi
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ex: Fără gheață, extra zahăr..."
                value={orderDrinkNotes}
                onChange={(e) => setOrderDrinkNotes(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.75rem'
                }}
              />
            </div>

            {/* General Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f59e0b', fontWeight: '600' }}>
                📋 Mențiuni generale
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ex: Comandă urgentă, servire la masă..."
                value={orderGeneralNotes}
                onChange={(e) => setOrderGeneralNotes(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.75rem'
                }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ background: '#0f172a', borderTop: '1px solid #334155', border: 'none' }}>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowOrderNotesModal(false);
              setOrderFoodNotes('');
              setOrderDrinkNotes('');
              setOrderGeneralNotes('');
            }}
          >
            Anulează
          </Button>
          <Button
            variant="warning"
            onClick={handleConfirmSubmitOrder}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              fontWeight: '600'
            }}
          >
            <Send size={18} className="me-1" /> Trimite Comanda
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KioskPOSSplitPage;
