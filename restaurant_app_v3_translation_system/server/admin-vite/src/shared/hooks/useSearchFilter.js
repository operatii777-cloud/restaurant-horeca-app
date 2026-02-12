"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSearchFilter = useSearchFilter;
var react_1 = require("react");
function useSearchFilter(items, searchTerm, selectors) {
    return (0, react_1.useMemo)(function () {
        var source = Array.isArray(items) ? items : [];
        var trimmed = (searchTerm !== null && searchTerm !== void 0 ? searchTerm : '').trim().toLowerCase();
        if (!trimmed) {
            return source;
        }
        return source.filter(function (item) {
            return selectors.some(function (selector) {
                try {
                    var value = selector(item);
                    if (value === null || value === undefined) {
                        return false;
                    }
                    return String(value).toLowerCase().includes(trimmed);
                }
                catch (_a) {
                    return false;
                }
            });
        });
    }, [items, searchTerm, selectors]);
}
