import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { KioskPaymentsModal } from '../components/KioskPaymentsModal';
import { Card, Button, Badge, Modal, Spinner, Alert, InputGroup, FormControl } from 'react-bootstrap';
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard,
  ChefHat, Clock, Check, X, ArrowLeft, Search, Bike, Globe, Smartphone, User, Home, Truck
} from 'lucide-react';
import { useHappyHour } from '../hooks/useHappyHour';
import './KioskSelfServicePage.css';

// Unified platform/source badge logic (matches legacy UIs)
const getPlatformBadge = (platform, orderSource, type) => {
  // Normalize platform/source
  const src = (orderSource || platform || '').toUpperCase();
  let label = src;
  let icon = null;
  if (src.includes('KIOSK')) {
    label = 'KIOSK';
    icon = <Smartphone size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('POS')) {
    label = 'POS';
    icon = <User size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('RESTORAPP')) {
    label = 'RESTORAPP';
    icon = <Smartphone size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('SUPERVISOR')) {
    label = 'SUPERVISOR';
    icon = <User size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('QR')) {
    label = 'QR';
    icon = <Globe size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('GLOVO')) {
    label = 'GLOVO';
    icon = <Bike size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('WOLT')) {
    label = 'WOLT';
    icon = <Bike size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('UBER')) {
    label = 'UBER EATS';
    icon = <Bike size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('BOLT')) {
    label = 'BOLT';
    icon = <Bike size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('TAZZ')) {
    label = 'TAZZ';
    icon = <Bike size={16} style={{ marginRight: 4 }} />;
  } else if (src.includes('FRIENDSRIDE')) {
    label = 'FRIENDSRIDE';
    icon = <Truck size={16} style={{ marginRight: 4 }} />;
  }
  // Serving mode
  let serving = '';
  if (type === 'dine_in' || type === 'restaurant') serving = 'RESTAURANT';
  else if (type === 'takeout' || type === 'takeaway') serving = 'ACASĂ';
  else if (type === 'delivery') serving = 'LIVRARE';
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 16 }}>
      <Badge bg="info" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', padding: '6px 10px', letterSpacing: '0.5px' }}>
        {icon}{label}
      </Badge>
      {serving && (
        <Badge bg="secondary" style={{ fontSize: '0.85rem', fontWeight: 600, padding: '6px 10px', letterSpacing: '0.5px' }}>
          {serving}
        </Badge>
      )}
    </div>
  );
};

/**
 * KioskSelfServicePage - Self-Service Ordering Kiosk
 * Fullscreen mode for customer tablets
 * Features:
 * - Browse menu by category (synchronized with comanda.html)
 * - Add to cart with modifiers
 * - Checkout flow
 * - Order confirmation
 * - Daily Offer, Daily Menu, Happy Hour (like comanda.html)
 */
