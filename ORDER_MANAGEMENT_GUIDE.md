# Order Management Guide - Restaurant HORECA Application

## Table of Contents
1. [Introduction](#introduction)
2. [Order Types](#order-types)
3. [Order Placement](#order-placement)
4. [Order Tracking](#order-tracking)
5. [Order Workflow](#order-workflow)
6. [API Reference](#api-reference)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

---

## Introduction

This guide covers complete order management in the Restaurant HORECA Application, including order placement, tracking, status updates, and resolution across all order types.

**Date:** February 14, 2026  
**Application Version:** v3  
**Module:** Orders Management  

---

## Order Types

The application supports **7 order types**:

### 1. Dine-In Orders
- Table-based orders
- In-restaurant consumption
- Server/waiter managed
- Split bill support
- Table transfer capability

### 2. Takeaway Orders
- Pickup at restaurant
- Pre-order or walk-in
- Payment before pickup
- Estimated ready time
- Notification when ready

### 3. Delivery Orders
- Home delivery
- Address-based
- Delivery fee calculation
- Courier assignment
- GPS tracking
- ETA calculation

### 4. Drive-Thru Orders
- Car-based pickup
- Quick service
- Lane assignment
- Payment window
- Fast-track preparation

### 5. Kiosk Orders
- Self-service terminal
- Touchscreen interface
- Payment at kiosk
- Order number display
- Automated kitchen routing

### 6. Online Orders
- Web/mobile app
- Remote ordering
- Payment integration
- Customer account
- Order history

### 7. Call Center Orders
- Phone-based
- Agent-assisted
- Customer database
- Address verification
- Special instructions

---

## Order Placement

### Method 1: UI (Admin Interface)

```
Path: /admin-vite/orders/new

Steps:
1. Click "New Order" button
2. Select order type
3. Choose customer (or create new)
4. Add items:
   - Search product catalog
   - Select items
   - Choose modifiers/options
   - Set quantities
5. Add special instructions
6. Apply discounts/promotions
7. Calculate totals
8. Choose payment method
9. Confirm order
```

### Method 2: API (Direct)

```javascript
POST /api/orders

Request Body:
{
  "orderType": "delivery",
  "customerId": 123,
  "customerInfo": {
    "name": "Ion Popescu",
    "phone": "+40722123456",
    "email": "ion@example.com",
    "address": {
      "street": "Str. Victoriei nr. 10",
      "city": "București",
      "postalCode": "010083",
      "floor": "2",
      "apartment": "5",
      "notes": "Interfon 25"
    }
  },
  "items": [
    {
      "productId": 42,
      "name": "Pizza Margherita",
      "quantity": 2,
      "price": 35.00,
      "modifiers": [
        {
          "id": 1,
          "name": "Extra cheese",
          "price": 5.00
        }
      ],
      "specialInstructions": "Bine prăjită"
    },
    {
      "productId": 156,
      "name": "Cola 500ml",
      "quantity": 2,
      "price": 8.00
    }
  ],
  "discounts": [
    {
      "type": "percentage",
      "value": 10,
      "reason": "First order discount"
    }
  ],
  "deliveryFee": 12.00,
  "paymentMethod": "card",
  "specialInstructions": "Livrare între 18:00-18:30",
  "scheduledTime": "2026-02-14T18:00:00Z",
  "source": "web"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "orderId": 5678,
    "orderNumber": "ORD-2026-5678",
    "status": "CREATED",
    "estimatedTime": "18:15",
    "totalAmount": 94.00,
    "paymentStatus": "PENDING",
    "trackingUrl": "https://restaurant.com/track/5678",
    "createdAt": "2026-02-14T17:30:00Z"
  }
}
```

### Order Item Structure

```typescript
interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  vatRate?: number;
  modifiers?: OrderModifier[];
  specialInstructions?: string;
  productionStation?: string;  // Kitchen, Bar, etc.
}

interface OrderModifier {
  id: number;
  name: string;
  price: number;
  quantity?: number;
}
```

### Discount Types

```typescript
interface Discount {
  type: 'fixed' | 'percentage' | 'item' | 'delivery';
  value: number;
  reason?: string;
  code?: string;  // Promo code
  appliesTo?: 'order' | 'item' | 'delivery';
}

// Examples:
// Fixed discount
{ type: 'fixed', value: 10.00, reason: 'Loyalty reward' }

// Percentage discount
{ type: 'percentage', value: 15, reason: '15% off promo' }

// Free delivery
{ type: 'delivery', value: 100, reason: 'Free delivery promo' }

// Item discount
{ type: 'item', value: 5.00, reason: 'Combo deal' }
```

---

## Order Tracking

### Real-Time Status Updates

The application uses **WebSocket** for real-time order tracking:

```javascript
// Client-side (Browser)
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to order tracking');
  
  // Subscribe to order updates
  socket.emit('subscribe', { orderId: 5678 });
});

socket.on('order:updated', (data) => {
  console.log('Order status changed:', data);
  // Update UI
  updateOrderDisplay(data);
});

socket.on('order:item:ready', (data) => {
  console.log('Item ready:', data.item);
  // Show notification
});

socket.on('order:completed', (data) => {
  console.log('Order completed!');
  // Show completion message
});
```

### Tracking Page

```
URL: /track/:orderId

Features:
- Real-time status updates
- Progress timeline
- ETA display
- Courier location (delivery orders)
- Contact buttons
- Order details
- Receipt view
```

### Status Tracking API

```javascript
GET /api/orders/:id/status

Response:
{
  "success": true,
  "data": {
    "orderId": 5678,
    "orderNumber": "ORD-2026-5678",
    "status": "PREPARING",
    "substatus": "COOKING",
    "progress": 65,  // Percentage
    "estimatedReady": "2026-02-14T18:10:00Z",
    "timeline": [
      {
        "status": "CREATED",
        "timestamp": "2026-02-14T17:30:00Z",
        "user": "system"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2026-02-14T17:30:30Z",
        "user": "admin"
      },
      {
        "status": "PREPARING",
        "timestamp": "2026-02-14T17:35:00Z",
        "user": "kitchen"
      }
    ],
    "items": [
      {
        "name": "Pizza Margherita",
        "status": "COOKING",
        "progress": 70,
        "station": "PIZZA_OVEN"
      },
      {
        "name": "Cola 500ml",
        "status": "READY",
        "progress": 100,
        "station": "BAR"
      }
    ],
    "courier": {  // For delivery orders
      "name": "Mihai Vasilescu",
      "phone": "+40733999888",
      "location": {
        "lat": 44.4268,
        "lng": 26.1025
      },
      "distanceToCustomer": 1.2  // km
    }
  }
}
```

### Customer Notifications

Orders trigger automated notifications:

```javascript
// Email notification
{
  "to": "ion@example.com",
  "subject": "Order #5678 Confirmed",
  "template": "order-confirmed",
  "data": {
    "orderNumber": "ORD-2026-5678",
    "estimatedTime": "18:15",
    "items": [...],
    "total": 94.00
  }
}

// SMS notification
{
  "to": "+40722123456",
  "message": "Order #5678 is on its way! ETA: 18:15. Track: https://r.co/t/5678"
}

// Push notification (mobile app)
{
  "title": "Order Ready! 🍕",
  "body": "Order #5678 is ready for pickup",
  "data": {
    "orderId": 5678,
    "action": "view_order"
  }
}
```

---

## Order Workflow

### Complete Order Lifecycle

```
┌──────────────┐
│   CREATED    │  Customer places order
└──────┬───────┘
       │
       ↓ Auto-confirm or manual review
┌──────────────┐
│  CONFIRMED   │  Order accepted by restaurant
└──────┬───────┘
       │
       ↓ Routed to kitchen/bar
┌──────────────┐
│  PREPARING   │  Staff preparing order
│              │  - COOKING
│              │  - ASSEMBLING
│              │  - PACKAGING
└──────┬───────┘
       │
       ↓ All items ready
┌──────────────┐
│    READY     │  Order complete, awaiting pickup/delivery
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ↓ (Delivery)      ↓ (Takeaway/Dine-in)
┌──────────────┐    ┌──────────────┐
│ IN_TRANSIT   │    │  PICKED_UP   │
│              │    │              │
│ Courier      │    │ Customer     │
│ delivering   │    │ received     │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ↓                   ↓
┌──────────────┐    ┌──────────────┐
│  DELIVERED   │    │  COMPLETED   │
└──────┬───────┘    └──────┬───────┘
       │                   │
       └───────┬───────────┘
               ↓
       ┌──────────────┐
       │  COMPLETED   │  Final state
       └──────────────┘
       
       
       ┌──────────────┐
       │  CANCELLED   │  Can be cancelled at any stage
       │              │  (with reason)
       └──────────────┘
```

### Status Transitions

| From | To | Action | Trigger | Permissions |
|------|-----|--------|---------|-------------|
| - | CREATED | Create order | Customer/Staff | Any |
| CREATED | CONFIRMED | Confirm | Staff | Manager/Admin |
| CREATED | CANCELLED | Cancel | Customer/Staff | Any |
| CONFIRMED | PREPARING | Start prep | Kitchen | Kitchen Staff |
| CONFIRMED | CANCELLED | Cancel | Staff | Manager/Admin |
| PREPARING | READY | Mark ready | Kitchen | Kitchen Staff |
| PREPARING | CANCELLED | Cancel | Staff | Manager/Admin |
| READY | IN_TRANSIT | Assign courier | Dispatcher | Delivery Staff |
| READY | PICKED_UP | Mark picked up | Staff | Any Staff |
| READY | CANCELLED | Cancel | Staff | Manager/Admin |
| IN_TRANSIT | DELIVERED | Confirm delivery | Courier | Courier |
| IN_TRANSIT | CANCELLED | Cancel | Staff | Manager/Admin |
| PICKED_UP | COMPLETED | Auto-complete | System | - |
| DELIVERED | COMPLETED | Auto-complete | System | - |

### Workflow API Operations

```javascript
// 1. Confirm Order
POST /api/orders/:id/confirm
Body: { "estimatedTime": "18:15" }
→ Status: CONFIRMED

// 2. Start Preparation
POST /api/orders/:id/prepare
→ Status: PREPARING

// 3. Mark Item Ready
POST /api/orders/:id/items/:itemId/ready
→ Item status: READY

// 4. Mark Order Ready
POST /api/orders/:id/ready
→ Status: READY
→ Triggers: Customer notification

// 5. Assign Courier (Delivery)
POST /api/orders/:id/assign-courier
Body: { "courierId": 25 }
→ Status: IN_TRANSIT
→ Triggers: SMS to customer with tracking link

// 6. Mark Delivered
POST /api/orders/:id/deliver
Body: { "signature": "base64...", "photo": "base64..." }
→ Status: DELIVERED
→ Triggers: Completion notification

// 7. Cancel Order
POST /api/orders/:id/cancel
Body: { "reason": "Customer requested", "refund": true }
→ Status: CANCELLED
→ Triggers: Refund process (if paid)

// 8. Complete Order
POST /api/orders/:id/complete
→ Status: COMPLETED
```

---

## API Reference

### Base URL

```
http://localhost:3001/api/orders
```

### Endpoints

#### List Orders

```http
GET /api/orders

Query Parameters:
  - status: CREATED|CONFIRMED|PREPARING|READY|IN_TRANSIT|DELIVERED|COMPLETED|CANCELLED
  - type: dine-in|takeaway|delivery|drive-thru|kiosk|online|call-center
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - customerId: integer
  - page: integer (default: 1)
  - perPage: integer (default: 30, max: 100)
  - sortBy: createdAt|totalAmount|estimatedTime
  - sortOrder: asc|desc

Response:
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 245,
    "page": 1,
    "perPage": 30,
    "totalPages": 9,
    "summary": {
      "totalRevenue": 12450.00,
      "averageOrderValue": 50.82,
      "activeOrders": 15
    }
  }
}
```

#### Get Single Order

```http
GET /api/orders/:id

Response:
{
  "success": true,
  "data": {
    "orderId": 5678,
    "orderNumber": "ORD-2026-5678",
    "status": "PREPARING",
    "orderType": "delivery",
    "customer": {...},
    "items": [...],
    "totals": {...},
    "timeline": [...],
    "payments": [...],
    "createdAt": "2026-02-14T17:30:00Z",
    "updatedAt": "2026-02-14T17:35:00Z"
  }
}
```

#### Create Order

```http
POST /api/orders
Content-Type: application/json

Body: { ...order data... }

Response: 201 Created
```

#### Update Order

```http
PUT /api/orders/:id
Content-Type: application/json

Body: { ...updated fields... }

Requires: status IN ('CREATED', 'CONFIRMED')

Response: 200 OK
```

#### Cancel Order

```http
POST /api/orders/:id/cancel
Content-Type: application/json

Body:
{
  "reason": "Customer requested",
  "refund": true,
  "notes": "Customer changed mind"
}

Response: 200 OK
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "status": "CANCELLED",
    "refundAmount": 94.00,
    "refundMethod": "card"
  }
}
```

#### Get Order Receipt

```http
GET /api/orders/:id/receipt?format=pdf

Query Parameters:
  - format: pdf|html|json

Response: PDF/HTML/JSON receipt
```

#### Get Order History (for Customer)

```http
GET /api/orders/history?customerId=123

Response:
{
  "success": true,
  "data": {
    "orders": [...],
    "stats": {
      "totalOrders": 42,
      "totalSpent": 2100.00,
      "favoriteItems": [...]
    }
  }
}
```

#### Get Order Analytics

```http
GET /api/orders/analytics

Query Parameters:
  - period: today|week|month|year|custom
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - groupBy: day|week|month|type|status

Response:
{
  "success": true,
  "data": {
    "totalOrders": 1245,
    "totalRevenue": 62250.00,
    "averageOrderValue": 50.00,
    "byType": {
      "delivery": { count: 456, revenue: 22800.00 },
      "takeaway": { count: 389, revenue: 19450.00 },
      "dine-in": { count: 400, revenue: 20000.00 }
    },
    "byStatus": {...},
    "peakHours": [...],
    "topProducts": [...]
  }
}
```

---

## Code Examples

### Example 1: Place Delivery Order

```javascript
const axios = require('axios');

async function placeDeliveryOrder() {
  try {
    const order = {
      orderType: 'delivery',
      customerInfo: {
        name: 'Elena Marinescu',
        phone: '+40755123456',
        email: 'elena@example.com',
        address: {
          street: 'Bd. Unirii nr. 45',
          city: 'București',
          postalCode: '030823',
          apartment: '12',
          floor: '3',
          notes: 'Interfon 35'
        }
      },
      items: [
        {
          productId: 15,
          name: 'Burger Classic',
          quantity: 2,
          price: 28.00,
          modifiers: [
            { id: 5, name: 'Extra bacon', price: 6.00 }
          ]
        },
        {
          productId: 89,
          name: 'Cartofi prăjiți',
          quantity: 2,
          price: 12.00
        },
        {
          productId: 145,
          name: 'Pepsi 500ml',
          quantity: 2,
          price: 8.00
        }
      ],
      deliveryFee: 10.00,
      paymentMethod: 'card',
      specialInstructions: 'Livrare rapidă, vă rog'
    };
    
    const response = await axios.post('http://localhost:3001/api/orders', order);
    
    console.log('✅ Order placed successfully!');
    console.log('Order Number:', response.data.data.orderNumber);
    console.log('Order ID:', response.data.data.orderId);
    console.log('Total:', response.data.data.totalAmount, 'RON');
    console.log('Estimated delivery:', response.data.data.estimatedTime);
    console.log('Track order:', response.data.data.trackingUrl);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Order failed:', error.response?.data || error.message);
  }
}

placeDeliveryOrder();
```

### Example 2: Track Order Status

```javascript
const io = require('socket.io-client');

function trackOrder(orderId) {
  const socket = io('http://localhost:3001');
  
  socket.on('connect', () => {
    console.log('📡 Connected to tracking server');
    socket.emit('subscribe', { orderId });
  });
  
  socket.on('order:updated', (data) => {
    console.log('\n🔄 Order status update:');
    console.log('Status:', data.status);
    console.log('Progress:', data.progress + '%');
    if (data.estimatedTime) {
      console.log('ETA:', data.estimatedTime);
    }
  });
  
  socket.on('order:item:ready', (data) => {
    console.log('\n✓ Item ready:', data.item.name);
  });
  
  socket.on('order:ready', () => {
    console.log('\n🎉 Order is ready!');
  });
  
  socket.on('order:delivered', () => {
    console.log('\n🚚 Order delivered successfully!');
    socket.disconnect();
  });
  
  socket.on('disconnect', () => {
    console.log('📡 Disconnected from tracking server');
  });
}

// Usage
trackOrder(5678);
```

### Example 3: Complete Order Workflow

```javascript
const axios = require('axios');

class OrderManager {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async createOrder(orderData) {
    console.log('📝 Creating order...');
    const response = await axios.post(`${this.baseURL}/api/orders`, orderData);
    console.log(`✓ Order created: ${response.data.data.orderNumber}`);
    return response.data.data;
  }
  
  async confirmOrder(orderId, estimatedTime) {
    console.log('✅ Confirming order...');
    const response = await axios.post(
      `${this.baseURL}/api/orders/${orderId}/confirm`,
      { estimatedTime }
    );
    console.log('✓ Order confirmed');
    return response.data.data;
  }
  
  async startPreparation(orderId) {
    console.log('👨‍🍳 Starting preparation...');
    const response = await axios.post(
      `${this.baseURL}/api/orders/${orderId}/prepare`
    );
    console.log('✓ Preparation started');
    return response.data.data;
  }
  
  async markReady(orderId) {
    console.log('🍽️ Marking order ready...');
    const response = await axios.post(
      `${this.baseURL}/api/orders/${orderId}/ready`
    );
    console.log('✓ Order ready');
    return response.data.data;
  }
  
  async assignCourier(orderId, courierId) {
    console.log('🚗 Assigning courier...');
    const response = await axios.post(
      `${this.baseURL}/api/orders/${orderId}/assign-courier`,
      { courierId }
    );
    console.log('✓ Courier assigned');
    return response.data.data;
  }
  
  async markDelivered(orderId) {
    console.log('📦 Marking delivered...');
    const response = await axios.post(
      `${this.baseURL}/api/orders/${orderId}/deliver`
    );
    console.log('✓ Order delivered');
    return response.data.data;
  }
  
  async processOrder(orderData, courierId) {
    try {
      // 1. Create
      const order = await this.createOrder(orderData);
      const orderId = order.orderId;
      
      // 2. Confirm
      await this.confirmOrder(orderId, '18:15');
      
      // 3. Prepare
      await this.startPreparation(orderId);
      
      // Simulate preparation time
      console.log('⏳ Preparing order (simulating 5 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 4. Mark ready
      await this.markReady(orderId);
      
      // 5. Assign courier (for delivery orders)
      if (orderData.orderType === 'delivery') {
        await this.assignCourier(orderId, courierId);
        
        // Simulate delivery time
        console.log('⏳ Delivering order (simulating 5 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 6. Mark delivered
        await this.markDelivered(orderId);
      }
      
      console.log('\n🎉 Order processed successfully!');
      console.log(`   Order ID: ${orderId}`);
      
      return orderId;
    } catch (error) {
      console.error('\n❌ Order processing failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Usage
const manager = new OrderManager('http://localhost:3001');

const orderData = {
  orderType: 'delivery',
  customerInfo: {
    name: 'Test Customer',
    phone: '+40722999888',
    address: {
      street: 'Test Street 1',
      city: 'București'
    }
  },
  items: [
    {
      productId: 1,
      name: 'Test Pizza',
      quantity: 1,
      price: 35.00
    }
  ],
  paymentMethod: 'cash'
};

manager.processOrder(orderData, 10);  // courier ID 10
```

### Example 4: Get Order Analytics

```javascript
const axios = require('axios');

async function getOrderAnalytics(period = 'month') {
  try {
    const response = await axios.get('http://localhost:3001/api/orders/analytics', {
      params: { period }
    });
    
    const data = response.data.data;
    
    console.log('\n📊 Order Analytics');
    console.log('==================');
    console.log('Total Orders:', data.totalOrders);
    console.log('Total Revenue:', data.totalRevenue.toFixed(2), 'RON');
    console.log('Average Order Value:', data.averageOrderValue.toFixed(2), 'RON');
    
    console.log('\n📦 By Order Type:');
    Object.entries(data.byType).forEach(([type, stats]) => {
      console.log(`  ${type}: ${stats.count} orders, ${stats.revenue.toFixed(2)} RON`);
    });
    
    console.log('\n⭐ Top Products:');
    data.topProducts.slice(0, 5).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ${product.quantity} sold`);
    });
    
    console.log('\n⏰ Peak Hours:');
    data.peakHours.slice(0, 3).forEach((hour) => {
      console.log(`  ${hour.hour}:00 - ${hour.count} orders`);
    });
    
  } catch (error) {
    console.error('❌ Analytics failed:', error.response?.data || error.message);
  }
}

getOrderAnalytics('month');
```

---

## Best Practices

### 1. Order Creation

✅ **DO:**
- Validate customer information
- Verify product availability
- Calculate accurate totals
- Apply promotions correctly
- Set realistic estimated times
- Confirm payment before processing

❌ **DON'T:**
- Accept orders without customer contact
- Skip address validation for delivery
- Promise unrealistic delivery times
- Forget to check inventory

### 2. Order Processing

✅ **DO:**
- Confirm orders promptly
- Update status regularly
- Communicate with customers
- Track preparation progress
- Notify on delays
- Handle special requests

❌ **DON'T:**
- Leave orders unconfirmed
- Forget status updates
- Ignore customer messages
- Skip quality checks

### 3. Order Delivery

✅ **DO:**
- Assign experienced couriers
- Verify addresses before dispatch
- Track courier location
- Confirm with customer
- Handle issues professionally
- Request feedback

❌ **DON'T:**
- Send orders to wrong address
- Ignore delivery time windows
- Skip signature/photo proof
- Forget to update status

### 4. Order Cancellation

✅ **DO:**
- Record cancellation reason
- Process refunds promptly
- Notify all parties
- Update inventory
- Learn from patterns

❌ **DON'T:**
- Cancel without explanation
- Delay refunds
- Forget to update stock
- Ignore customer complaints

---

## Troubleshooting

### Common Issues

#### Issue 1: Order Creation Fails

**Symptoms:**
- 400 Bad Request
- "Invalid product" error
- "Customer not found" error

**Solutions:**
```javascript
// Validate products exist
const productIds = orderItems.map(item => item.productId);
const validProducts = await db.all(
  `SELECT id FROM menu_items WHERE id IN (${productIds.join(',')})`
);

if (validProducts.length !== productIds.length) {
  throw new Error('Invalid product IDs');
}

// Validate customer
if (customerId) {
  const customer = await db.get('SELECT * FROM customers WHERE id = ?', [customerId]);
  if (!customer) {
    throw new Error('Customer not found');
  }
}
```

#### Issue 2: Status Not Updating

**Symptoms:**
- Order stuck in same status
- WebSocket not firing

**Solutions:**
```javascript
// Check WebSocket connection
if (!socket.connected) {
  console.error('WebSocket disconnected, reconnecting...');
  socket.connect();
}

// Verify status transition is valid
const validTransitions = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  // ...
};

