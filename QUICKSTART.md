# Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### 1. Run Setup Script

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### 2. Start the Server

```bash
cd restaurant_app_v3_translation_system/server
npm start
```

### 3. Open Your Browser

```
http://localhost:3001/admin-vite/
```

**That's it! 🎉**

---

## What the Setup Script Does

1. ✅ Checks Node.js version (requires 18+)
2. ✅ Installs backend dependencies
3. ✅ Installs frontend dependencies
4. ✅ Creates `.env` file with defaults
5. ✅ Builds frontend application
6. ✅ Prepares database (auto-initializes on first run)

---

## First Login

Default admin credentials will be displayed in the console on first run.

---

## Common Commands

### Start Development Server
```bash
cd restaurant_app_v3_translation_system/server
npm start
```

### Start with Hot-Reload (Frontend Development)

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

### Production Build
```bash
cd restaurant_app_v3_translation_system/server/admin-vite
npm run build
cd ..
NODE_ENV=production npm start
```

---

## Troubleshooting

### Setup script fails?
- Make sure Node.js 18+ is installed: `node -v`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and try again

### Port 3001 already in use?
Edit `.env` file and change:
```
PORT=3002
```

### Database errors?
Delete and reinitialize:
```bash
cd restaurant_app_v3_translation_system/server
rm restaurant.db
npm start
```

### Still having issues?
Check the full [README.md](README.md) for detailed documentation.

---

## Next Steps

- 📖 Read the full [README.md](README.md)
- 🔧 Customize `.env` configuration
- 🎨 Explore the admin panel features
- 📊 Import your restaurant data

---

**Need Help?** Check the documentation or contact support.
