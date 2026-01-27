/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAPHQL SCHEMA - Restaurant App
 * 
 * Schema GraphQL pentru API-ul restaurant
 * ═══════════════════════════════════════════════════════════════════════════
 */

const gql = require('graphql-tag');

const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar JSON

  # Types
  type Order {
    id: ID!
    table_number: String
    total: Float!
    status: String!
    items: [OrderItem!]!
    timestamp: DateTime!
    client_identifier: String
    platform: String
  }

  type OrderItem {
    id: ID
    productId: ID!
    name: String!
    quantity: Int!
    price: Float!
    total: Float!
    notes: String
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: String
    image: String
    available: Boolean!
    allergens: [String!]
  }

  type Category {
    id: ID!
    name: String!
    description: String
    image: String
    products: [Product!]!
  }

  type Menu {
    categories: [Category!]!
    products: [Product!]!
  }

  type Payment {
    id: ID!
    order_id: ID!
    amount: Float!
    method: String!
    status: String!
    created_at: DateTime!
    idempotency_key: String
  }

  type Customer {
    id: ID!
    name: String
    email: String
    phone: String
    total_orders: Int!
    total_spent: Float!
  }

  # Input Types
  input OrderItemInput {
    productId: ID!
    quantity: Int!
    notes: String
  }

  input CreateOrderInput {
    table_number: String
    items: [OrderItemInput!]!
    client_identifier: String
    platform: String
  }

  input CreatePaymentInput {
    order_id: ID!
    amount: Float!
    method: String!
    idempotency_key: String
  }

  # Queries
  type Query {
    # Orders
    order(id: ID!): Order
    orders(limit: Int, offset: Int, status: String): [Order!]!
    
    # Menu
    menu: Menu!
    products(category: String, available: Boolean): [Product!]!
    categories: [Category!]!
    product(id: ID!): Product
    
    # Payments
    payment(id: ID!): Payment
    orderPayments(order_id: ID!): [Payment!]!
    
    # Customers
    customer(id: ID!): Customer
    customers(limit: Int, offset: Int): [Customer!]!
  }

  # Mutations
  type Mutation {
    # Orders
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
    cancelOrder(id: ID!): Order!
    
    # Payments
    createPayment(input: CreatePaymentInput!): Payment!
    capturePayment(id: ID!): Payment!
    cancelPayment(id: ID!): Payment!
  }

  # Subscriptions
  type Subscription {
    orderUpdated(order_id: ID): Order!
    orderCreated: Order!
    paymentCreated(order_id: ID): Payment!
  }
`;

module.exports = typeDefs;