if (!validTransitions[currentStatus].includes(newStatus)) {
  throw new Error(`Invalid status transition: ${currentStatus} → ${newStatus}`);
}

// Ensure database transaction
await db.run('BEGIN TRANSACTION');
try {
  await updateOrderStatus(orderId, newStatus);
  await createStatusHistory(orderId, newStatus);
  await db.run('COMMIT');
  // Emit WebSocket event
  io.emit('order:updated', { orderId, status: newStatus });
} catch (error) {
  await db.run('ROLLBACK');
  throw error;
}
```

#### Issue 3: Delivery Tracking Not Working

**Symptoms:**
- Courier location not updating
- GPS coordinates invalid

**Solutions:**
```javascript
// Validate GPS coordinates
function validateGPS(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('GPS coordinates must be numbers');
  }
  if (lat < -90 || lat > 90) {
    throw new Error('Invalid latitude');
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Invalid longitude');
  }
  return true;
}

// Update location with error handling
async function updateCourierLocation(orderId, lat, lng) {
  validateGPS(lat, lng);
  
  await db.run(
    `UPDATE orders 
     SET courier_lat = ?, courier_lng = ?, courier_updated_at = ?
     WHERE id = ?`,
    [lat, lng, Date.now(), orderId]
  );
  
  // Emit location update
  io.to(`order-${orderId}`).emit('courier:location', { lat, lng });
}
```

---

**Document Version:** 1.0  
**Last Updated:** February 14, 2026  
**Author:** GitHub Copilot Coding Agent
