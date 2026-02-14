# Contributing to Restaurant HORECA App

Thank you for your interest in contributing to the Restaurant HORECA App!

## Development Setup

### Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Git LFS** - [Download](https://git-lfs.github.com/)
3. **npm 8+** (comes with Node.js)

### Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/restaurant-horeca-app.git
# Or if you're a contributor to the main repository:
# git clone https://github.com/operatii777-cloud/restaurant-horeca-app.git
cd restaurant-horeca-app
```

2. Install Git LFS and pull files:
```bash
git lfs install
git lfs pull
```

3. Run the setup script:
```bash
# Linux/Mac
./setup.sh

# Windows
setup.bat
```

4. Start development:
```bash
cd restaurant_app_v3_translation_system/server
npm start
```

## Project Structure

```
restaurant-horeca-app/
├── setup.sh, setup.bat          # Automated setup scripts
├── README.md                     # Main documentation
├── QUICKSTART.md                 # Quick start guide
└── restaurant_app_v3_translation_system/
    └── server/                   # Main application
        ├── .env                  # Environment config (auto-generated)
        ├── .env.example          # Environment template
        ├── package.json          # Backend dependencies (Git LFS)
        ├── server.js             # Main Express server
        ├── database.js           # Database initialization
        │
        ├── admin-vite/           # Frontend React application
        │   ├── package.json      # Frontend dependencies (Git LFS)
        │   ├── vite.config.ts    # Vite configuration
        │   ├── src/
        │   │   ├── main.tsx      # React entry point
        │   │   ├── config/       # Centralized configuration
        │   │   │   └── app.config.ts  # App settings
        │   │   ├── app/
        │   │   │   └── App.tsx   # Main router
        │   │   ├── modules/      # Feature modules
        │   │   ├── components/   # Shared components
        │   │   ├── core/         # Core utilities
        │   │   │   ├── api/      # API clients
        │   │   │   ├── hooks/    # Custom React hooks
        │   │   │   └── sockets/  # Socket.IO integration
        │   │   └── styles/       # Global styles
        │   └── dist/             # Production build
        │
        ├── routes/               # API routes
        ├── controllers/          # Business logic
        ├── services/             # External services
        ├── middleware/           # Express middleware
        ├── models/               # Data models
        ├── config/               # Backend configuration
        └── public/               # Static assets
```

## Development Workflow

### Backend Development

The backend uses Node.js + Express + SQLite:

```bash
cd restaurant_app_v3_translation_system/server
npm start
```

- Server runs on http://localhost:3001
- Auto-reloads on file changes (if using nodemon)
- Database auto-initializes on first run

### Frontend Development

The frontend uses React + Vite + TypeScript:

**Option 1: Production build (served by backend)**
```bash
cd restaurant_app_v3_translation_system/server/admin-vite
npm run build
cd ..
npm start
```

**Option 2: Development with hot-reload**
```bash
# Terminal 1 - Backend
cd restaurant_app_v3_translation_system/server
npm start

# Terminal 2 - Frontend dev server
cd restaurant_app_v3_translation_system/server/admin-vite
npm run dev
```

Access at: http://localhost:3001/admin-vite/

### Configuration

#### Backend (.env)
Located at `restaurant_app_v3_translation_system/server/.env`:

```bash
NODE_ENV=development
PORT=3001
TZ=Europe/Bucharest
DATABASE_PATH=./restaurant.db
SESSION_SECRET=your-secret-here
```

#### Frontend (app.config.ts)
Located at `restaurant_app_v3_translation_system/server/admin-vite/src/config/app.config.ts`:

```typescript
export const config = {
  api: { baseUrl: '/api', timeout: 30000 },
  app: { name: 'Restaurant Admin', basePath: '/admin-vite' },
  theme: { default: 'light', storageKey: 'admin_theme' },
  reactQuery: { /* ... */ },
  socket: { /* ... */ },
  features: { experimental: false, debug: true },
};
```

## Code Style

### TypeScript/JavaScript
- Use TypeScript for new frontend code
- Use ES6+ features
- Follow existing code style
- Use Prettier for formatting (if configured)

### React
- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript for type safety
- Follow React best practices

### File Naming
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## Testing

Run tests (if configured):
```bash
npm test
```

## Building for Production

```bash
# Build frontend
cd restaurant_app_v3_translation_system/server/admin-vite
npm run build

# Start production server
cd ..
NODE_ENV=production npm start
```

## Common Tasks

### Add a New API Endpoint

1. Create route in `routes/`
2. Create controller in `controllers/`
3. Add to `server.js`
4. Update frontend API client in `admin-vite/src/core/api/`

### Add a New Page

1. Create component in `admin-vite/src/modules/[module-name]/pages/`
2. Add route in `admin-vite/src/app/App.tsx`
3. Add navigation link if needed

### Update Configuration

- **Backend**: Edit `.env` file
- **Frontend**: Edit `admin-vite/src/config/app.config.ts`
- **Build**: Edit `admin-vite/vite.config.ts`

## Database

The app uses SQLite with automatic initialization:

- **Location**: `restaurant_app_v3_translation_system/server/restaurant.db`
- **Schema**: Defined in `database.js`, `database-enterprise-tables.js`, `database-haccp-tables.js`
- **Migrations**: Run automatically on startup

### Database Tools

```bash
# View database
sqlite3 restaurant.db

# Backup database
cp restaurant.db restaurant.db.backup

# Reset database
rm restaurant.db
npm start  # Will recreate with fresh schema
```

## Troubleshooting

### Package.json is Git LFS Pointer

```bash
git lfs install
git lfs pull
```

### Port Already in Use

Edit `.env` and change `PORT=3002`

### Build Errors

```bash
# Clear everything and rebuild
rm -rf node_modules admin-vite/node_modules
./setup.sh  # Or setup.bat on Windows
```

### Database Issues

```bash
rm restaurant.db
npm start  # Recreates database
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Getting Help

- Check the [README.md](README.md) for general documentation
- Check the [QUICKSTART.md](QUICKSTART.md) for setup help
- Review existing code for examples
- Contact the maintainers

## License

Proprietary - All rights reserved

---

Thank you for contributing! 🎉
