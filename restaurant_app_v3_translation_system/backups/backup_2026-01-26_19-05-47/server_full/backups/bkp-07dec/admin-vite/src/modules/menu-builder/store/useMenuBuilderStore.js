/**
 * MENU BUILDER STORE - Zustand State Management
 * Data: 04 Decembrie 2025
 * Store unificat pentru Menu Builder (Product + Recipe + Technical Sheet + Modifiers)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialState = {
  // Control
  mode: 'create', // 'create' | 'edit'
  loading: false,
  saving: false,
  dirty: false,
  
  // Context
  restaurantId: null,
  productId: null,
  menuItemId: null,
  
  // Reference data
  categories: [],
  subcategoriesByCategory: {},
  recipesOptions: [],
  modifierGroupsAvailable: [],
  
  // Builder sections
  basicInfo: {
    displayName: '',
    internalName: '',
    categoryId: null,
    subcategoryId: null,
    descriptionShort: '',
    descriptionLong: '',
    tags: [],
    language: 'ro',
  },
  
  pricing: {
    basePrice: '',
    currency: 'RON',
    vatRateId: null,
    costPerPortion: null,
    marginPercentage: null,
    dynamicPricingEnabled: false,
    dynamicRules: [],
  },
  
  portions: [],
  
  ingredientsSummary: {
    fromTechnicalSheet: [],
    showOnMenu: false,
    customLabel: '',
  },
  
  allergens: {
    fromTechnicalSheet: [],
    extra: [],
    traces: [],
    showIcons: true,
    warningText: '',
  },
  
  modifiers: {
    groups: [],
  },
  
  availability: {
    isAvailable: true,
    autoUnavailableWhenOutOfStock: true,
    locations: [],
    serviceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true,
    },
    timeWindows: [],
  },
  
  media: {
    mainImageUrl: '',
    gallery: [],
  },
  
  validationErrors: {},
};

export const useMenuBuilderStore = create(
  devtools((set, get) => ({
    ...initialState,
    
    // ========================================
    // RESET & INIT
    // ========================================
    
    reset: () => set(initialState),
    
    setRestaurantContext: ({ restaurantId }) => set({ restaurantId }),
    
    setMode: (mode) => set({ mode }),
    
    // ========================================
    // BASIC INFO
    // ========================================
    
    setBasicInfo: (changes) =>
      set((state) => ({
        basicInfo: { ...state.basicInfo, ...changes },
        dirty: true,
      })),
    
    // ========================================
    // PRICING
    // ========================================
    
    setPricing: (changes) =>
      set((state) => ({
        pricing: { ...state.pricing, ...changes },
        dirty: true,
      })),
    
    // ========================================
    // PORTIONS
    // ========================================
    
    setPortions: (portions) => set(() => ({ portions, dirty: true })),
    
    updatePortion: (id, changes) =>
      set((state) => ({
        portions: state.portions.map((p) =>
          p.id === id ? { ...p, ...changes } : p
        ),
        dirty: true,
      })),
    
    addPortion: () =>
      set((state) => {
        const idx = state.portions.length + 1;
        const newPortion = {
          id: `NEW_${Date.now()}`,
          code: `P${idx}`,
          label: `Porție ${idx}`,
          isDefault: state.portions.length === 0,
          multiplier: 1,
          grams: '',
          price: '',
          cost: null,
          margin: null,
          enabled: true,
        };
        return {
          portions: [...state.portions, newPortion],
          dirty: true,
        };
      }),
    
    removePortion: (id) =>
      set((state) => ({
        portions: state.portions.filter((p) => p.id !== id),
        dirty: true,
      })),
    
    // ========================================
    // INGREDIENTS
    // ========================================
    
    setIngredientsSummary: (changes) =>
      set((state) => ({
        ingredientsSummary: {
          ...state.ingredientsSummary,
          ...changes,
        },
        dirty: true,
      })),
    
    // ========================================
    // ALLERGENS
    // ========================================
    
    setAllergens: (changes) =>
      set((state) => ({
        allergens: { ...state.allergens, ...changes },
        dirty: true,
      })),
    
    // ========================================
    // MODIFIERS
    // ========================================
    
    setModifiers: (changes) =>
      set((state) => ({
        modifiers: { ...state.modifiers, ...changes },
        dirty: true,
      })),
    
    addModifierGroup: (group) =>
      set((state) => ({
        modifiers: {
          ...state.modifiers,
          groups: [...state.modifiers.groups, group],
        },
        dirty: true,
      })),
    
    removeModifierGroup: (groupId) =>
      set((state) => ({
        modifiers: {
          ...state.modifiers,
          groups: state.modifiers.groups.filter((g) => g.id !== groupId),
        },
        dirty: true,
      })),
    
    updateModifierGroup: (groupId, changes) =>
      set((state) => ({
        modifiers: {
          ...state.modifiers,
          groups: state.modifiers.groups.map((g) =>
            g.id === groupId ? { ...g, ...changes } : g
          ),
        },
        dirty: true,
      })),
    
    // ========================================
    // AVAILABILITY
    // ========================================
    
    setAvailability: (changes) =>
      set((state) => ({
        availability: { ...state.availability, ...changes },
        dirty: true,
      })),
    
    // ========================================
    // MEDIA
    // ========================================
    
    setMedia: (changes) =>
      set((state) => ({
        media: { ...state.media, ...changes },
        dirty: true,
      })),
    
    // ========================================
    // VALIDATION
    // ========================================
    
    setValidationErrors: (errors) => set({ validationErrors: errors }),
    
    validate: () => {
      const state = get();
      const errors = {};
      
      if (!state.basicInfo.displayName?.trim()) {
        errors.basicInfo_displayName = 'Denumirea produsului este obligatorie.';
      }
      
      if (!state.basicInfo.categoryId) {
        errors.basicInfo_categoryId = 'Categoria este obligatorie.';
      }
      
      if (!state.pricing.basePrice || Number(state.pricing.basePrice) <= 0) {
        errors.pricing_basePrice = 'Prețul de bază trebuie completat.';
      }
      
      if (!state.portions.length) {
        errors.portions = 'Trebuie să definești cel puțin o porție.';
      }
      
      set({ validationErrors: errors });
      return { valid: Object.keys(errors).length === 0, errors };
    },
    
    // ========================================
    // LOAD DATA
    // ========================================
    
    loadInitialData: async ({ menuItemId, productId, restaurantId }) => {
      const { loading } = get();
      if (loading) return;
      
      set({ loading: true, validationErrors: {} });
      
      try {
        set({ restaurantId, productId, menuItemId });
        
        // Load reference data (mock for now - replace with real API)
        const categories = [
          { id: 1, name: 'Pizza' },
          { id: 2, name: 'Burgeri' },
          { id: 3, name: 'Paste' },
          { id: 4, name: 'Salate' },
          { id: 5, name: 'Deserturi' },
        ];
        
        const modifierGroupsAvailable = [
          { id: 1, name: 'Extra Ingrediente', type: 'multiple' },
          { id: 2, name: 'Alege Sosul', type: 'single' },
          { id: 3, name: 'Dimensiune Băutură', type: 'single' },
          { id: 4, name: 'Tip Cartofi', type: 'single' },
        ];
        
        set({ categories, modifierGroupsAvailable });
        
        if (!menuItemId) {
          // Create mode
          set({
            mode: 'create',
            loading: false,
            dirty: false,
          });
        } else {
          // Edit mode - load from API
          // TODO: Replace with real API call
          set({
            mode: 'edit',
            loading: false,
            dirty: false,
          });
        }
      } catch (err) {
        console.error('loadInitialData error', err);
        set({ loading: false });
      }
    },
    
    // ========================================
    // SAVE
    // ========================================
    
    save: async () => {
      const { validate } = get();
      const { valid } = validate();
      
      if (!valid) return { ok: false, reason: 'validation' };
      
      set({ saving: true });
      
      try {
        const state = get();
        
        // TODO: Replace with real API call
        const payload = {
          restaurantId: state.restaurantId,
          productId: state.productId,
          menuItemId: state.menuItemId,
          basicInfo: state.basicInfo,
          pricing: state.pricing,
          portions: state.portions,
          ingredientsSummary: state.ingredientsSummary,
          allergens: state.allergens,
          modifiers: state.modifiers,
          availability: state.availability,
          media: state.media,
        };
        
        console.log('Saving menu builder payload:', payload);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        set({
          saving: false,
          dirty: false,
        });
        
        return { ok: true, result: payload };
      } catch (err) {
        console.error('save error', err);
        set({ saving: false });
        return { ok: false, reason: 'server', error: err };
      }
    },
  }))
);

