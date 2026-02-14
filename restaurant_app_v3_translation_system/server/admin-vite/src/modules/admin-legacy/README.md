# Legacy Admin Pages - React Components

This directory contains React components that are refactored versions of the legacy HTML admin files.

## Components

### 1. AdminPage (`/legacy/admin`)
Refactored from `admin.html`, this component provides a comprehensive admin interface with:
- Dashboard with analytics
- Menu management
- Waiter management  
- Stock management
- Internal messaging
- PDF builder for technical sheets

**Route**: `/legacy/admin` or `/admin-vite/legacy/admin`

**Import**:
```typescript
import { AdminPage } from '@/modules/admin-legacy';
```

### 2. AdminAdvancedPage (`/legacy/admin-advanced`)
Refactored from `admin-advanced.html`, this component provides advanced admin features:
- Executive dashboard
- Fiscal document management
- Order management with status tracking
- Advanced inventory management
- Portion control
- Variance reporting
- Advanced reporting

**Route**: `/legacy/admin-advanced` or `/admin-vite/legacy/admin-advanced`

**Import**:
```typescript
import { AdminAdvancedPage } from '@/modules/admin-legacy';
```

## Technology Stack

- **React** - Modern UI library
- **Vite** - Build tool and dev server
- **AG Grid** - Data grid for tabular data (via existing components)
- **Bootstrap 5** - UI framework for responsive design
- **Custom CSS** - Additional styling with gradients and animations
- **TypeScript** - Type safety

## Features

### AdminPage Features
- **Sidebar Navigation**: Quick access to different sections
- **Module Integration**: Leverages existing React modules:
  - DashboardPage
  - MenuManagementPage
  - WaitersPage
  - StockManagementPage
  - InternalMessagingPage
  - MenuPDFBuilderPage
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: CSS transitions for better UX

### AdminAdvancedPage Features
- **Advanced Navigation**: Professional-grade sidebar
- **Executive Dashboard**: High-level business metrics
- **Module Integration**: Leverages existing React modules:
  - ExecutiveDashboardPage
  - OrdersManagementPage
  - InventoryDashboardPage
  - AdvancedStockDashboardPage
  - PortionsPage
  - VarianceReportsPage
  - AdvancedReportsPage
- **Professional Styling**: Gradient backgrounds and modern design
- **Responsive Design**: Optimized for all screen sizes

## Usage

### Basic Usage

1. Navigate to the route in your browser:
   ```
   http://localhost:5173/admin-vite/legacy/admin
   http://localhost:5173/admin-vite/legacy/admin-advanced
   ```

2. Or import and use in your own components:
   ```typescript
   import { AdminPage, AdminAdvancedPage } from '@/modules/admin-legacy';
   
   function MyComponent() {
     return <AdminPage />;
   }
   ```

### Importing Individual Sections

The components use existing modular pages, so you can also import those directly:

```typescript
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import { MenuManagementPage } from '@/modules/menu/pages/MenuManagementPage';
// etc.
```

## Migration from Legacy HTML

These components replace the following legacy files:
- `public/legacy/admin/admin.html` → `AdminPage.tsx`
- `public/legacy/admin/admin-advanced.html` → `AdminAdvancedPage.tsx`

### Key Improvements Over Legacy HTML

1. **React Component Architecture**: Modular, reusable, testable
2. **TypeScript**: Type safety and better IDE support
3. **Modern Build System**: Vite for fast development and optimized builds
4. **AG Grid Integration**: Via existing DataGrid components
5. **Consistent Styling**: Bootstrap + custom CSS for professional look
6. **Better State Management**: React hooks and context
7. **Real-time Updates**: Integration with existing socket infrastructure
8. **Accessibility**: Better keyboard navigation and ARIA support

## Development

To add new features or modify these components:

1. Navigate to the module directory:
   ```bash
   cd src/modules/admin-legacy
   ```

2. Edit the component files:
   - `pages/AdminPage.tsx` - Main admin page
   - `pages/AdminAdvancedPage.tsx` - Advanced admin page
   - `pages/AdminPage.css` - Admin page styles
   - `pages/AdminAdvancedPage.css` - Advanced admin styles

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
src/modules/admin-legacy/
├── index.ts                          # Module exports
├── pages/
│   ├── AdminPage.tsx                 # Main admin component
│   ├── AdminPage.css                 # Main admin styles
│   ├── AdminAdvancedPage.tsx         # Advanced admin component
│   └── AdminAdvancedPage.css         # Advanced admin styles
└── components/                       # Future: shared components
```

## Notes

- These components are designed to be **importable when needed**
- They leverage **existing modules** to avoid code duplication
- The sidebar navigation provides quick access to all sections
- All routes are prefixed with `/legacy/` to distinguish them from new features
- The components use the same API endpoints as the original HTML files

## Future Enhancements

Potential improvements for future versions:
- Add full CRUD operations for fiscal documents
- Implement ANAF integration UI
- Add real-time notifications for order updates
- Enhance accessibility features
- Add unit tests for components
- Add E2E tests for critical workflows
