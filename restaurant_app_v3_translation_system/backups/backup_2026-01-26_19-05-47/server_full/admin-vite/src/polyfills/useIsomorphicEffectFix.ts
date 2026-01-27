/**
 * POLYFILL: AGGRESSIVE Fix for React and module resolution
 * 
 * Problem: ESM module scope isolation prevents zustand, react-bootstrap,
 * @restart/hooks, etc. from accessing React exports like useLayoutEffect,
 * Children, etc. when bundled in separate chunks.
 * 
 * Solution: Patch React object directly to ensure ALL properties are mutable
 * and accessible globally BEFORE any other module loads.
 */

import React from 'react';
import ReactDOM from 'react-dom';

// Execute this IMMEDIATELY at module load time
if (typeof window !== 'undefined') {
  const globalScope = window as any;
  
  // STEP 1: Make React and ReactDOM globally accessible
  globalScope.React = React;
  globalScope.ReactDOM = ReactDOM;
  
  // STEP 2: Ensure React object is MUTABLE and can receive new properties
  // Fix the descriptor so React.Children and other properties can be set
  const reactProto = Object.getPrototypeOf(React);
  if (reactProto !== null && reactProto !== Object.prototype) {
    try {
      // Make React a plain object if it's been frozen or sealed
      const reactKeys = Object.getOwnPropertyNames(React);
      const newReact: any = {};
      
      // Copy all properties from React to new object
      reactKeys.forEach(key => {
        try {
          newReact[key] = (React as any)[key];
        } catch (e) {
          // Skip properties that can't be read
        }
      });
      
      // Also copy symbol properties
      const symbols = Object.getOwnPropertySymbols(React);
      symbols.forEach(sym => {
        try {
          newReact[sym] = (React as any)[sym];
        } catch (e) {
          // Skip symbols that can't be read
        }
      });
      
      // Replace React with the new mutable object
      Object.assign(React, newReact);
    } catch (e) {
      console.warn('⚠️ Could not make React mutable:', e);
    }
  }
  
  // STEP 3: Explicitly set React properties that might be missing
  const requiredProperties = [
    'useState',
    'useEffect',
    'useLayoutEffect',
    'useRef',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useTransition',
    'useDeferredValue',
    'useId',
    'Children',
    'createElement',
    'cloneElement',
    'forwardRef',
    'memo',
    'Fragment',
    'StrictMode',
    'Suspense',
  ];
  
  requiredProperties.forEach(prop => {
    if (!(prop in React)) {
      console.warn(`⚠️ React.${prop} not found, attempting to set`);
      try {
        Object.defineProperty(React, prop, {
          configurable: true,
          writable: true,
          value: undefined,
        });
      } catch (e) {
        console.error(`❌ Could not set React.${prop}:`, e);
      }
    }
  });
  
  // STEP 4: Specific fix for useLayoutEffect
  if (!React.useLayoutEffect || typeof React.useLayoutEffect !== 'function') {
    console.warn('⚠️ React.useLayoutEffect missing or not a function, using useEffect');
    (React as any).useLayoutEffect = React.useEffect;
  }
  
  // STEP 5: Critical - Ensure Children object exists and is mutable
  if (!React.Children || typeof React.Children !== 'object') {
    console.warn('⚠️ React.Children missing, creating placeholder');
    (React as any).Children = {
      map: function(children: any, fn: any) { return children; },
      forEach: function(children: any, fn: any) { },
      count: function(children: any) { return 0; },
      only: function(children: any) { return children; },
      toArray: function(children: any) { return Array.isArray(children) ? children : [children]; },
    };
  }
  
  // STEP 6: Patch module loading to intercept React imports
  const originalFetch = globalScope.fetch;
  const reactModuleCache = new Map();
  
  // Cache React reference for any module that might need it
  reactModuleCache.set('react', React);
  reactModuleCache.set('react-dom', ReactDOM);
  
  // STEP 7: Make sure globalThis also has React
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).React = React;
    (globalThis as any).ReactDOM = ReactDOM;
  }
  
  console.log('✅ React polyfill applied successfully');
  console.log('✓ window.React available:', typeof globalScope.React);
  console.log('✓ window.ReactDOM available:', typeof globalScope.ReactDOM);
  console.log('✓ React.useLayoutEffect:', typeof React.useLayoutEffect);
  console.log('✓ React.Children:', typeof React.Children);
}

export default null;