export const KioskSelfServicePage = () => {
  // Order type selection modal
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(true);
  const [orderType, setOrderType] = useState(''); // 'restaurant' | 'takeaway'
  const [showThankYou, setShowThankYou] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [paymentOrderId, setPaymentOrderId] = useState(null); // id real din backend pentru plată
  const [dailyOffer, setDailyOffer] = useState(null);
  const [dailyMenu, setDailyMenu] = useState(null);
  const [dailyMenuData, setDailyMenuData] = useState(null); // Full daily menu data (soup + mainCourse)
  const [currentDailyOfferData, setCurrentDailyOfferData] = useState(null);
  const [dailyOfferSelections, setDailyOfferSelections] = useState({ conditions: [], benefits: [] });

  // Modal plată
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null); // { items, total }
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Get active happy hour with periodic refresh (every 60 seconds)
  const { activeHappyHour, calculateDiscounts, discounts } = useHappyHour();

  // Load menu data from /api/menu/all (same as comanda.html)
  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);

      // Use the same endpoint as comanda.html
      const response = await fetch('/api/menu/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Menu data received:', {
        success: data.success,
        dataLength: data.data?.length,
        productsLength: data.products?.length,
        menuLength: data.menu?.length,
      });

      // Extract products from data (same logic as comanda.html)
      const menuItems = data.data || data.products || data.menu || [];
      setAllProducts(menuItems);

      // Extract unique categories from products (for filtering)
      const allAvailableCategories = [...new Set(menuItems.map(item => item.category || item.category_name || ''))]
        .filter(cat => cat && cat.trim() !== '');

      // Add special categories (Oferta Zilei, Meniul Zilei)
      const specialCategories = [];
      console.log('🔍 Checking special categories:', {
        hasDailyOffer: !!data.daily_offer,
        dailyOffer: data.daily_offer,
        hasDailyMenu: !!data.daily_menu,
        dailyMenu: data.daily_menu,
        hasHappyHour: !!(data.happy_hour && data.happy_hour.active)
      });

      // Always add "Oferta Zilei" if daily_offer exists (even if benefit_category is null)
      if (data.daily_offer && data.daily_offer.id) {
        specialCategories.push('Oferta Zilei');
        setDailyOffer(data.daily_offer);
        console.log('✅ Added "Oferta Zilei" to special categories');
      }

      // Always add "Meniul Zilei" (even if no menu is set for today)
      specialCategories.push('Meniul Zilei');
      if (data.daily_menu && data.daily_menu.id) {
        setDailyMenu(data.daily_menu);
        console.log('✅ Added "Meniul Zilei" to special categories (with menu data)');
      } else {
        setDailyMenu(null);
        console.log('✅ Added "Meniul Zilei" to special categories (no menu for today)');
      }

      // Note: Happy hour is now managed by useHappyHour hook with periodic refresh

      console.log('📋 Special categories after check:', specialCategories);

      // Ordinea fixă de categorii (EXACT ca în comanda.html) - folosim lista hardcodată, nu categories_ordered de la server (care este sortată alfabetic)
      // NOTĂ: "Oferta Zilei" și "Meniul Zilei" sunt adăugate separat mai sus, deci nu trebuie incluse aici
      const orderedCategories = [
        'Băuturi și Coctailuri',
        'Cafea/Ciocolată/Ceai',
        'Răcoritoare',
        'Aperitive Calde',
        'Aperitive Reci',
        'Băuturi Spirtoase',
        'Ciorbe',
        'Coctailuri Non-Alcoolice',
        'Deserturi',
        'Fast Food',
        'Fel Principal',
        'Garnituri',
        'Mic Dejun',
        'Paste',
        'Peste și Fructe de Mare',
        'Pizza',
        'Salate',
        'Salate Însoțitoare',
        'Sosuri și Pâine',
        'Vinuri',
      ];

      // Combine special categories with ordered categories (special categories first, then ordered, then rest)
      const finalCategories = [
        ...specialCategories, // Special categories first
        ...orderedCategories.filter(cat =>
          allAvailableCategories.includes(cat) && !specialCategories.includes(cat)
        ), // Ordered categories (only if they exist)
        ...allAvailableCategories.filter(cat =>
          !specialCategories.includes(cat) && !orderedCategories.includes(cat)
        ) // Rest of categories
      ];

      // Elimină duplicatele (folosind Set pentru a păstra ordinea)
      const uniqueCategories = Array.from(new Set(finalCategories));

      // Debug: verifică dacă există duplicate înainte de Set
      if (finalCategories.length !== uniqueCategories.length) {
        console.warn(`⚠️ Found ${finalCategories.length - uniqueCategories.length} duplicate categories before deduplication`);
        console.log('Final categories (with duplicates):', finalCategories);
        console.log('Unique categories:', uniqueCategories);
      }

      setCategories(uniqueCategories);

      // Set first category as default
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }

      console.log(`✅ Menu loaded: ${menuItems.length} products, ${uniqueCategories.length} unique categories (from ${finalCategories.length} total)`);
      setLoading(false);
    } catch (err) {
      console.error('Error loading menu:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Show order type modal on mount
  useEffect(() => {
    setShowOrderTypeModal(true);
    setOrderType('');
  }, []);

  // Load daily menu when "Meniul Zilei" category is selected
  useEffect(() => {
    if (selectedCategory === 'Meniul Zilei') {
      fetch('/api/daily-menu')
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('No daily menu');
        })
        .then(data => {
          setDailyMenuData(data);
        })
        .catch(error => {
          console.log('No daily menu for today');
          setDailyMenuData(null);
        });
    }
  }, [selectedCategory]);

  // Load daily offer when "Oferta Zilei" category is selected
  useEffect(() => {
    if (selectedCategory === 'Oferta Zilei') {
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
    }
  }, [selectedCategory]);

  // Get products for selected category (filter by category name, not category_id)
  // Use useMemo to recalculate when searchTerm or selectedCategory changes
  const categoryProducts = useMemo(() => {
    console.log('[KioskSelfService] getCategoryProducts called - searchTerm:', searchTerm, 'selectedCategory:', selectedCategory, 'allProducts:', allProducts.length);

    // If search term exists, search in ALL products regardless of category
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      console.log('[KioskSelfService] Searching for term:', term);
      const filtered = allProducts.filter(p => {
        if (!p) return false;
        const name = (p.name || '').toLowerCase();
        const nameEn = (p.name_en || '').toLowerCase();
        const category = ((p.category || p.category_name) || '').toLowerCase();
        const description = ((p.description || '') + ' ' + (p.description_en || '')).toLowerCase();
        const matches = name.includes(term) || nameEn.includes(term) || category.includes(term) || description.includes(term);
        return matches;
      });
      console.log('[KioskSelfService] Search results:', filtered.length, 'products');
      return filtered;
    }

    // If no search term, filter by category
    let products = [];

    if (!selectedCategory) {
      products = allProducts;
    } else if (selectedCategory === 'Meniul Zilei') {
      // "Meniul Zilei" doesn't show products in grid - shows special menu UI instead
      return [];
    } else if (selectedCategory === 'Oferta Zilei') {
      // "Oferta Zilei" doesn't show products in grid - shows offer UI instead
      return [];
    } else {
      // Regular category filtering (by category name, not category_id)
      products = allProducts.filter(p =>
        (p.category || p.category_name) === selectedCategory
      );
    }

    console.log('[KioskSelfService] Category products:', products.length);
    return products;
  }, [allProducts, searchTerm, selectedCategory]);

  // Handle show daily menu (loads from /api/daily-menu)
  const handleShowDailyMenu = async () => {
    setSelectedCategory('Meniul Zilei'); // Set selected category to activate button
    try {
      const response = await fetch('/api/daily-menu');
      if (!response.ok) {
        throw new Error('No daily menu');
      }
      const data = await response.json();
      setDailyMenuData(data);
    } catch (error) {
      console.error('Error loading daily menu:', error);
      setDailyMenuData(null); // Clear menu data to show empty message
    }
  };

  // Add to cart (with optional isFree parameter for daily offer benefits)
  const addToCart = (product, quantity = 1, isFree = false) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.isFree === isFree);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.isFree === isFree
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, isFree }];
    });
  };

  // Add daily menu to cart (adds both soup and main course as separate items, like comanda.html)
  const addDailyMenuToCart = (menuData) => {
    if (!menuData || !menuData.soup || !menuData.mainCourse) return;

    const soup = menuData.soup;
    const mainCourse = menuData.mainCourse;
    const promotionalPrice = menuData.promotionalPrice || (soup.price + mainCourse.price - (menuData.discount || 0));

    // Add soup
    setCart(prev => {
      const soupCartId = `daily_soup_${soup.id}`;
      const existingSoup = prev.find(item => item.cartId === soupCartId);
      if (existingSoup) {
        return prev.map(item =>
          item.cartId === soupCartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: soup.id,
        cartId: soupCartId,
        name: soup.name,
        price: soup.price,
        quantity: 1,
        isDailyMenu: true,
        category: soup.category
      }];
    });

    // Add main course
    setCart(prev => {
      const mainCourseCartId = `daily_main_${mainCourse.id}`;
      const existingMainCourse = prev.find(item => item.cartId === mainCourseCartId);
      if (existingMainCourse) {
        return prev.map(item =>
          item.cartId === mainCourseCartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: mainCourse.id,
        cartId: mainCourseCartId,
        name: mainCourse.name,
        price: mainCourse.price,
        quantity: 1,
        isDailyMenu: true,
        category: mainCourse.category
      }];
    });

    // Note: promotionalPrice is calculated from soup.price + mainCourse.price - discount
    // Individual items are added with their original prices, discount is applied at checkout if needed
  };

  // Update quantity
  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Calculate Happy Hour discounts when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const cartItems = cart.map(item => ({
        productId: item.id,
        finalPrice: item.price || 0,
        quantity: item.quantity,
        isFree: item.isFree || false
      }));
      calculateDiscounts(cartItems);
    }
  }, [cart, calculateDiscounts]);

  // Calculate total (free items have price 0, apply daily menu discount and happy hour if applicable)
  const getTotal = () => {
    // If Happy Hour discounts are available, use them
    if (discounts && discounts.hasDiscount && discounts.items.length > 0) {
      let total = cart.reduce((sum, item, index) => {
        if (item.isFree) return sum; // Skip free items

        // Daily menu has priority over Happy Hour
        if (item.isDailyMenu) {
          return sum + (item.price * item.quantity);
        }

        // Apply Happy Hour discount
        const discountedItem = discounts.items[index];
        return sum + (discountedItem ? discountedItem.finalPrice * item.quantity : (item.price * item.quantity));
      }, 0);

      // Apply daily menu discount if items are from daily menu
      if (dailyMenuData && dailyMenuData.discount) {
        const dailyMenuItems = cart.filter(item => item.isDailyMenu);
        if (dailyMenuItems.length > 0) {
          const soupItems = dailyMenuItems.filter(item => item.cartId?.startsWith('daily_soup_'));
          const mainCourseItems = dailyMenuItems.filter(item => item.cartId?.startsWith('daily_main_'));
          const menuPairs = Math.min(
            soupItems.reduce((sum, item) => sum + item.quantity, 0),
            mainCourseItems.reduce((sum, item) => sum + item.quantity, 0)
          );
          total -= (dailyMenuData.discount * menuPairs);
        }
      }

      return total;
    }

    // Normal calculation without Happy Hour
    let total = cart.reduce((sum, item) => {
      const price = item.isFree ? 0 : (item.price || 0);
      return sum + (price * item.quantity);
    }, 0);

    // Apply daily menu discount if items are from daily menu
    if (dailyMenuData && dailyMenuData.discount) {
      const dailyMenuItems = cart.filter(item => item.isDailyMenu);
      if (dailyMenuItems.length > 0) {
        // Count pairs of soup + main course
        const soupItems = dailyMenuItems.filter(item => item.cartId?.startsWith('daily_soup_'));
        const mainCourseItems = dailyMenuItems.filter(item => item.cartId?.startsWith('daily_main_'));
        const menuPairs = Math.min(
          soupItems.reduce((sum, item) => sum + item.quantity, 0),
          mainCourseItems.reduce((sum, item) => sum + item.quantity, 0)
        );
        // Apply discount for each pair
        total -= (dailyMenuData.discount * menuPairs);
      }
    }

    return total;
  };


  // Handle adding offer items to cart
  const handleAddOfferToCart = () => {
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
        addToCart(product, 1, false);
      }
    });

    // Add benefit products (free)
    dailyOfferSelections.benefits.forEach((selection) => {
      const product = currentDailyOfferData.benefit_products?.find(p => p.id === selection.productId);
      if (product) {
        addToCart(product, 1, true);
      }
    });

    alert('Oferta a fost adăugată cu succes în coș!');
    // Reset selections so user can add the offer again if needed
    setDailyOfferSelections(prev => {
      const newConditions = prev.conditions.map(sel => ({ ...sel, productId: null }));
      const newBenefits = prev.benefits.map(sel => ({ productId: null }));
      return { conditions: newConditions, benefits: newBenefits };
    });
  };

  // Handle condition selection change
  const handleConditionSelectionChange = (globalIndex, productId) => {
    setDailyOfferSelections(prev => ({
      ...prev,
      conditions: prev.conditions.map((sel) =>
        sel.globalIndex === globalIndex ? { ...sel, productId: productId ? parseInt(productId) : null } : sel
      )
    }));
  };

  // Handle benefit selection change
  const handleBenefitSelectionChange = (selectionIndex, productId) => {
    setDailyOfferSelections(prev => ({
      ...prev,
      benefits: prev.benefits.map((sel, idx) =>
        idx === selectionIndex ? { productId: productId ? parseInt(productId) : null } : sel
      )
    }));
  };

  // Place order

  // Deschide modalul de plată la checkout
  const handleCheckout = async () => {
    if (!orderType) {
      setShowOrderTypeModal(true);
      return;
    }
    // Elimină dublurile din cart (după id și isFree)
    const uniqueCart = [];
    cart.forEach(item => {
      if (!uniqueCart.some(u => u.id === item.id && !!u.isFree === !!item.isFree)) {
        uniqueCart.push(item);
      }
    });
    // Normalizează categoria pentru produsele de bar
    const normalizeBarCategory = (cat) => {
      if (!cat) return cat;
      const c = cat.trim().toLowerCase();
      if (c === 'cafea/ciocolată/ceai' || c === 'cafea/ciocolata/ceai') return 'Cafea/Ciocolată/Ceai';
      if (c === 'răcoritoare' || c === 'racoritoare') return 'Răcoritoare';
      // Toate băuturile de bar, inclusiv spirtoase și vinuri, merg la 'Băuturi și Coctailuri'
      if (
        c === 'băuturi și coctailuri' || c === 'bauturi si coctailuri' || c === 'băuturi si coctailuri' || c === 'bauturi și coctailuri' ||
        c === 'băuturi spirtoase' || c === 'bauturi spirtoase' ||
        c === 'vinuri' || c === 'vin' || c === 'vinuri albe' || c === 'vinuri roșii' || c === 'vinuri rosii' || c === 'vinuri roze' || c === 'vinuri spumante'
      ) return 'Băuturi și Coctailuri';
      return cat;
    };

    // Mapping strict pentru KIOSK
    const orderData = {
      type: orderType === 'restaurant' ? 'dine_in' : 'takeout',
      items: uniqueCart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        unit_price: item.price,
        name: item.name,
        category: normalizeBarCategory(item.category || item.category_name),
        isFree: item.isFree || false,
        isDailyMenu: item.isDailyMenu || false
      })),
      total: getTotal(),
      payment_method: 'cash',
      is_paid: false,
      platform: 'KIOSK',
      order_source: orderType === 'restaurant' ? 'KIOSK_DINE_IN' : 'KIOSK_TAKEAWAY',
      table: orderType === 'restaurant' ? 3 : undefined
    };
    console.log('[Kiosk] Cart trimis:', uniqueCart);
    try {
      console.log('[Kiosk] Trimit payload:', orderData);
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Eroare la crearea comenzii: ${errorData.error || 'Eroare necunoscută'}`);
        return;
      }
      const created = await res.json();
      const realOrderId = created.order_id || created.id || created.order_number;
      setPaymentOrderId(realOrderId);
      setPendingOrder({
        ...orderData,
        order_id: realOrderId
      });
      setShowPaymentModal(true);
    } catch (err) {
      alert('Eroare la crearea comenzii. Încearcă din nou!');
    }
  };

  // Marchează comanda ca plătită după plată (fără a crea o nouă comandă)
  const markOrderAsPaid = async () => {
    if (!pendingOrder || !pendingOrder.order_id) return;
    try {
      const res = await fetch(`/api/orders/${pendingOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paid: true, status: 'paid' })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Eroare la actualizarea comenzii: ${errorData.error || 'Eroare necunoscută'}`);
        return;
      }
      const data = await res.json();
      setOrderNumber(data.order?.id || data.order?.order_number || Math.floor(Math.random() * 900) + 100);
      setShowConfirmation(true);
      setShowCart(false);
      setCart([]);
      setPendingOrder(null);
      setPaymentCompleted(false);
    } catch (err) {
      alert('Eroare la actualizarea comenzii. Te rugăm să încerci din nou.');
    }
  };

  // Efectuează update-ul comenzii după confirmarea plății
  useEffect(() => {
    if (paymentCompleted && showPaymentModal) {
      setShowPaymentModal(false);
      // Afișează mesajul de mulțumire 2 secunde, apoi marchează comanda ca plătită
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        markOrderAsPaid();
      }, 2000);
    }
    // eslint-disable-next-line
  }, [paymentCompleted]);

  // Închide automat modalul de confirmare comandă după 1 sec și revine la ecranul principal
  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
        // Resetare stare pentru ecran principal (dacă e nevoie de alte acțiuni, adaugă aici)
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);

  if (loading) {
    return (
      <div className="self-service-page self-service-page--loading">
        <Spinner animation="border" variant="warning" />
        <p>Se încarcă meniul...</p>
      </div>
    );
  }

  // Modal selectare tip comandă (la început)
  // Card mic, flotant, colț dreapta sus, cu butoane mici, pentru selecția tipului de comandă
  // (exact ca în codul dat de utilizator)
  if (showOrderTypeModal) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '2px solid rgba(251, 191, 36, 0.3)'
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>Tip comandă:</span>
        <Button
          variant={orderType === 'restaurant' ? 'warning' : 'outline-secondary'}
          size="sm"
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '6px 12px',
            transition: 'all 0.2s',
            background: orderType === 'restaurant' ? '#fbbf24' : 'transparent',
            color: orderType === 'restaurant' ? '#000' : '#666',
            borderColor: orderType === 'restaurant' ? '#fbbf24' : '#ccc',
          }}
          onClick={() => {
            setOrderType('restaurant');
            setShowOrderTypeModal(false);
          }}
        >
          🍽️ Restaurant
        </Button>
        <Button
          variant={orderType === 'takeaway' ? 'success' : 'outline-secondary'}
          size="sm"
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '6px 12px',
            transition: 'all 0.2s',
            background: orderType === 'takeaway' ? '#22c55e' : 'transparent',
            color: orderType === 'takeaway' ? '#fff' : '#666',
            borderColor: orderType === 'takeaway' ? '#22c55e' : '#ccc',
          }}
          onClick={() => {
            setOrderType('takeaway');
            setShowOrderTypeModal(false);
          }}
        >
          🏠 Acasă
        </Button>
      </div>
    );
  }

  // Modal mulțumire după plată
  if (showThankYou) {
    return (
      <Modal show centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center py-5">
          <h2 style={{ marginBottom: '2rem', color: '#22c55e' }}>Vă mulțumim pentru comandă.<br />Poftă bună!</h2>
        </Modal.Body>
      </Modal>
    );
  }

  // categoryProducts is now calculated in useMemo above

  return (
    <div className="self-service-page">
      {/* Header */}

      <div className="self-service-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="self-service-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <ChefHat size={32} />
          <span style={{ marginLeft: 8 }}>Comandă Self-Service</span>
          {/* Unified platform/source badge */}
          {getPlatformBadge('KIOSK', null, orderType)}
        </div>

        {/* Search Bar */}
        <div className="self-service-search">
          <InputGroup className="self-service-search-input-group">
            <InputGroup.Text className="self-service-search-icon">
              <Search size={18} />
            </InputGroup.Text>
            <FormControl
              type="text"
              placeholder="🔍 Caută produs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="self-service-search-input"
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                className="self-service-search-clear"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </Button>
            )}
          </InputGroup>
        </div>

        <Button
          variant="warning"
          className="self-service-cart-btn"
          onClick={() => setShowCart(true)}
        >
          <ShoppingCart size={20} />
          <span>Coș</span>
          {cart.length > 0 && (
            <Badge bg="danger" className="self-service-cart-badge">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Happy Hour Banner (like comanda.html - with full details) */}
      {activeHappyHour && activeHappyHour.active && activeHappyHour.settings && activeHappyHour.settings.length > 0 && (() => {
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

        // Determine discount text
        let discountText = '';
        if (discountPercent > 0) {
          discountText = `${discountPercent}% reducere`;
        } else if (discountFixed > 0) {
          discountText = `${discountFixed} RON reducere`;
        } else {
          discountText = 'O Reducere Specială';
        }

        return (
          <Alert variant="warning" className="self-service-happy-hour" style={{
            background: '#fffbe9',
            border: '1px solid #d4c185',
            color: '#dc2626',
            fontFamily: "'Dancing Script', cursive",
            fontSize: '1.1em',
            fontWeight: '700',
            padding: '15px 20px',
            borderRadius: '15px',
            boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ lineHeight: '1.3' }}>
              <div>🎉 <strong>Happy Hour Activ!</strong> {name} ({daysText})</div>
              <div>⏰ Astăzi, de la <strong>{hh.start_time}</strong> la <strong>{hh.end_time}</strong>.</div>
              <div>💰 Comandă acum și beneficiezi de <strong>{discountText}!</strong></div>
              {discounts && discounts.hasDiscount && (
                <div style={{ marginTop: '5px', fontSize: '0.95em', opacity: 0.9 }}>
                  ✨ Reducere aplicată: <strong>{discounts.totalDiscount.toFixed(2)} RON</strong>
                </div>
              )}
            </div>
          </Alert>
        );
      })()}

      {/* Categories */}
      <div className="self-service-categories">
        {categories.map((catName, index) => {
          // Special categories don't need product count - they're always visible if they exist
          if (catName === 'Oferta Zilei' || catName === 'Meniul Zilei') {
            return (
              <button
                key={`${catName}-"Index"`}
                className={`self-service-category ${selectedCategory === catName ? 'active' : ''}`}
                onClick={() => {
                  if (catName === 'Oferta Zilei') {
                    setSelectedCategory('Oferta Zilei');
                  } else if (catName === 'Meniul Zilei') {
                    handleShowDailyMenu();
                  }
                }}
              >
                <span className="self-service-category__icon">
                  {catName === 'Oferta Zilei' ? '🎁' : '🍲'}
                </span>
                <span className="self-service-category__name">
                  {catName === 'Oferta Zilei' ? '🎁 Oferta Zilei!' : '🍲 Meniul Zilei'}
                </span>
              </button>
            );
          }

          // Regular categories - count products and skip if empty
          const catProducts = allProducts.filter(p =>
            (p.category || p.category_name) === catName
          );

          // Skip categories with no products
          if (catProducts.length === 0) return null;

          return (
            <button
              key={`${catName}-"Index"`}
              className={`self-service-category ${selectedCategory === catName ? 'active' : ''}`}
              onClick={() => setSelectedCategory(catName)}
            >
              <span className="self-service-category__icon">🍽️</span>
              <span className="self-service-category__name">{catName}</span>
              <Badge bg="secondary" className="self-service-category__badge">
                {catProducts.length}
              </Badge>
            </button>
          );
        }).filter(Boolean)}
      </div>

      {/* Products Grid / Daily Offer UI / Daily Menu UI */}
      <div className="self-service-products">
        {/* Show Daily Menu UI if "Meniul Zilei" is selected AND no search term */}
        {selectedCategory === 'Meniul Zilei' && !searchTerm ? (
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
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/QrOMS.jpg'; }}
                        />
                      ) : (
                        <img
                          src="/QrOMS.jpg"
                          alt="No image"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
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
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/QrOMS.jpg'; }}
                        />
                      ) : (
                        <img
                          src="/QrOMS.jpg"
                          alt="No image"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
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
                  onClick={() => addDailyMenuToCart({
                    soup: dailyMenuData.soup,
                    mainCourse: dailyMenuData.mainCourse,
                    discount: dailyMenuData.discount || 0,
                    promotionalPrice: (dailyMenuData.soup.price + dailyMenuData.mainCourse.price) - (dailyMenuData.discount || 0)
                  })}
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
                  Adaugă în Coș
                </Button>
              </div>
            </div>
          ) : (
            <div className="self-service-empty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍲</div>
              <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Nu există Meniu al Zilei astăzi</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Te rugăm să revii mâine.</p>
            </div>
          )
        ) : selectedCategory === 'Oferta Zilei' && !searchTerm ? (
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
            <div className="self-service-empty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
              <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Nu există Ofertă Zilei astăzi</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Te rugăm să revii mâine.</p>
            </div>
          )
        ) : (
          <>
            {categoryProducts.map((product) => (
              <button
                key={product.id}
                className="self-service-product"
                onClick={() => addToCart(product)}
              >
                <div className="self-service-product__image">
                  <img
                    src={product.image_url && product.image_url.trim() ? product.image_url : '/QrOMS.jpg'}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/QrOMS.jpg'; }}
                  />
                </div>
                <div className="self-service-product__info">
                  <div className="self-service-product__name">{product.name}</div>
                  <div className="self-service-product__price">
                    {product.price?.toFixed(2)} RON
                  </div>
                </div>
              </button>
            ))}

            {categoryProducts.length === 0 && selectedCategory !== 'Meniul Zilei' && selectedCategory !== 'Oferta Zilei' && (
              <div className="self-service-empty">
                <p>Nu există produse în această categorie</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Drawer */}
      <Modal
        show={showCart}
        onHide={() => setShowCart(false)}
        fullscreen="md-down"
        className="self-service-cart-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <ShoppingCart size={24} className="me-2" />
            Coșul Tău ({cart.length} produse)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <div className="self-service-cart-empty">
              <ShoppingCart size={64} />
              <h3>Coșul este gol</h3>
              <p>Adaugă produse pentru a continua</p>
            </div>
          ) : (
            <div className="self-service-cart-items">
              {cart.map((item) => (
                <div key={item.id} className="self-service-cart-item">
                  <div className="self-service-cart-item__info">
                    <h4>{item.name}</h4>
                    <p>{item.price?.toFixed(2)} RON</p>
                  </div>
                  <div className="self-service-cart-item__controls">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, -1);
                      }}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="self-service-cart-item__qty">{item.quantity}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, 1);
                      }}
                    >
                      <Plus size={16} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="self-service-cart-item__subtotal">
                    {(item.price * item.quantity).toFixed(2)} RON
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        {cart.length > 0 && (
          <Modal.Footer className="self-service-cart-footer">
            <div className="self-service-cart-total">
              <span>Total:</span>
              <strong>{getTotal().toFixed(2)} RON</strong>
            </div>
            <Button variant="success" size="lg" onClick={handleCheckout}>
              <CreditCard size={20} className="me-2" />
              Plătește și Plasează Comanda
            </Button>
            {/* Modalul de plată */}
            <KioskPaymentsModal
              show={showPaymentModal}
              onHide={() => setShowPaymentModal(false)}
              orderId={paymentOrderId}
              total={pendingOrder ? pendingOrder.total : 0}
              session={{ role: 'kiosk' }}
              splitBillData={null}
              onPaymentComplete={() => setPaymentCompleted(true)}
            />
          </Modal.Footer>
        )}
      </Modal>

      {/* Order Confirmation */}
      <Modal
        show={showConfirmation}
        onHide={() => setShowConfirmation(false)}
        centered
        className="self-service-confirmation-modal"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center py-5">
          <div className="self-service-confirmation">
            <div className="self-service-confirmation__icon">
              <Check size={64} />
            </div>
            <h2>Comandă Plasată!</h2>
            <p className="self-service-confirmation__number">
              Numărul comenzii tale:
              <strong>#{orderNumber}</strong>
            </p>
            <p>Vei fi anunțat când comanda este gata.</p>
            <div className="self-service-confirmation__timer">
              <Clock size={20} />
              <span>Timp estimat: 10-15 minute</span>
            </div>
            {/* Butonul de comandă nouă eliminat pentru UX automat */}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default KioskSelfServicePage;
