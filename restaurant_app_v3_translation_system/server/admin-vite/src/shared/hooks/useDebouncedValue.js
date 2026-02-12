"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebouncedValue = useDebouncedValue;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
function useDebouncedValue(value, delay) {
    if (delay === void 0) { delay = 250; }
    var _a = (0, react_1.useState)(value), debouncedValue = _a[0], setDebouncedValue = _a[1];
    (0, react_1.useEffect)(function () {
        var handle = setTimeout(function () { return setDebouncedValue(value); }, delay);
        return function () { return clearTimeout(handle); };
    }, [value, delay]);
    return debouncedValue;
}
