"use strict";
/**
 * PHASE S5.3 - Tipizate Status Badge
 * Status badge component with color coding for tipizate documents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipizateStatusBadge = void 0;
var react_1 = require("react");
var TipizateStatusBadge = function (_a) {
    var status = _a.status, _b = _a.size, size = _b === void 0 ? 'md' : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    var statusConfig = {
        draft: {
            label: 'Ciornă',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            textColor: 'text-gray-800 dark:text-gray-200',
            borderColor: 'border-gray-300 dark:border-gray-600',
            icon: '📝',
        },
        saved: {
            label: 'Salvat',
            bgColor: 'bg-blue-100 dark:bg-blue-900',
            textColor: 'text-blue-800 dark:text-blue-200',
            borderColor: 'border-blue-300 dark:border-blue-600',
            icon: '💾',
        },
        approved: {
            label: 'Aprobat',
            bgColor: 'bg-green-100 dark:bg-green-900',
            textColor: 'text-green-800 dark:text-green-200',
            borderColor: 'border-green-300 dark:border-green-600',
            icon: '✅',
        },
        cancelled: {
            label: 'Anulat',
            bgColor: 'bg-red-100 dark:bg-red-900',
            textColor: 'text-red-800 dark:text-red-200',
            borderColor: 'border-red-300 dark:border-red-600',
            icon: '❌',
        },
        archived: {
            label: 'Arhivat',
            bgColor: 'bg-purple-100 dark:bg-purple-900',
            textColor: 'text-purple-800 dark:text-purple-200',
            borderColor: 'border-purple-300 dark:border-purple-600',
            icon: '📦',
        },
    };
    var config = statusConfig[status] || {
        label: 'Necunoscut',
        bgColor: 'bg-red-100 dark:bg-red-900',
        textColor: 'text-red-800 dark:text-red-200',
        borderColor: 'border-red-300 dark:border-red-600',
        icon: '❓',
    };
    var sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };
    return (<span className={"\n        inline-flex items-center gap-1.5\n        ".concat(config.bgColor, "\n        ").concat(config.textColor, "\n        ").concat(config.borderColor, "\n        border rounded-full font-semibold\n        ").concat(sizeClasses[size], "\n        ").concat(className, "\n      ")} title={"Status: ".concat(config.label)}>
      <span className="text-xs">{config.icon}</span>
      <span>{config.label}</span>
    </span>);
};
exports.TipizateStatusBadge = TipizateStatusBadge;
