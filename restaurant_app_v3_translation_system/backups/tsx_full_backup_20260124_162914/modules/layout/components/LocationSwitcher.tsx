// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.4 - Location Switcher Component
 * 
 * Dropdown component for switching between restaurant locations.
 * Displays in navbar/topbar.
 */

import { useEffect, useState } from 'react';
import { useLocationStore } from '@/shared/store/locationStore';
import { httpClient } from '@/shared/api/httpClient';
import { useTheme } from '@/shared/context/ThemeContext';

interface Location {
  id: number;
  name: string;
  type: 'warehouse' | "Operațional";
  address?: string;
  is_active: boolean;
}

export const LocationSwitcher = () => {
//   const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    currentLocationId,
    currentLocation,
    availableLocations,
    isLoading,
    setCurrentLocation,
    loadLocations,
  } = useLocationStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load locations on mount
    if (availableLocations.length === 0) {
      console.log('LocationSwitcher Loading locations...');
      loadLocations().catch(err => {
        console.error('LocationSwitcher Error loading locations:', err);
      });
    }
  }, [availableLocations.length, loadLocations]);

  const handleLocationChange = async (locationId: number) => {
    setCurrentLocation(locationId);
    setIsOpen(false);
    
    // Update API header for future requests
    // This will be handled by API client interceptor
    // For now, we'll reload the page to apply new location context
    // TODO: Implement API client interceptor to add X-Location-ID header
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '6px 12px', 
        fontSize: '14px',
        color: theme.textMuted,
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (availableLocations.length === 0) {
    // Show loading state instead of null
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          padding: '4px 10px', 
          fontSize: '12px',
          height: '28px',
          color: theme.textMuted,
        }}>
          <span>Loading...</span>
        </div>
      );
    }
    // Only return null if not loading and no locations
    // This is expected behavior when no locations are configured yet
    // Changed from console.warn to console.log to reduce noise in console
    if (process.env.NODE_ENV === 'development') {
      console.log('LocationSwitcher No locations available - this is normal if locations are not configured yet');
    }
    return null;
  }

  if (availableLocations.length === 1) {
    // Only one location - just show name
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '6px 12px', 
        fontSize: '14px',
        color: theme.text,
        fontWeight: 500,
      }}>
        <span>{availableLocations[0].name}</span>
      </div>
    );
  }

  return (
    <div className="relative location-switcher-wrapper flex-shrink-0" style={{ zIndex: 1000 }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: 0,
          maxWidth: '200px',
          height: '36px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: 500,
          color: theme.text,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: `0 1px 3px ${theme.shadowColor}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.surfaceHover;
          e.currentTarget.style.boxShadow = `0 2px 6px ${theme.shadowColor}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.surface;
          e.currentTarget.style.boxShadow = `0 1px 3px ${theme.shadowColor}`;
        }}
        title={currentLocation?.name || 'Selectează locația'}
      >
        <span style={{ fontSize: '16px' }}>🏢</span>
        <span style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0,
          fontSize: '14px',
          fontWeight: 500,
          color: theme.text,
        }}>
          {currentLocation?.name || 'Locație'}
        </span>
        <svg
          style={{ 
            width: '16px',
            height: '16px',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: theme.text,
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '224px',
            background: theme.surface,
            borderRadius: '12px',
            boxShadow: `0 8px 24px ${theme.shadowColor}`,
            border: `1px solid ${theme.border}`,
            zIndex: 1001,
            maxHeight: '320px',
            overflowY: "Auto",
          }}>
            <div style={{ padding: '4px 0' }}>
              <div style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 600,
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: `1px solid ${theme.borderLight}`,
              }}>
                Selectează Locația
              </div>
              
              {availableLocations
                .filter(loc => loc.is_active)
                .map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationChange(location.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      background: location.id === currentLocationId ? theme.surfaceHover : 'transparent',
                      color: location.id === currentLocationId ? theme.accent : theme.text,
                      fontWeight: location.id === currentLocationId ? 600 : 400,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (location.id !== currentLocationId) {
                        e.currentTarget.style.background = theme.surfaceHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.id !== currentLocationId) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>
                        {location.type === 'warehouse' ? '📦' : location.type === "Operațional" ? '🏢' : '📍'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: 500, 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: location.id === currentLocationId ? theme.accent : theme.text,
                        }}>
                          {location.name}
                        </div>
                        {location.description && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: theme.textMuted, 
                            marginTop: '4px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {location.description}
                          </div>
                        )}
                      </div>
                      {location.id === currentLocationId && (
                        <svg
                          style={{
                            width: '16px',
                            height: '16px',
                            color: theme.accent,
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};


