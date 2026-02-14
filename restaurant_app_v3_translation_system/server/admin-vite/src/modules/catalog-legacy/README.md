# Legacy Catalog Pages - React Components

This directory contains React components that are refactored versions of the legacy HTML catalog files.

## Components

### 1. CatalogRetetePage (`/legacy/catalog-retete`)
Refactored from `admin-catalog-retete.html`, this component provides a comprehensive recipe catalog with:
- **Rețete Tab**: Recipe management (leveraging existing RecipesPage)
- **Alergeni Tab**: Allergen management (14 predefined allergens)
- **Aditivi Tab**: Food additives management (E-codes: colorants, preservatives)

**Route**: `/legacy/catalog-retete` or `/admin-vite/legacy/catalog-retete`

**Import**:
```typescript
import { CatalogRetetePage } from '@/modules/catalog-legacy';
```

### 2. CatalogIngredientePage (`/legacy/catalog-ingrediente`)
Refactored from `admin-catalog-ingrediente.html`, this component provides ingredient catalog with:
- **Ingrediente Tab**: Ingredient management (leveraging existing IngredientsPage)
- **Alergeni Tab**: Allergen database
- **Aditivi Tab**: Food additives database (E-codes)

**Route**: `/legacy/catalog-ingrediente` or `/admin-vite/legacy/catalog-ingrediente`

**Import**:
```typescript
import { CatalogIngredientePage } from '@/modules/catalog-legacy';
```

## Technology Stack

- **React** - Modern UI library
- **Vite** - Build tool and dev server
- **AG Grid** - Data grid for tabular data (via existing RecipesPage and IngredientsPage)
- **Bootstrap 5** - UI framework for responsive design
- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS** - Additional styling with gradients and animations
- **TypeScript** - Type safety

## Features

### CatalogRetetePage Features
- **Tabbed Interface**: Easy navigation between Recipes, Allergens, and Additives
- **Recipe Management**: Full CRUD operations via existing RecipesPage
- **Allergen Tracking**: 14 predefined allergens (gluten, lactose, eggs, etc.)
- **Additives Management**: E-code database for food additives
- **Template Import/Export**: Bulk operations for recipes
- **Gradient Design**: Modern purple gradient theme

### CatalogIngredientePage Features
- **Tabbed Interface**: Ingredients, Allergens, and Additives tabs
- **Ingredient Management**: Full CRUD operations via existing IngredientsPage
- **Allergen Database**: Complete allergen tracking system
- **Additives Database**: E-codes with categories
- **Bulk Import/Export**: Template-based data operations
- **Synchronization**: Sync with external databases
- **Modern Design**: Purple gradient with smooth animations

## Usage

### Basic Usage

1. Navigate to the route in your browser:
   ```
   http://localhost:5173/admin-vite/legacy/catalog-retete
   http://localhost:5173/admin-vite/legacy/catalog-ingrediente
   ```

2. Or import and use in your own components:
   ```typescript
   import { CatalogRetetePage, CatalogIngredientePage } from '@/modules/catalog-legacy';
   
   function MyComponent() {
     return <CatalogRetetePage />;
   }
   ```

### Importing Individual Components

The catalog pages leverage existing components:

```typescript
import { RecipesPage } from '@/modules/recipes/pages/RecipesPage';
import { IngredientsPage } from '@/modules/ingredients/pages/IngredientsPage';
import { AllergensPage } from '@/modules/stocks/allergens/pages/AllergensPage';
```

## Tab Navigation

Both components use a simple tab system:

```typescript
const [activeTab, setActiveTab] = useState<'recipes' | 'allergens' | 'additives'>('recipes');
```

Users can switch between tabs by clicking the navigation pills.

## Migration from Legacy HTML

These components replace the following legacy files:
- `public/legacy/admin/admin-catalog-retete.html` → `CatalogRetetePage.tsx`
- `public/legacy/admin/admin-catalog-ingrediente.html` → `CatalogIngredientePage.tsx`

### Key Improvements Over Legacy HTML

1. **React Component Architecture**: Modular, reusable, testable
2. **TypeScript**: Type safety and better IDE support
3. **Modern Build System**: Vite for fast development and optimized builds
4. **AG Grid Integration**: Via existing RecipesPage and IngredientsPage
5. **Consistent Styling**: Bootstrap + Tailwind + custom CSS
6. **Better State Management**: React hooks for tab navigation
7. **Component Reuse**: Leverages existing pages to avoid duplication
8. **Accessibility**: Better keyboard navigation and ARIA support

## Features from Legacy HTML

### Implemented
✅ Recipe catalog with filtering
✅ Ingredient catalog with search
✅ Allergen management tab
✅ Tabbed navigation interface
✅ Modern gradient design
✅ Export/Import buttons (UI ready)

### Planned
🔄 Food additives (E-codes) full implementation
🔄 Template-based import system
🔄 Bulk operations for recipes/ingredients
🔄 Advanced filtering by industry/category
🔄 Margin calculation and statistics

## Development

To add new features or modify these components:

1. Navigate to the module directory:
   ```bash
   cd src/modules/catalog-legacy
   ```

2. Edit the component files:
   - `pages/CatalogRetetePage.tsx` - Recipe catalog component
   - `pages/CatalogIngredientePage.tsx` - Ingredient catalog component
   - `pages/CatalogRetetePage.css` - Recipe catalog styles
   - `pages/CatalogIngredientePage.css` - Ingredient catalog styles

3. Test your changes:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## File Structure

```
src/modules/catalog-legacy/
├── index.ts                              # Module exports
├── pages/
│   ├── CatalogRetetePage.tsx             # Recipe catalog component
│   ├── CatalogRetetePage.css             # Recipe catalog styles
│   ├── CatalogIngredientePage.tsx        # Ingredient catalog component
│   └── CatalogIngredientePage.css        # Ingredient catalog styles
└── components/                           # Future: shared components
    └── AdditivesManager.tsx              # Placeholder for E-codes management
```

## Styling

Both components use a consistent gradient theme:

- **Background**: Purple gradient (`#667eea` to `#764ba2`)
- **Active tabs**: Same gradient on navigation pills
- **Buttons**: Matching color scheme with hover effects
- **Animations**: Smooth fade-in transitions between tabs

## Notes

- These components are designed to be **importable when needed**
- They leverage **existing modules** (RecipesPage, IngredientsPage, AllergensPage)
- The tabbed interface provides clean separation of concerns
- All routes are prefixed with `/legacy/` to distinguish them from new features
- The components use the same API endpoints as the original HTML files

## Future Enhancements

Potential improvements for future versions:
- Implement full E-codes database with search and filtering
- Add template import/export functionality
- Implement bulk update operations
- Add margin calculation for recipes
- Enhance allergen tracking with real-time alerts
- Add nutritional value calculations
- Implement waste classification system
- Add supplier integration for ingredients
- Create mobile-responsive views
- Add unit tests for components
- Add E2E tests for critical workflows

## API Integration

The components integrate with existing API endpoints:

- `/api/recipes` - Recipe CRUD operations
- `/api/ingredients` - Ingredient CRUD operations
- `/api/allergens` - Allergen management
- `/api/additives` - Food additives (E-codes) - planned

## Allergen Support

14 predefined allergens:
1. Gluten
2. Crustaceans
3. Eggs
4. Fish
5. Peanuts
6. Soybeans
7. Milk/Lactose
8. Nuts
9. Celery
10. Mustard
11. Sesame seeds
12. Sulfites
13. Lupin
14. Mollusks
