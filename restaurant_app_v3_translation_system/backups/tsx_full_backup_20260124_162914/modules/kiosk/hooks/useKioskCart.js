import { useState, useCallback, useMemo } from 'react';

/**
 * Hook pentru gestionarea coșului KIOSK
 * Reutilizează logica din comanda-supervisor1.html
 */

export const useKioskCart = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);
  const [notes, setNotes] = useState({}); // notes per item

  // Adaugă produs în coș
  const addItem = useCallback((product, modifiers = [], extras = [], quantity = 1) => {
    // Calculează prețul final cu customizations
    const basePrice = product.price || 0;
    const customizationPrice = (product.customizations || []).reduce((sum, c) => sum + (c.extra_price || 0), 0);
    const finalPrice = basePrice + customizationPrice;
    
    const newItem = {
      id: Date.now() + Math.random(),
      product_id: product.id,
      product_name: product.name || product.product_name,
      category: product.category,
      price: finalPrice,
      quantity,
      modifiers,
      extras,
      customizations: product.customizations || [],
      notes: '',
      subtotal: finalPrice * quantity,
    };

    setItems((prev) => [...prev, newItem]);
    return newItem;
  });

  // Șterge produs din coș
  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[itemId];
      return newNotes;
    });
  });

  // Modifică cantitatea
  const updateQuantity = useCallback((itemId, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQuantity,
            subtotal: item.price * newQuantity,
          };
        }
        return item;
      }),
    );
  });

  // Incrementare cantitate
  const incrementQuantity = useCallback((itemId) => {
    updateQuantity(itemId, 1);
  });

  // Decrementare cantitate
  const decrementQuantity = useCallback((itemId) => {
    updateQuantity(itemId, -1);
  });

  // Actualizează note pentru item
  const updateItemNotes = useCallback((itemId, noteText) => {
    setNotes((prev) => ({
      ...prev,
      [itemId]: noteText,
    }));
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, notes: noteText };
        }
        return item;
      }),
    );
  });

  // Calculează totaluri
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const vatRate = 0.19; // TVA 19% (poate fi din config)
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatAmount,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items]);

  // Golește coșul
  const clearCart = useCallback(() => {
    setItems([]);
    setNotes({});
  });

  // Actualizează items (pentru încărcare comandă existentă)
  const setCartItems = useCallback((newItems) => {
    setItems(newItems);
    const newNotes = {};
    newItems.forEach((item) => {
      if (item.notes) {
        newNotes[item.id] = item.notes;
      }
    });
    setNotes(newNotes);
  });

  return {
    items,
    notes,
    totals,
    addItem,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    updateItemNotes,
    clearCart,
    setCartItems,
  };
};

