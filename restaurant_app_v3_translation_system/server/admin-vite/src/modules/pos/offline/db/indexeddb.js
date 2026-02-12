"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initIndexedDB = initIndexedDB;
exports.saveOrder = saveOrder;
exports.getUnsyncedOrders = getUnsyncedOrders;
exports.markOrderSynced = markOrderSynced;
exports.addToSyncQueue = addToSyncQueue;
exports.getPendingSyncItems = getPendingSyncItems;
exports.markSyncItemSynced = markSyncItemSynced;
var DB_NAME = 'restaurant_pos_offline';
var DB_VERSION = 1;
var dbInstance = null;
/**
 * Initialize IndexedDB
 */
function initIndexedDB() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (dbInstance) {
                return [2 /*return*/, dbInstance];
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var request = indexedDB.open(DB_NAME, DB_VERSION);
                    request.onerror = function () {
                        reject(new Error('Failed to open IndexedDB'));
                    };
                    request.onsuccess = function () {
                        dbInstance = request.result;
                        resolve(dbInstance);
                    };
                    request.onupgradeneeded = function (event) {
                        var db = event.target.result;
                        // Orders store
                        if (!db.objectStoreNames.contains('orders')) {
                            var ordersStore = db.createObjectStore('orders', { keyPath: 'localId', autoIncrement: false });
                            ordersStore.createIndex('synced', 'synced', { unique: false });
                            ordersStore.createIndex('timestamp', 'timestamp', { unique: false });
                        }
                        // Order items store
                        if (!db.objectStoreNames.contains('order_items')) {
                            var itemsStore = db.createObjectStore('order_items', { keyPath: 'id', autoIncrement: true });
                            itemsStore.createIndex('orderId', 'orderId', { unique: false });
                        }
                        // Payments store
                        if (!db.objectStoreNames.contains('payments')) {
                            var paymentsStore = db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
                            paymentsStore.createIndex('orderId', 'orderId', { unique: false });
                            paymentsStore.createIndex('synced', 'synced', { unique: false });
                        }
                        // Sync queue store
                        if (!db.objectStoreNames.contains('sync_queue')) {
                            var syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                            syncStore.createIndex('status', 'status', { unique: false });
                            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                        }
                    };
                })];
        });
    });
}
/**
 * Save order to IndexedDB
 */
function saveOrder(order) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initIndexedDB()];
                case 1:
                    db = _a.sent();
                    if (!order.localId) {
                        order.localId = "local_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    }
                    order.synced = false;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = db.transaction(['orders'], 'readwrite');
                            var store = transaction.objectStore('orders');
                            var request = store.put(order);
                            request.onsuccess = function () {
                                resolve(order.localId);
                            };
                            request.onerror = function () {
                                reject(new Error('Failed to save order'));
                            };
                        })];
            }
        });
    });
}
/**
 * Get all unsynced orders
 */
function getUnsyncedOrders() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initIndexedDB()];
                case 1:
                    db = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = db.transaction(['orders'], 'readonly');
                            var store = transaction.objectStore('orders');
                            var index = store.index('synced');
                            var request = index.getAll(false);
                            request.onsuccess = function () {
                                resolve(request.result);
                            };
                            request.onerror = function () {
                                reject(new Error('Failed to get unsynced orders'));
                            };
                        })];
            }
        });
    });
}
/**
 * Mark order as synced
 */
function markOrderSynced(localId, serverId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initIndexedDB()];
                case 1:
                    db = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = db.transaction(['orders'], 'readwrite');
                            var store = transaction.objectStore('orders');
                            var getRequest = store.get(localId);
                            getRequest.onsuccess = function () {
                                var order = getRequest.result;
                                if (order) {
                                    order.synced = true;
                                    order.id = serverId;
                                    var putRequest = store.put(order);
                                    putRequest.onsuccess = function () { return resolve(); };
                                    putRequest.onerror = function () { return reject(new Error('Failed to mark order as synced')); };
                                }
                                else {
                                    resolve();
                                }
                            };
                            getRequest.onerror = function () {
                                reject(new Error('Failed to get order'));
                            };
                        })];
            }
        });
    });
}
/**
 * Add item to sync queue
 */
function addToSyncQueue(item) {
    return __awaiter(this, void 0, void 0, function () {
        var db, queueItem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initIndexedDB()];
                case 1:
                    db = _a.sent();
                    queueItem = __assign(__assign({}, item), { timestamp: new Date().toISOString(), retries: 0, status: "Pending:" });
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = db.transaction(['sync_queue'], 'readwrite');
                            var store = transaction.objectStore('sync_queue');
                            var request = store.add(queueItem);
                            request.onsuccess = function () {
                                resolve(request.result);
                            };
                            request.onerror = function () {
                                reject(new Error('Failed to add to sync queue'));
                            };
                        })];
            }
        });
    });
}
/**
 * Get pending sync queue items
 */
function getPendingSyncItems() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initIndexedDB()];
                case 1:
                    db = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = db.transaction(['sync_queue'], 'readonly');
                            var store = transaction.objectStore('sync_queue');
                            var index = store.index('status');
                            var request = index.getAll("Pending:");
                            request.onsuccess = function () {
                                resolve(request.result);
                            };
                            request.onerror = function () {
                                reject(new Error('Failed to get pending sync items'));
                            };
                        })];
            }
        });
    });
}
/**
 * Mark sync item as synced
 */
function markSyncItemSynced(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initIndexedDB()];
                case 1:
                    db = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var transaction = db.transaction(['sync_queue'], 'readwrite');
                            var store = transaction.objectStore('sync_queue');
                            var getRequest = store.get(id);
                            getRequest.onsuccess = function () {
                                var item = getRequest.result;
                                if (item) {
                                    item.status = 'synced';
                                    var putRequest = store.put(item);
                                    putRequest.onsuccess = function () { return resolve(); };
                                    putRequest.onerror = function () { return reject(new Error('Failed to mark sync item as synced')); };
                                }
                                else {
                                    resolve();
                                }
                            };
                            getRequest.onerror = function () {
                                reject(new Error('Failed to get sync item'));
                            };
                        })];
            }
        });
    });
}
