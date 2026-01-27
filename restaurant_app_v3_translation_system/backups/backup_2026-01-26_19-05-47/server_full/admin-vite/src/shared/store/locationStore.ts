// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.4 - Location Store (Zustand)
 * 
 * Manages current location/restaurant selection in the frontend.
 * Persists to localStorage for persistence across sessions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Location {
  id: number;
  name: string;
  type: 'warehouse' | "Operațional";
  address?: string;
  is_active: boolean;
}

interface LocationState {
  currentLocationId: number | null;
  currentLocation: Location | null;
  availableLocations: Location[];
  isLoading: boolean;
  
  // Actions
  setCurrentLocation: (locationId: number) => void;
  setAvailableLocations: (locations: Location[]) => void;
  loadLocations: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocationId: null,
      currentLocation: null,
      availableLocations: [],
      isLoading: false,

      setCurrentLocation: (locationId: number) => {
        const location = get().availableLocations.find(loc => loc.id === locationId);
        set({ 
          currentLocationId: locationId,
          currentLocation: location || null 
        });
        
        // Update localStorage and send to backend
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentLocationId', locationId.toString());
          
          // Update API header for future requests
          // This will be handled by API client interceptor
        }
      },

      setAvailableLocations: (locations: Location[]) => {
        set({ availableLocations: locations });
        
        // If no current location is set, use first active location
        const currentId = get().currentLocationId;
        if (!currentId && locations.length > 0) {
          const firstActive = locations.find(loc => loc.is_active) || locations[0];
          if (firstActive) {
            set({ 
              currentLocationId: firstActive.id,
              currentLocation: firstActive 
            });
          }
        }
      },

      loadLocations: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/settings/locations');
          if (!response.ok) throw new Error('Failed to load locations');
          
          const data = await response.json();
          const locations: Location[] = data.locations || [];
          
          set({ 
            availableLocations: locations,
            isLoading: false 
          });
          
          // Restore current location from localStorage or use first active
          const savedLocationId = localStorage.getItem('currentLocationId');
          if (savedLocationId) {
            const locationId = parseInt(savedLocationId);
            const location = locations.find(loc => loc.id === locationId);
            if (location && location.is_active) {
              set({ 
                currentLocationId: locationId,
                currentLocation: location 
              });
            } else {
              // Use first active location
              const firstActive = locations.find(loc => loc.is_active);
              if (firstActive) {
                set({ 
                  currentLocationId: firstActive.id,
                  currentLocation: firstActive 
                });
              }
            }
          } else {
            // Use first active location
            const firstActive = locations.find(loc => loc.is_active);
            if (firstActive) {
              set({ 
                currentLocationId: firstActive.id,
                currentLocation: firstActive 
              });
            }
          }
        } catch (error) {
          console.error('LocationStore Error loading locations:', error);
          set({ isLoading: false });
        }
      },

      refreshLocation: async () => {
        const currentId = get().currentLocationId;
        if (!currentId) return;
        
        try {
          const response = await fetch(`/api/settings/locations/${currentId}`);
          if (!response.ok) throw new Error('Failed to refresh location');
          
          const data = await response.json();
          const location: Location = data.location;
          
          set({ currentLocation: location });
          
          // Update in available locations array
          const locations = get().availableLocations.map(loc =>
            loc.id === location.id ? location : loc
          );
          set({ availableLocations: locations });
        } catch (error) {
          console.error('LocationStore Error refreshing location:', error);
        }
      },
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({
        currentLocationId: state.currentLocationId,
      }),
    }
  )
);



