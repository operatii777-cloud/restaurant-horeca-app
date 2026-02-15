#!/bin/bash

##############################################################################
# Quick Interface Access - Restaurant HORECA Application
# Opens all interfaces in browser for manual testing
##############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Restaurant HORECA - Interface Quick Access              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
if ! curl -s $BASE_URL/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Server is not running!${NC}"
    echo ""
    echo "Please start the server first:"
    echo "  cd restaurant_app_v3_translation_system/server"
    echo "  npm start"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Function to open URL in browser
open_url() {
    local url=$1
    local name=$2
    
    echo -e "${BLUE}Opening: ${name}${NC}"
    echo -e "  URL: ${url}"
    
    # Detect OS and open browser
    if command -v xdg-open > /dev/null; then
        xdg-open "$url" 2>/dev/null &
    elif command -v open > /dev/null; then
        open "$url" 2>/dev/null &
    elif command -v start > /dev/null; then
        start "$url" 2>/dev/null &
    else
        echo -e "  ${YELLOW}Please open manually${NC}"
    fi
    
    sleep 1
}

# Display menu
echo "Select interfaces to open:"
echo ""
echo "  1) Admin-Vite (React Interface)"
echo "  2) POS Comanda"
echo "  3) Kiosk"
echo "  4) Supervisor Stations (1-11)"
echo "  5) Delivery Interfaces (1-3)"
echo "  6) All Interfaces"
echo "  7) API Documentation (Swagger)"
echo "  8) Display URLs only"
echo "  0) Exit"
echo ""
read -p "Enter choice (0-8): " choice

case $choice in
    1)
        open_url "$BASE_URL/admin-vite/" "Admin-Vite"
        ;;
    2)
        open_url "$BASE_URL/legacy/orders/comanda.html" "POS Comanda"
        ;;
    3)
        open_url "$BASE_URL/legacy/orders/kiosk.html" "Kiosk"
        ;;
    4)
        for i in {1..11}; do
            open_url "$BASE_URL/legacy/orders/comanda-supervisor${i}.html" "Supervisor Station $i"
        done
        ;;
    5)
        for i in {1..3}; do
            open_url "$BASE_URL/legacy/delivery/livrare${i}.html" "Delivery Interface $i"
        done
        ;;
    6)
        echo "Opening all interfaces..."
        open_url "$BASE_URL/admin-vite/" "Admin-Vite"
        sleep 2
        open_url "$BASE_URL/legacy/orders/comanda.html" "POS Comanda"
        sleep 2
        open_url "$BASE_URL/legacy/orders/kiosk.html" "Kiosk"
        sleep 2
        open_url "$BASE_URL/legacy/orders/comanda-supervisor1.html" "Supervisor 1"
        sleep 2
        open_url "$BASE_URL/legacy/delivery/livrare.html" "Delivery 1"
        ;;
    7)
        open_url "$BASE_URL/api-docs" "API Documentation (Swagger)"
        ;;
    8)
        echo ""
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}Interface URLs:${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Admin & Management:"
        echo "  • Admin-Vite:        $BASE_URL/admin-vite/"
        echo "  • API Docs:          $BASE_URL/api-docs"
        echo ""
        echo "POS & Orders:"
        echo "  • POS Comanda:       $BASE_URL/legacy/orders/comanda.html"
        echo "  • Kiosk:             $BASE_URL/legacy/orders/kiosk.html"
        echo ""
        echo "Supervisor Stations:"
        for i in {1..11}; do
            echo "  • Supervisor $i:      $BASE_URL/legacy/orders/comanda-supervisor${i}.html"
        done
        echo ""
        echo "Delivery Interfaces:"
        echo "  • Delivery 1:        $BASE_URL/legacy/delivery/livrare.html"
        echo "  • Delivery 2:        $BASE_URL/legacy/delivery/livrare2.html"
        echo "  • Delivery 3:        $BASE_URL/legacy/delivery/livrare3.html"
        echo ""
        echo "API Endpoints:"
        echo "  • Health:            $BASE_URL/health"
        echo "  • API Health:        $BASE_URL/api/health"
        echo "  • Menu:              $BASE_URL/api/menu/all"
        echo "  • Kiosk Menu:        $BASE_URL/api/kiosk/menu"
        echo "  • Products:          $BASE_URL/api/products"
        echo "  • Orders:            $BASE_URL/api/orders"
        echo ""
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Default Credentials:"
        echo "  • Username: admin"
        echo "  • Password: admin"
        echo "  • PIN:      1234"
        echo ""
        echo "See TEST_CREDENTIALS.md for complete list"
        echo ""
        ;;
    0)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✓ Done${NC}"
echo ""
echo "Credentials:"
echo "  • Username: admin"
echo "  • Password: admin"
echo "  • PIN: 1234"
echo ""
echo "See TEST_CREDENTIALS.md for full documentation"
echo ""
