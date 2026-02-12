"use strict";
/**
 * PHASE S5.5 - Tipizate Context
 * Enterprise context for UI settings and grid preferences
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTipizateContext = exports.TipizateProvider = void 0;
var react_1 = require("react");
var tipizateStore_1 = require("../store/tipizateStore");
var TipizateContext = (0, react_1.createContext)(null);
var TipizateProvider = function (_a) {
    var children = _a.children;
    var ui = (0, tipizateStore_1.useTipizateStore)(function (s) { return s.ui; });
    var setUi = (0, tipizateStore_1.useTipizateStore)(function (s) { return s.setUi; });
    var toggleColumn = (0, tipizateStore_1.useTipizateStore)(function (s) { return s.toggleColumn; });
    return (<TipizateContext.Provider value={{ ui: ui, setUi: setUi, toggleColumn: toggleColumn }}>
      {children}
    </TipizateContext.Provider>);
};
exports.TipizateProvider = TipizateProvider;
var useTipizateContext = function () {
    var context = (0, react_1.useContext)(TipizateContext);
    if (!context) {
        throw new Error('useTipizateContext must be used within TipizateProvider');
    }
    return context;
};
exports.useTipizateContext = useTipizateContext;
