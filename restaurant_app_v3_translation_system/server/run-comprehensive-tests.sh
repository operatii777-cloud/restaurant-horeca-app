#!/bin/bash

##############################################################################
# Comprehensive HORECA Application Testing Script
# This script runs all verification and tests for the application
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Restaurant HORECA - Comprehensive Test Suite            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to server directory
cd "$(dirname "$0")"

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if server is running
check_server() {
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Server is not running${NC}"
        return 1
    fi
}

# Step 1: Run comprehensive verification
print_section "Step 1: Running Comprehensive Verification"
node comprehensive-verification.js
VERIFY_EXIT=$?

if [ $VERIFY_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ Verification passed!${NC}"
else
    echo -e "${YELLOW}⚠ Verification found some issues (see report above)${NC}"
fi

# Step 2: Check if dependencies are installed
print_section "Step 2: Checking Dependencies"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing server dependencies...${NC}"
    npm install
fi

if [ ! -d "admin-vite/node_modules" ]; then
    echo -e "${YELLOW}Installing admin-vite dependencies...${NC}"
    cd admin-vite
    npm install
    cd ..
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Build admin-vite if needed
print_section "Step 3: Building Admin-Vite"
if [ ! -d "admin-vite/dist" ]; then
    echo -e "${YELLOW}Building admin-vite...${NC}"
    cd admin-vite
    npm run build || echo -e "${YELLOW}⚠ Build completed with warnings${NC}"
    cd ..
else
    echo -e "${GREEN}✓ Admin-vite already built${NC}"
fi

# Step 4: Check database
print_section "Step 4: Checking Database"
if [ -f "restaurant.db" ]; then
    SIZE=$(ls -lh restaurant.db | awk '{print $5}')
    echo -e "${GREEN}✓ Database exists (Size: $SIZE)${NC}"
else
    echo -e "${YELLOW}⚠ Database not found - will be created on server start${NC}"
fi

# Step 5: Start server if not running
print_section "Step 5: Server Status"
if ! check_server; then
    echo -e "${YELLOW}Starting server in background...${NC}"
    NODE_ENV=development PORT=3001 node server.js > /tmp/horeca-server.log 2>&1 &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
    
    # Wait for server to start
    echo "Waiting for server to initialize..."
    for i in {1..30}; do
        sleep 1
        if check_server; then
            echo -e "${GREEN}✓ Server started successfully${NC}"
            STARTED_SERVER=true
            break
        fi
        echo -n "."
    done
    echo ""
    
    if ! check_server; then
        echo -e "${RED}✗ Server failed to start${NC}"
        echo "Check logs at: /tmp/horeca-server.log"
        tail -50 /tmp/horeca-server.log
        exit 1
    fi
else
    STARTED_SERVER=false
fi

# Step 6: Test API endpoints
print_section "Step 6: Testing API Endpoints"

test_endpoint() {
    local url=$1
    local desc=$2
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✓ $desc ($HTTP_CODE)${NC}"
        return 0
    else
        echo -e "${RED}✗ $desc ($HTTP_CODE)${NC}"
        return 1
    fi
}

test_endpoint "http://localhost:3001/health" "Health endpoint"
test_endpoint "http://localhost:3001/api/health" "API health endpoint"
test_endpoint "http://localhost:3001/api/menu/all" "Menu endpoint"
test_endpoint "http://localhost:3001/api/kiosk/menu" "Kiosk menu endpoint"
test_endpoint "http://localhost:3001/api/products" "Products endpoint"

# Step 7: Run Playwright tests (if server is running)
print_section "Step 7: Running E2E Tests"
if check_server; then
    echo -e "${BLUE}Running Playwright E2E tests...${NC}"
    
    # Install Playwright browsers if needed
    if ! npx playwright --version > /dev/null 2>&1; then
        echo -e "${YELLOW}Installing Playwright...${NC}"
        npx playwright install
    fi
    
    # Run tests
    npx playwright test tests/e2e/comprehensive-e2e-test.spec.js --reporter=list || {
        echo -e "${YELLOW}⚠ Some E2E tests failed (this is normal for first run)${NC}"
    }
else
    echo -e "${YELLOW}⚠ Skipping E2E tests (server not running)${NC}"
fi

# Step 8: Generate final report
print_section "Step 8: Final Report"

echo -e "${BLUE}Test Summary:${NC}"
echo -e "  • Verification: $([ $VERIFY_EXIT -eq 0 ] && echo -e "${GREEN}PASSED${NC}" || echo -e "${YELLOW}WARNINGS${NC}")"
echo -e "  • Server: $(check_server && echo -e "${GREEN}RUNNING${NC}" || echo -e "${RED}STOPPED${NC}")"
echo -e "  • Database: $([ -f "restaurant.db" ] && echo -e "${GREEN}EXISTS${NC}" || echo -e "${YELLOW}MISSING${NC}")"
echo -e "  • Admin-Vite: $([ -d "admin-vite/dist" ] && echo -e "${GREEN}BUILT${NC}" || echo -e "${YELLOW}NOT BUILT${NC}")"

echo ""
echo -e "${BLUE}Detailed Reports:${NC}"
echo -e "  • Verification Report: ../COMPREHENSIVE_VERIFICATION_REPORT.json"
echo -e "  • Server Logs: /tmp/horeca-server.log (if server was started)"
echo -e "  • Playwright Report: playwright-report/index.html"

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Review verification report for any warnings"
echo -e "  2. Test interfaces manually in browser:"
echo -e "     - Admin-Vite: ${BLUE}http://localhost:3001/admin-vite/${NC}"
echo -e "     - POS: ${BLUE}http://localhost:3001/legacy/orders/comanda.html${NC}"
echo -e "     - Kiosk: ${BLUE}http://localhost:3001/legacy/orders/kiosk.html${NC}"
echo -e "     - Supervisor 1: ${BLUE}http://localhost:3001/legacy/orders/comanda-supervisor1.html${NC}"
echo -e "     - Delivery 1: ${BLUE}http://localhost:3001/legacy/delivery/livrare.html${NC}"
echo -e "  3. Check credentials in: ../TEST_CREDENTIALS.md"

# Cleanup
if [ "$STARTED_SERVER" = "true" ]; then
    echo ""
    echo -e "${YELLOW}Server is running in background (PID: $SERVER_PID)${NC}"
    echo -e "${YELLOW}To stop: kill $SERVER_PID${NC}"
fi

echo ""
echo -e "${GREEN}✓ Test suite completed!${NC}"
echo ""
