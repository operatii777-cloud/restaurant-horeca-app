# Test Credentials for Restaurant HORECA Application

## Default Admin Credentials

### Admin Panel Access
- **URL**: http://localhost:3001/admin-vite/
- **Username**: `admin`
- **Password**: `admin`
- **PIN**: `1234`

### Legacy Admin
- **URL**: http://localhost:3001/admin.html
- **Username**: `admin`
- **Password**: `admin`

## Test User Credentials

### Mobile User (Customers)
- **Username**: `testuser`
- **Password**: `testpass123`
- **Phone**: `+40712345678`

### Kiosk User
- **PIN**: `1234`
- **Access**: http://localhost:3001/kiosk/

### POS Terminal
- **URL**: http://localhost:3001/legacy/orders/comanda.html
- **Username**: `admin`
- **Password**: `admin`

### Supervisor Stations (1-11)
- **URLs**: http://localhost:3001/legacy/orders/comanda-supervisor[1-11].html
- **Username**: `admin`
- **Password**: `admin`

### Delivery/Courier Interfaces
- **URL**: http://localhost:3001/legacy/delivery/livrare[1-3].html
- **Username**: `courier1` / `courier2` / `courier3`
- **Password**: `courier123`

## Database Access

### SQLite Database
- **Path**: `restaurant_app_v3_translation_system/server/restaurant.db`
- **Connection String**: `./restaurant.db`

## API Endpoints

### Health Checks
- **Server Health**: http://localhost:3001/health
- **API Health**: http://localhost:3001/api/health
- **Platform Stats**: http://localhost:3001/api/platform-stats

### Authentication
- **Admin Login**: POST http://localhost:3001/api/admin/login
- **Mobile Login**: POST http://localhost:3001/api/mobile/auth/login
- **Kiosk Auth**: POST http://localhost:3001/api/kiosk/auth

### Main APIs
- **Orders**: http://localhost:3001/api/orders
- **Products**: http://localhost:3001/api/products
- **Inventory**: http://localhost:3001/api/admin/inventory
- **Reports**: http://localhost:3001/api/admin/reports
- **Catalog**: http://localhost:3001/api/catalog/products

## Security Configuration

### CORS Settings
- **Development**: All origins allowed (`*`)
- **Production**: Configure `CORS_ORIGINS` in `.env`

### Session Configuration
- **Secret**: Configured in `.env` (SESSION_SECRET)
- **JWT Secret**: Configured in `.env` (JWT_SECRET)
- **JWT Refresh**: Configured in `.env` (JWT_REFRESH_SECRET)

### Rate Limiting
- **Enabled**: Yes
- **Max Requests**: 100 per 15 minutes per IP

## Testing Modes

### Development Mode
```bash
NODE_ENV=development npm start
```

### Production Mode
```bash
NODE_ENV=production npm start
```

### Debug Mode
```bash
DEBUG=true NODE_ENV=development npm start
```

## Notes

1. **Default credentials should be changed in production**
2. All passwords use `pbkdf2` hashing with salt
3. PINs use `scrypt` hashing with salt
4. Session cookies are HTTP-only and secure in production
5. MFA (Multi-Factor Authentication) is available but disabled by default

## Reset Instructions

### Reset Admin Password
```bash
cd restaurant_app_v3_translation_system/server
node reset-admin.js
```

### Reset Mobile User
```bash
cd restaurant_app_v3_translation_system/server
node reset-mobile-user.js
```

### Clear Database and Reinitialize
```bash
cd restaurant_app_v3_translation_system/server
rm restaurant.db
npm start  # Will auto-initialize database
```

---
**Last Updated**: 2026-02-15
**Status**: Testing Configuration
