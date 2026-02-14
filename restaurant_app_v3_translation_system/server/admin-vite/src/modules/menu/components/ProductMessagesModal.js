"use strict";
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
exports.ProductMessagesModal = ProductMessagesModal;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var Modal_1 = require("@/shared/components/Modal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var httpClient_1 = require("@/shared/api/httpClient");
require("./ProductMessagesModal.css");
var RECEIVER_OPTIONS = [
    { value: 'all', label: '📢 Toate compartimentele' },
    { value: 'kitchen', label: '👨‍🍳 Bucătărie' },
    { value: 'bar', label: '🍹 Bar' },
    { value: 'waiter1', label: '🍽️ Ospătar 1' },
    { value: 'waiter2', label: '🍽️ Ospătar 2' },
    { value: 'waiter3', label: '🍽️ Ospătar 3' },
    { value: 'waiter4', label: '🍽️ Ospătar 4' },
    { value: 'waiter5', label: '🍽️ Ospătar 5' },
    { value: 'waiter6', label: '🍽️ Ospătar 6' },
    { value: 'waiter7', label: '🍽️ Ospătar 7' },
    { value: 'waiter8', label: '🍽️ Ospătar 8' },
    { value: 'waiter9', label: '🍽️ Ospătar 9' },
    { value: 'waiter10', label: '🍽️ Ospătar 10' },
];
var ADMIN_ROLE = 'admin';
var ADMIN_ID = '1';
function ProductMessagesModal(_a) {
    var _this = this;
    var open = _a.open, product = _a.product, onClose = _a.onClose, onMessageSent = _a.onMessageSent;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)('kitchen'), receiver = _b[0], setReceiver = _b[1];
    var _c = (0, react_1.useState)(''), messageContent = _c[0], setMessageContent = _c[1];
    var _d = (0, react_1.useState)([]), messages = _d[0], setMessages = _d[1];
    var _e = (0, react_1.useState)(false), loadingMessages = _e[0], setLoadingMessages = _e[1];
    var _f = (0, react_1.useState)(false), sending = _f[0], setSending = _f[1];
    var _g = (0, react_1.useState)(null), loadError = _g[0], setLoadError = _g[1];
    var _h = (0, react_1.useState)(null), sendError = _h[0], setSendError = _h[1];
    var defaultMessage = (0, react_1.useMemo)(function () {
        if (!product) {
            return '';
        }
        var category = product.category ? " [".concat(product.category, "]") : '';
        return "Verificare produs: ".concat(product.name, "\"Category\"");
    }, [product]);
    (0, react_1.useEffect)(function () {
        if (!open) {
            return;
        }
        setReceiver('kitchen');
        setMessageContent(defaultMessage);
        setSendError(null);
        loadLatestMessages();
    }, [open, defaultMessage]);
    var loadLatestMessages = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1, message;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    setLoadingMessages(true);
                    setLoadError(null);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/messages/".concat(ADMIN_ROLE, "/").concat(ADMIN_ID), {
                            params: { limit: 20 },
                        })];
                case 2:
                    response = _e.sent();
                    setMessages(Array.isArray(response.data) ? response.data : []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _e.sent();
                    message = (_d = (_c = (_b = (_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) !== null && _c !== void 0 ? _c : error_1 === null || error_1 === void 0 ? void 0 : error_1.message) !== null && _d !== void 0 ? _d : 'Nu am putut încărca mesajele recente.';
                    setLoadError(message);
                    setMessages([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingMessages(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var trimmedContent, response, data, error_2, message;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    event.preventDefault();
                    setSendError(null);
                    if (!receiver) {
                        setSendError('Selectează un destinatar pentru mesaj.');
                        return [2 /*return*/];
                    }
                    trimmedContent = messageContent.trim();
                    if (trimmedContent.length < 5) {
                        setSendError('Mesajul trebuie să conțină cel puțin 5 caractere.');
                        return [2 /*return*/];
                    }
                    setSending(true);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, httpClient_1.httpClient.post('/api/messages/send', {
                            senderType: ADMIN_ROLE,
                            senderId: ADMIN_ID,
                            receiverType: receiver,
                            receiverId: '1',
                            messageType: 'product-alert',
                            messageContent: trimmedContent,
                        })];
                case 2:
                    response = _f.sent();
                    data = response.data;
                    if (!(data === null || data === void 0 ? void 0 : data.error)) return [3 /*break*/, 3];
                    setSendError(data.error);
                    return [3 /*break*/, 5];
                case 3:
                    onMessageSent((_a = data === null || data === void 0 ? void 0 : data.message) !== null && _a !== void 0 ? _a : 'Mesaj trimis cu succes.', data === null || data === void 0 ? void 0 : data.messageId);
                    setMessageContent(defaultMessage);
                    return [4 /*yield*/, loadLatestMessages()];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_2 = _f.sent();
                    message = (_e = (_d = (_c = (_b = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) !== null && _d !== void 0 ? _d : error_2 === null || error_2 === void 0 ? void 0 : error_2.message) !== null && _e !== void 0 ? _e : 'Nu am putut trimite mesajul.';
                    setSendError(message);
                    return [3 /*break*/, 8];
                case 7:
                    setSending(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var filteredMessages = (0, react_1.useMemo)(function () {
        return messages.filter(function (message) {
            var isIncoming = message.receiver_type === ADMIN_ROLE && String(message.receiver_id) === ADMIN_ID;
            var isOutgoing = message.sender_type === ADMIN_ROLE && String(message.sender_id) === ADMIN_ID;
            return isIncoming || isOutgoing;
        });
    }, [messages]);
    return (<Modal_1.Modal isOpen={open} onClose={onClose} title={product ? "Mesaje interne \u00B7 ".concat(product.name) : 'Mesaje interne'} description="Trimite notificări rapide către echipă: bucătărie, bar sau ospătari. Mesajele sunt livrate instant prin canalul intern." size="lg">
      {loadError ? <InlineAlert_1.InlineAlert variant="error" title="nu am putut incarca istoricul" message={loadError}/> : null}

      <div className="product-messages-layout">
        <section className="product-messages-history">
          <header>
            <h4>Istoric recent</h4>
            <button type="button" className="messages-refresh" onClick={loadLatestMessages} disabled={loadingMessages}>
              {loadingMessages ? 'Se încarcă…' : 'Reîncarcă'}
            </button>
          </header>

          {filteredMessages.length === 0 ? (<div className="product-messages-empty">"nu exista mesaje inregistrate pentru administrator"</div>) : (<ul className="product-messages-list">
              {filteredMessages.map(function (message) {
                var timestamp = new Intl.DateTimeFormat('ro-RO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }).format(new Date(message.timestamp));
                return (<li key={message.id} className="product-message-item">
                    <div className="product-message-meta">
                      <span className="product-message-sender">{message.sender_type.toUpperCase()}</span>
                      <span className="product-message-time">{timestamp}</span>
                    </div>
                    <p className="product-message-content">{message.message_content}</p>
                    {message.table_number ? <span className="product-message-table">Masa: {message.table_number}</span> : null}
                  </li>);
            })}
            </ul>)}
        </section>

        <section className="product-messages-compose">
          <form className="product-messages-form" onSubmit={handleSubmit}>
            <label className="product-messages-field">
              <span>Destinatar</span>
              <select value={receiver} onChange={function (event) { return setReceiver(event.target.value); }}>
                {RECEIVER_OPTIONS.map(function (option) { return (<option key={option.value} value={option.value}>
                    {option.label}
                  </option>); })}
              </select>
            </label>

            <label className="product-messages-field">
              <span>Mesaj</span>
              <textarea rows={4} value={messageContent} onChange={function (event) { return setMessageContent(event.target.value); }} placeholder='[scrie_mesajul_pentru_echipa…]'/>
            </label>

            {sendError ? <InlineAlert_1.InlineAlert variant="warning" title="verifica mesajul" message={sendError}/> : null}

            <div className="product-messages-actions">
              <button type="button" className="menu-product-button menu-product-button--ghost" onClick={onClose} disabled={sending}>"Închide"</button>
              <button type="submit" className="menu-product-button menu-product-button--primary" disabled={sending}>
                {sending ? 'Se trimite…' : 'Trimite mesajul'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Modal_1.Modal>);
}
