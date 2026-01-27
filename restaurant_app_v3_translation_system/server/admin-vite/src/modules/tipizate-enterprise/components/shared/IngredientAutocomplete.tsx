import React, { useState, useEffect, useRef } from 'react';
import { httpClient } from '@/shared/api/httpClient';

interface Ingredient {
  id: number;
  name: string;
  name_en?: string;
  unit: string;
  current_stock?: number;
  min_stock?: number;
  category?: string;
  cost_per_unit?: number;
}

interface IngredientAutocompleteProps {
  value: string;
  onChange: (value: string, ingredient?: Ingredient) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const IngredientAutocomplete: React.FC<IngredientAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Caută ingredient...',
  className = '',
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value.length >= 2) {
      // Debounce search
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        searchIngredients(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const searchIngredients = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.get('/api/admin/ingredients');
      const ingredients = response.data?.data || response.data || [];
      
      // Filter ingredients by name
      const filtered = ingredients.filter((ing: Ingredient) =>
        ing.name.toLowerCase().includes(query.toLowerCase()) ||
        ing.name_en?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (err) {
      console.error('Error searching ingredients:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSelect = (ingredient: Ingredient) => {
    onChange(ingredient.name, ingredient);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((ingredient, index) => (
            <div
              key={ingredient.id}
              onClick={() => handleSelect(ingredient)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {ingredient.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {ingredient.unit} • {ingredient.category || 'Fără categorie'}
                {ingredient.cost_per_unit && ` • ${ingredient.cost_per_unit.toFixed(2)} RON/${ingredient.unit}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

