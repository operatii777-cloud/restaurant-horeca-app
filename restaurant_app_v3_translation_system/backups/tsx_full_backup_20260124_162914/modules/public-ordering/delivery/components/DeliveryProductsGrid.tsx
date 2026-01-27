// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 2 - Delivery Products Grid
 * Displays products in a grid layout, matching comanda_delivery.html design
 */

import type { DeliveryProduct } from "../../api/types";
import { useState, useEffect } from 'react';

import { useDeliveryCart } from '../hooks/useDeliveryCart';
import { httpClient } from '@/shared/api/httpClient';
import { useDailyOffer } from '../../../kiosk/hooks/useDailyOffer';
import { useDailyMenu } from '../../../kiosk/hooks/useDailyMenu';

export function DeliveryProductsGrid() {
//   const { t } = useTranslation();
  const [products, setProducts] = useState<DeliveryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useDeliveryCart();
  const { dailyOffer, checkEligibility } = useDailyOffer();
  const { dailyMenu } = useDailyMenu();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Use the same endpoint as comanda.html
      const lang = 'ro'; // Can be made dynamic later
      const response = await httpClient.get(`/api/menu/all?lang="Lang"`);
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: DeliveryProduct) => {
    addItem(product, 1, []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-gray-600">"se incarca produsele"</div>
      </div>
    );
  }

  // Handle Daily Menu add to cart
  const handleAddDailyMenuToCart = () => {
    if (dailyMenu) {
      // Add soup
      if (dailyMenu.soup) {
        addItem({
          id: dailyMenu.soup.id,
          name: dailyMenu.soup.name,
          price: dailyMenu.soup.price,
          category: dailyMenu.soup.category,
          image_url: dailyMenu.soup.image_url,
          description: dailyMenu.soup.description
        } as DeliveryProduct, 1, []);
      }
      // Add main course
      if (dailyMenu.mainCourse) {
        addItem({
          id: dailyMenu.mainCourse.id,
          name: dailyMenu.mainCourse.name,
          price: dailyMenu.mainCourse.price,
          category: dailyMenu.mainCourse.category,
          image_url: dailyMenu.mainCourse.image_url,
          description: dailyMenu.mainCourse.description
        } as DeliveryProduct, 1, []);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Daily Offer Banner */}
      {dailyOffer && dailyOffer.is_active && (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                <i className="fas fa-star mr-2"></i>
                {dailyOffer.title}
              </h3>
              <p className="text-white text-sm">{dailyOffer.description}</p>
            </div>
            <div className="text-3xl">🎁</div>
          </div>
        </div>
      )}

      {/* Daily Menu Banner */}
      {dailyMenu && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                <i className="fas fa-utensils mr-2"></i>
                Meniul Zilei
              </h3>
              <div className="text-white text-sm space-y-1">
                {dailyMenu.soup && (
                  <div>🍲 {dailyMenu.soup.name} - {dailyMenu.soup.price.toFixed(2)} RON</div>
                )}
                {dailyMenu.mainCourse && (
                  <div>🍽️ {dailyMenu.mainCourse.name} - {dailyMenu.mainCourse.price.toFixed(2)} RON</div>
                )}
                {dailyMenu.discount > 0 && (
                  <div className="font-bold mt-2">
                    💰 Discount: {dailyMenu.discount}% la meniul complet!
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleAddDailyMenuToCart}
              className="ml-4 px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-cart-plus mr-2"></i>"adauga meniu"</button>
          </div>
        </div>
      )}

      {/* Search and Category Filter */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="cauta produse"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
        />
        
        {/* Category buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#FF6347] text-white font-bold'
                : 'bg-[#FF8C00] text-white hover:bg-[#FF6347]'
            }`}
          >"Toate"</button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-[#FF6347] text-white font-bold'
                  : 'bg-[#FF8C00] text-white hover:bg-[#FF6347]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-[15px] p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_4px_15px_rgba(32,178,170,0.3)]"
          >
            {/* Product Image */}
            <div className="w-full h-[120px] bg-gray-100 rounded-[10px] mb-4 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-[10px]"
                />
              ) : (
                <span className="text-5xl">🤗</span>
              )}
            </div>

            {/* Product Info */}
            <div className="mb-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{product.name}</h3>
                <div className="text-lg font-bold text-[#20B2AA] ml-2">
                  {product.price.toFixed(2)} RON
                </div>
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-[#ff6b35] text-white border-2 border-[#ff6b35] rounded-lg py-2.5 px-4 font-bold transition-all hover:bg-[#e55a2b] hover:border-[#e55a2b] hover:shadow-[0_8px_20px_rgba(229,90,43,0.4)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <i className="fas fa-cart-plus mr-2"></i>"adauga in cos"</button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-600">"nu s au gasit produse"</div>
      )}
    </div>
  );
}




