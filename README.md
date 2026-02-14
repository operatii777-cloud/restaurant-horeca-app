# Restaurant HORECA App

🍽️ Comprehensive Restaurant Management System with Admin Panel, POS, Kiosk, and Mobile Apps

## Quick Start

After cloning this repository, simply run the setup script to install all dependencies, configure the environment, and build the application:

### Linux / macOS

```bash
./setup.sh
```

### Windows

```cmd
setup.bat
```

The setup script will:
- ✅ Install all npm dependencies (backend + frontend)
- ✅ Create .env configuration file with default values
- ✅ Build the frontend (admin-vite) application
- ✅ Prepare database initialization (automatic on first run)

## Starting the Application

After running the setup script:

### Development Mode

```bash
cd restaurant_app_v3_translation_system/server
npm start
```

The server will start on `http://localhost:3001`

### Development with Hot-Reload (Recommended for Frontend Development)

**Terminal 1 - Backend:**
```bash
cd restaurant_app_v3_translation_system/server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd restaurant_app_v3_translation_system/server/admin-vite
npm run dev
```

### Production Mode

```bash
cd restaurant_app_v3_translation_system/server
NODE_ENV=production npm start
```

## Access Points

- **Admin Panel (React/Vite):** http://localhost:3001/admin-vite/
- **Legacy Admin:** http://localhost:3001/admin.html
- **Kiosk Interface:** http://localhost:3001/kiosk/
- **API Endpoints:** http://localhost:3001/api/

## System Requirements

- **Node.js:** Version 18 or higher
- **npm:** Version 8 or higher
- **Operating System:** Windows, macOS, or Linux
- **Database:** SQLite (included, no external DB required)

## Architecture Overview

### Backend
- **Framework:** Node.js + Express
- **Database:** SQLite with automatic initialization
- **Real-time:** Socket.IO for live updates
- **API:** RESTful endpoints for all operations

### Frontend (Admin-Vite)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Components:** React Bootstrap, AG Grid
- **State Management:** React Query + Zustand
- **Routing:** React Router v6

### Features
- 📊 Complete restaurant management dashboard
- 🍕 Menu and recipe management
- 📦 Stock and inventory tracking
- 🧾 Orders and invoices
- 👥 Staff and user management
- 📱 POS and Kiosk interfaces
- 🚚 Delivery and courier management
- 📈 Business intelligence and reporting
- 🔒 HACCP compliance and food safety
- 🏷️ Allergen tracking
- 💰 Financial reporting (SAF-T, SAGA export)

## Configuration

The setup script creates a `.env` file with default values. You can customize it by editing:

```bash
restaurant_app_v3_translation_system/server/.env
```

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development          # development | production
PORT=3001                     # Server port
TZ=Europe/Bucharest          # Timezone

# Database Configuration
DATABASE_PATH=./restaurant.db # SQLite database path

# Session Configuration
SESSION_SECRET=your-secret-here  # Change in production!

# Optional: Redis Queue (if using)
# REDIS_URL=redis://127.0.0.1:6379

# Optional: API Configuration
# API_BASE=http://localhost:3001
```

## Database

The application uses **SQLite** for data storage. The database is automatically initialized on first server start with all required tables:

- Products, Categories, Menu Items
- Orders, Deliveries, Invoices
- Stock, Inventory, Suppliers
- Users, Permissions, Sessions
- HACCP, Allergens, Certifications
- And 40+ more tables...

**No manual SQL setup required!** 🎉

## Docker Support

### Development
```bash
docker-compose up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up
```

### With Redis Queue
```bash
docker-compose -f docker-compose.queue.yml up
```

## Project Structure

```
restaurant-horeca-app/
├── setup.sh                    # Automated setup script (Linux/Mac)
├── setup.bat                   # Automated setup script (Windows)
├── README.md                   # This file
└── restaurant_app_v3_translation_system/
    └── server/
        ├── .env                # Environment configuration (auto-generated)
        ├── package.json        # Backend dependencies
        ├── server.js           # Main server file
        ├── database.js         # Database initialization
        ├── admin-vite/         # Frontend React app
        │   ├── src/
        │   │   ├── main.tsx    # React entry point
        │   │   └── app/
        │   │       └── App.tsx # Main app router
        │   ├── package.json    # Frontend dependencies
        │   └── vite.config.ts  # Vite configuration
        ├── public/             # Static assets
        └── routes/             # API routes
```

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, change it in `.env`:
```bash
PORT=3002
```

### Database Issues

Delete the database and restart to reinitialize:
```bash
cd restaurant_app_v3_translation_system/server
rm restaurant.db
npm start
```

### Build Errors

Clear node_modules and reinstall:
```bash
cd restaurant_app_v3_translation_system/server
rm -rf node_modules admin-vite/node_modules
./../../setup.sh  # Or setup.bat on Windows
```

### Git LFS Files

If package.json files show as LFS pointers instead of actual content:
```bash
git lfs install
git lfs pull
```

## Development

### Frontend Development

The frontend is located in `admin-vite/` and uses Vite for fast hot-reload:

```bash
cd restaurant_app_v3_translation_system/server/admin-vite
npm run dev
```

### Backend Development

The backend auto-reloads with nodemon (if installed):

```bash
cd restaurant_app_v3_translation_system/server
npm start
```

## Available Scripts

From `restaurant_app_v3_translation_system/server/`:

- `npm start` - Start the server
- `npm test` - Run tests (if configured)
- `cd admin-vite && npm run build` - Build frontend for production
- `cd admin-vite && npm run dev` - Start Vite dev server

## Security Notes

⚠️ **Important for Production:**

1. Change `SESSION_SECRET` in `.env` to a random secure value
2. Set `NODE_ENV=production`
3. Use HTTPS in production
4. Configure proper firewall rules
5. Regular database backups

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.

---

Made with ❤️ for the restaurant industry
