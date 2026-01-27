// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 3.A - IndexedDB Layer for POS Offline Mode
 * 
 * Schema and CRUD operations for:
 * - orders
 * - order_items
 * - payments
 * - sync_queue
 */

const DB_NAME = 'restaurant_pos_offline';
const DB_VERSION = 1;

interface Order {
  id?: number;
  localId?: string; // Temporary ID for offline orders
  type: string;
  items: string; // JSON string
  status: string;
  timestamp: string;
  total: number;
  table_number?: string;
  is_paid: boolean;
  synced: boolean;
}

interface OrderItem {
  id?: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

interface Payment {
  id?: number;
  orderId: number;
  amount: number;
  method: string;
  timestamp: string;
  synced: boolean;
}

interface SyncQueueItem {
  id?: number;
  type: 'order' | 'payment' | 'update';
  entityId: string;
  action: 'create' | 'update' | "Delete";
  data: string; // JSON string
  timestamp: string;
  retries: number;
  status: "Pending:" | 'syncing' | 'synced' | 'failed';
}

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export async function initIndexedDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Orders store
      if (!db.objectStoreNames.contains('orders')) {
        const ordersStore = db.createObjectStore('orders', { keyPath: 'localId', autoIncrement: false });
        ordersStore.createIndex('synced', 'synced', { unique: false });
        ordersStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Order items store
      if (!db.objectStoreNames.contains('order_items')) {
        const itemsStore = db.createObjectStore('order_items', { keyPath: 'id', autoIncrement: true });
        itemsStore.createIndex('orderId', 'orderId', { unique: false });
      }

      // Payments store
      if (!db.objectStoreNames.contains('payments')) {
        const paymentsStore = db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
        paymentsStore.createIndex('orderId', 'orderId', { unique: false });
        paymentsStore.createIndex('synced', 'synced', { unique: false });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Save order to IndexedDB
 */
export async function saveOrder(order: Order): Promise<string> {
  const db = await initIndexedDB();
  
  if (!order.localId) {
    order.localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  order.synced = false;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    const request = store.put(order);
    
    request.onsuccess = () => {
      resolve(order.localId!);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to save order'));
    };
  });
}

/**
 * Get all unsynced orders
 */
export async function getUnsyncedOrders(): Promise<Order[]> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['orders'], 'readonly');
    const store = transaction.objectStore('orders');
    const index = store.index('synced');
    const request = index.getAll(false);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to get unsynced orders'));
    };
  });
}

/**
 * Mark order as synced
 */
export async function markOrderSynced(localId: string, serverId: number): Promise<void> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    const getRequest = store.get(localId);
    
    getRequest.onsuccess = () => {
      const order = getRequest.result;
      if (order) {
        order.synced = true;
        order.id = serverId;
        const putRequest = store.put(order);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to mark order as synced'));
      } else {
        resolve();
      }
    };
    
    getRequest.onerror = () => {
      reject(new Error('Failed to get order'));
    };
  });
}

/**
 * Add item to sync queue
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<number> {
  const db = await initIndexedDB();
  
  const queueItem: SyncQueueItem = {
    ...item,
    timestamp: new Date().toISOString(),
    retries: 0,
    status: "Pending:",
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const request = store.add(queueItem);
    
    request.onsuccess = () => {
      resolve(request.result as number);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to add to sync queue'));
    };
  });
}

/**
 * Get pending sync queue items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sync_queue'], 'readonly');
    const store = transaction.objectStore('sync_queue');
    const index = store.index('status');
    const request = index.getAll("Pending:");
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to get pending sync items'));
    };
  });
}

/**
 * Mark sync item as synced
 */
export async function markSyncItemSynced(id: number): Promise<void> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.status = 'synced';
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to mark sync item as synced'));
      } else {
        resolve();
      }
    };
    
    getRequest.onerror = () => {
      reject(new Error('Failed to get sync item'));
    };
  });
}

