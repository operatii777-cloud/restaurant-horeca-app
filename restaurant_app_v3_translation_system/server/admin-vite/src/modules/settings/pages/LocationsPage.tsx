// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA MT.5 - Locations Management Page
 * 
 * CRUD interface for managing restaurant locations.
 */

import { useState, useEffect } from 'react';
import { httpClient } from '@/shared/api/httpClient';
import { useLocationStore } from '@/shared/store/locationStore';
import { HelpButton } from '@/shared/components/HelpButton';

interface Location {
  id: number;
  name: string;
  type: 'warehouse' | 'operational';
  description?: string;
  is_active: boolean;
  can_receive_deliveries: boolean;
  can_transfer_out: boolean;
  can_transfer_in: boolean;
  can_consume: boolean;
  manager_name?: string;
  created_at?: string;
  updated_at?: string;
}

export const LocationsPage = () => {
//   const { t } = useTranslation();
  const { loadLocations, availableLocations } = useLocationStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    type: 'operational',
    description: '',
    can_receive_deliveries: false,
    can_transfer_out: true,
    can_transfer_in: true,
    can_consume: false,
    manager_name: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await httpClient.get('/api/settings/locations');
      if (response.data?.success) {
        setLocations(response.data.locations || []);
        // Update store
        if (response.data.locations) {
          useLocationStore.getState().setAvailableLocations(response.data.locations);
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      type: 'operational',
      description: '',
      can_receive_deliveries: false,
      can_transfer_out: true,
      can_transfer_in: true,
      can_consume: false,
      manager_name: '',
    });
    setShowModal(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      description: location.description || '',
      can_receive_deliveries: location.can_receive_deliveries === 1 || location.can_receive_deliveries === true,
      can_transfer_out: location.can_transfer_out === 1 || location.can_transfer_out === true,
      can_transfer_in: location.can_transfer_in === 1 || location.can_transfer_in === true,
      can_consume: location.can_consume === 1 || location.can_consume === true,
      manager_name: location.manager_name || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingLocation) {
        // Update
        const response = await httpClient.put(`/api/settings/locations/${editingLocation.id}`, formData);
        if (response.data?.location) {
          // Update local state
          setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? response.data.location : loc));
        }
      } else {
        // Create
        const response = await httpClient.post('/api/settings/locations', formData);
        if (response.data?.location) {
          // Add to local state
          setLocations(prev => [...prev, response.data.location]);
        }
      }
      setShowModal(false);
      fetchLocations();
      loadLocations(); // Refresh store
    } catch (error: any) {
      console.error('Error saving location:', error);
      alert(error.response?.data?.error || 'Error saving location');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this location?')) {
      return;
    }
    try {
      await httpClient.delete(`/api/settings/locations/"Id"`);
      fetchLocations();
      loadLocations(); // Refresh store
    } catch (error: any) {
      console.error('Error deleting location:', error);
      alert(error.response?.data?.error || 'Error deleting location');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await httpClient.post(`/api/settings/locations/"Id"/deactivate`);
      } else {
        await httpClient.post(`/api/settings/locations/"Id"/activate`);
      }
      // Update local state immediately
      setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, is_active: !isActive } : loc));
      fetchLocations(); // Refresh from server
      loadLocations(); // Refresh store
    } catch (error: any) {
      console.error('Error toggling location:', error);
      alert(error.response?.data?.error || 'Error toggling location');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Locations Management</h1>
          <p className="text-gray-600 mt-1">Gestionare locații restaurant: depozite și unități operaționale</p>
        </div>
        <div className="flex gap-2">
          <HelpButton
            title="ajutor gestionare locatii"
            content={
              <div>
                <h5>📍 Ce este Gestionarea Locațiilor?</h5>
                <p>
                  Gestionarea locațiilor permite crearea și administrarea locațiilor restaurantului, 
                  inclusiv depozite și unități operaționale, cu control granular asupra capabilităților fiecărei locații.
                </p>
                <h5 className="mt-4">🏢 Tipuri de locații</h5>
                <ul>
                  <li><strong>Depozit (Warehouse)</strong> - Locație pentru stocare și distribuție</li>
                  <li><strong>Operațional (Operational)</strong> - Locație pentru operațiuni zilnice (restaurant, bar, etc.)</li>
                </ul>
                <h5 className="mt-4">⚙️ Capabilități disponibile</h5>
                <ul>
                  <li><strong>"poate primi livrari"</strong> - Locația poate primi livrări de la furnizori</li>
                  <li><strong>"poate transfera in afara"</strong> - Locația poate transfera stocuri către alte locații</li>
                  <li><strong>"poate transfera inauntru"</strong> - Locația poate primi transferuri de la alte locații</li>
                  <li><strong>Poate consuma</strong> - Locația poate consuma stocuri (pentru preparare, etc.)</li>
                </ul>
                <h5 className="mt-4">📋 Funcționalități</h5>
                <ul>
                  <li><strong>"creare locatie"</strong> - Adaugă locații noi cu nume, tip și capabilități</li>
                  <li><strong>"editare locatie"</strong> - Modifică informațiile locațiilor existenți</li>
                  <li><strong>Activare/Dezactivare</strong> - Activează sau dezactivează locații</li>
                  <li><strong>Manager</strong> - Asignează un manager pentru fiecare locație</li>
                </ul>
                <div className="alert alert-info mt-4">
                  <strong>💡 Sfat:</strong> Configurează capabilitățile fiecărei locații în funcție de rolul său. 
                  De exemplu, un depozit poate primi livrări și transfera, dar nu consuma.
                </div>
              </div>
            }
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Location
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`border rounded-lg p-4 ${
              location.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{location.name}</h3>
                <span className="text-sm text-gray-600 capitalize">{location.type}</span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  location.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {location.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {location.description && (
              <p className="text-sm text-gray-600 mb-2">{location.description}</p>
            )}

            {location.manager_name && (
              <p className="text-sm text-gray-600 mb-2">Manager: {location.manager_name}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {location.can_receive_deliveries && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">"Deliveries"</span>
              )}
              {location.can_transfer_out && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Transfer Out
                </span>
              )}
              {location.can_transfer_in && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Transfer In
                </span>
              )}
              {location.can_consume && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                  Consume
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(location)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(location.id, location.is_active)}
                className={`px-3 py-1 text-sm rounded ${
                  location.is_active
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {location.is_active ? 'Deactivate' : 'Activate'}
              </button>
              {!location.is_active && (
                <button
                  onClick={() => handleDelete(location.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >"Delete"</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingLocation ? 'Edit Location' : 'Create Location'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'warehouse' | 'operational' })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="operational">Operational</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">"Description"</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Manager Name</label>
                <input
                  type="text"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Capabilities</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.can_receive_deliveries}
                    onChange={(e) =>
                      setFormData({ ...formData, can_receive_deliveries: e.target.checked })
                    }
                    className="mr-2"
                  />"can receive deliveries"</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.can_transfer_out}
                    onChange={(e) =>
                      setFormData({ ...formData, can_transfer_out: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Can Transfer Out
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.can_transfer_in}
                    onChange={(e) =>
                      setFormData({ ...formData, can_transfer_in: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Can Transfer In
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.can_consume}
                    onChange={(e) =>
                      setFormData({ ...formData, can_consume: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Can Consume
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



