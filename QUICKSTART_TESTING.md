# Quick Start Guide - HORECA Application Testing

## Prerequisites

- Node.js 18+ installed
- Git installed
- ~2GB free disk space

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd restaurant_app_v3_translation_system/server
npm install
```

### 2. Start Server

```bash
npm start
```

Server will start on: **http://localhost:3001**

### 3. Access Interfaces

**Option A: Use Quick Access Script**
```bash
./quick-access.sh
```

**Option B: Open URLs Manually**

- **Admin Panel:** http://localhost:3001/admin-vite/
- **POS:** http://localhost:3001/legacy/orders/comanda.html
- **Kiosk:** http://localhost:3001/legacy/orders/kiosk.html

### 4. Login Credentials

```
Username: admin
Password: admin
PIN: 1234
```

---

## Comprehensive Testing

### Run All Verification Tests

```bash
./run-comprehensive-tests.sh
```

This will:
1. ✅ Verify all 17 interface files
2. ✅ Check configuration
3. ✅ Validate database
4. ✅ Test API endpoints
5. ✅ Run E2E tests with Playwright
6. ✅ Generate comprehensive report

### Manual Verification

```bash
node comprehensive-verification.js
```

Results saved to: `COMPREHENSIVE_VERIFICATION_REPORT.json`

---

## Interface URLs

### Administration
| Interface | URL |
|-----------|-----|
| Admin-Vite | http://localhost:3001/admin-vite/ |
| API Docs | http://localhost:3001/api-docs |

### POS & Orders
| Interface | URL |
|-----------|-----|
| POS Comanda | http://localhost:3001/legacy/orders/comanda.html |
| Kiosk | http://localhost:3001/legacy/orders/kiosk.html |

### Supervisor Stations (1-11)
| Station | URL |
|---------|-----|
| Supervisor 1 | http://localhost:3001/legacy/orders/comanda-supervisor1.html |
| Supervisor 2 | http://localhost:3001/legacy/orders/comanda-supervisor2.html |
| ... | ... |
| Supervisor 11 | http://localhost:3001/legacy/orders/comanda-supervisor11.html |

### Delivery Interfaces (1-3)
| Interface | URL |
|-----------|-----|
| Delivery 1 | http://localhost:3001/legacy/delivery/livrare.html |
| Delivery 2 | http://localhost:3001/legacy/delivery/livrare2.html |
| Delivery 3 | http://localhost:3001/legacy/delivery/livrare3.html |

---

## API Endpoints

### Health Checks
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

### Menu & Products
```bash
curl http://localhost:3001/api/menu/all
curl http://localhost:3001/api/kiosk/menu
curl http://localhost:3001/api/products
```

### Orders
```bash
curl http://localhost:3001/api/orders
```

---

## Test Suites

### 1. E2E Tests (Playwright)

```bash
# Run all E2E tests
npx playwright test tests/e2e/comprehensive-e2e-test.spec.js

# Run with UI
npx playwright test tests/e2e/comprehensive-e2e-test.spec.js --ui

# Run specific phase
npx playwright test --grep "Health Checks"
```

### 2. Backend API Tests

```bash
node tests/backend-endpoints-test.js
```

### 3. Verification Script

```bash
node comprehensive-verification.js
```

---

## Test Coverage

### Phases Tested

1. ✅ **Health Checks** - Server and API health
2. ✅ **Admin-Vite Interface** - React application
3. ✅ **Legacy Interfaces** - All 17 HTML interfaces
4. ✅ **Kiosk Interface** - Touch interface
5. ✅ **API Endpoints** - All critical APIs
6. ✅ **UI/UX Validation** - Text encoding, boundaries
7. ✅ **Performance** - Load times, response times
8. ✅ **Security** - Authentication, headers, injection
9. ✅ **Integration** - Socket.IO, real-time updates
10. ✅ **Data Sync** - Menu consistency, DB stability

### Test Results

**Overall Pass Rate:** 81.48%
- Passed: 44 checks
- Failed: 3 checks (minor)
- Warnings: 7 checks

See `COMPREHENSIVE_VERIFICATION_REPORT.json` for details.

---

## Configuration

### Development Mode (Current)

File: `.env`
```bash
NODE_ENV=development
PORT=3001
CORS_ORIGIN=*
DEBUG=true
DISABLE_RATE_LIMIT=true
```

⚠️ **For production, change:**
- `CORS_ORIGIN` to specific domains
- `DEBUG=false`
- `DISABLE_RATE_LIMIT=false`
- All default secrets

---

## Troubleshooting

### Server won't start

```bash
# Check if port is in use
lsof -i :3001

# Kill process if needed
kill $(lsof -t -i:3001)

# Remove database and restart
rm restaurant.db
npm start
```

### Database issues

```bash
# Reset admin password
node reset-admin.js

# Check database
sqlite3 restaurant.db "SELECT * FROM users WHERE username='admin';"
```

### Test failures

```bash
# Install Playwright browsers
npx playwright install

# Clear test results
rm -rf playwright-report test-results

# Run tests again
npx playwright test
```

---

## Documentation

- **Credentials:** `TEST_CREDENTIALS.md`
- **Comprehensive Report:** `COMPREHENSIVE_TESTING_REPORT.md`
- **Verification Results:** `COMPREHENSIVE_VERIFICATION_REPORT.json`
- **Test Guide:** `TESTING_GUIDE.md`

---

## Support

For issues:
1. Check logs: `/tmp/horeca-server.log`
2. Review verification report
3. Run diagnostic: `node comprehensive-verification.js`

---

## Next Steps

1. ✅ Start server
2. ✅ Run verification
3. ✅ Test all interfaces manually
4. ✅ Run E2E test suite
5. ✅ Review reports
6. ✅ Fix any issues found
7. ✅ Update configuration for production

---

**Last Updated:** 2026-02-15  
**Version:** 1.0  
**Status:** Ready for Testing
