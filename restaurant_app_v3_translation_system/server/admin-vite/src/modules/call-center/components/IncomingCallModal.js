"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingCallModal = void 0;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var socket_io_client_1 = require("socket.io-client");
var react_router_dom_1 = require("react-router-dom");
var IncomingCallModal = function () {
    var _a = (0, react_1.useState)(null), call = _a[0], setCall = _a[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(function () {
        // Connect to global socket (or create new connection if needed)
        // Assuming global `socket` or connecting to relative path
        var socket = (0, socket_io_client_1.default)('/', { path: '/socket.io' });
        socket.on('call:incoming', function (data) {
            console.log('📞 Incoming Call received:', data);
            // Play sound
            try {
                var audio = new Audio('/sounds/ringtone.mp3'); // Ensure this file exists or use a default beep
                audio.play().catch(function (e) { return console.warn('Audio play failed', e); });
            }
            catch (e) { }
            setCall(data);
        });
        return function () {
            socket.off('call:incoming');
            socket.disconnect();
        };
    }, []);
    var handleDismiss = function () { return setCall(null); };
    var handleTakeOrder = function () {
        if (!call)
            return;
        // Redirect to POS/Order page with customer pre-selected
        // Example: /kiosk or /admin/orders/new
        // We'll assume a generic route for now
        if (call.customerId) {
            window.location.href = "/admin-advanced.html#new-order?customerId=".concat(call.customerId); // Legacy compatible
        }
        else {
            window.location.href = "/admin-advanced.html#new-order?phone=".concat(call.phoneNumber, "&name=").concat(encodeURIComponent(call.customerName));
        }
        setCall(null);
    };
    return (<framer_motion_1.AnimatePresence>
            {call && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed bottom-6 right-6 z-[9999] w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-primary overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full animate-pulse">
                                <lucide_react_1.Phone size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Apel Intrat...</h3>
                                <p className="text-xs opacity-80">Caller ID: {call.phoneNumber}</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <lucide_react_1.X size={20}/>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                {call.customerName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{call.customerName}</h4>
                                {call.isVip && (<span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-200">
                                        VIP CUSTOMER
                                    </span>)}
                            </div>
                        </div>

                        {call.lastOrder && (<div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4 text-sm border border-slate-100 dark:border-slate-600">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                    <lucide_react_1.Clock size={14}/>
                                    <span>Ultima comandă: {new Date(call.lastOrder.date).toLocaleDateString('ro-RO')}</span>
                                </div>
                                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                    <lucide_react_1.ShoppingBag size={14}/>
                                    <span>Total: {call.lastOrder.total.toFixed(2)} RON</span>
                                </div>
                            </div>)}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleDismiss} className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                Ignoră
                            </button>
                            <button onClick={handleTakeOrder} className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                                <lucide_react_1.Check size={18}/> Preluare
                            </button>
                        </div>
                    </div>
                </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>);
};
exports.IncomingCallModal = IncomingCallModal;
