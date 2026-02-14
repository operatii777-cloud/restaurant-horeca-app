"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERFACE_METADATA = exports.PIN_ROTATION_WARNING_DAYS = exports.PIN_ROTATION_INTERVAL_DAYS = void 0;
exports.getInterfaceMetadata = getInterfaceMetadata;
exports.computeRotationStatus = computeRotationStatus;
exports.summarizeRotationStatuses = summarizeRotationStatuses;
var DAY_IN_MS = 24 * 60 * 60 * 1000;
exports.PIN_ROTATION_INTERVAL_DAYS = 30;
exports.PIN_ROTATION_WARNING_DAYS = 5;
var buildInterfaceMetadata = function () {
    var metadata = {
        admin: { label: 'Admin Panel', category: 'Admin', sortIndex: 1 },
        kds: { label: 'Bucătărie (KDS)', category: 'Bucătărie', sortIndex: 5 },
        bar: { label: 'Bar', category: 'Bar', sortIndex: 6 },
    };
    for (var index = 1; index <= 10; index += 1) {
        var from = (index - 1) * 20 + 1;
        var to = index * 20;
        metadata["livrare\"Index\""] = {
            label: "Osp\u0103tar \"Index\" (Mese \"From\"-\"To\")",
            category: 'Ospătari POS',
            sortIndex: 10 + index,
        };
    }
    for (var index = 1; index <= 10; index += 1) {
        metadata["comanda-supervisor\"Index\""] = {
            label: "Comand\u0103 Supervisor \"Index\"",
            category: 'Supervisori Comenzi',
            sortIndex: 40 + index,
        };
    }
    return metadata;
};
exports.INTERFACE_METADATA = buildInterfaceMetadata();
function getInterfaceMetadata(interfaceId) {
    var _a;
    return ((_a = exports.INTERFACE_METADATA[interfaceId]) !== null && _a !== void 0 ? _a : {
        label: interfaceId,
        category: 'Altele',
        sortIndex: 999,
    });
}
var formatDateTime = function (value) {
    if (!value) {
        return '—';
    }
    return value.toLocaleString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
function computeRotationStatus(pin) {
    if (!pin.hasPin) {
        return {
            kind: 'missing',
            label: 'Nesetat',
            summary: 'Configurează un PIN pentru această interfață.',
            lastRotatedAt: null,
            lastRotatedLabel: '—',
            dueAt: null,
            daysSinceRotation: null,
            daysUntilDue: null,
        };
    }
    if (pin.legacy) {
        return {
            kind: 'legacy',
            label: 'Legacy',
            summary: 'PIN stocat în clar – necesită migrare la format hash.',
            lastRotatedAt: null,
            lastRotatedLabel: '—',
            dueAt: null,
            daysSinceRotation: null,
            daysUntilDue: null,
        };
    }
    if (!pin.lastRotatedAt) {
        return {
            kind: 'unknown',
            label: 'Necunoscut',
            summary: 'Nu există informații despre rotația PIN-ului.',
            lastRotatedAt: null,
            lastRotatedLabel: '—',
            dueAt: null,
            daysSinceRotation: null,
            daysUntilDue: null,
        };
    }
    var rotatedAt = new Date(pin.lastRotatedAt);
    if (Number.isNaN(rotatedAt.getTime())) {
        return {
            kind: 'unknown',
            label: 'Necunoscut',
            summary: 'Data rotației este invalidă.',
            lastRotatedAt: null,
            lastRotatedLabel: '—',
            dueAt: null,
            daysSinceRotation: null,
            daysUntilDue: null,
        };
    }
    var dueAt = new Date(rotatedAt.getTime() + exports.PIN_ROTATION_INTERVAL_DAYS * DAY_IN_MS);
    var now = new Date();
    var daysSinceRotation = Math.max(0, Math.floor((now.getTime() - rotatedAt.getTime()) / DAY_IN_MS));
    var daysUntilDue = Math.ceil((dueAt.getTime() - now.getTime()) / DAY_IN_MS);
    var kind = 'ok';
    if (now >= dueAt) {
        kind = 'due';
    }
    else if (daysUntilDue <= exports.PIN_ROTATION_WARNING_DAYS) {
        kind = 'warning';
    }
    var label = 'Valabil';
    if (kind === 'warning') {
        label = "Aten\u021Bie (".concat(Math.max(daysUntilDue, 0), " zile)");
    }
    else if (kind === 'due') {
        label = 'Expirat';
    }
    var summary = "Rotit acum ".concat(daysSinceRotation, " zile.");
    if (kind === 'warning') {
        summary = "Rota\u021Bie necesar\u0103 \u00EEn ".concat(Math.max(daysUntilDue, 0), " zile.");
    }
    else if (kind === 'due') {
        summary = "Rota\u021Bie \u00EEnt\u00E2rziat\u0103 cu ".concat(Math.max(daysSinceRotation - exports.PIN_ROTATION_INTERVAL_DAYS, 0), " zile.");
    }
    return {
        kind: kind,
        label: label,
        summary: summary,
        lastRotatedAt: rotatedAt,
        lastRotatedLabel: formatDateTime(rotatedAt),
        dueAt: dueAt,
        daysSinceRotation: daysSinceRotation,
        daysUntilDue: daysUntilDue,
    };
}
function summarizeRotationStatuses(pins) {
    var summary = {
        total: pins.length,
        configured: 0,
        due: 0,
        warning: 0,
        legacy: 0,
        missing: 0,
        ok: 0,
    };
    pins.forEach(function (pin) {
        var rotation = computeRotationStatus(pin);
        if (pin.hasPin && !pin.legacy && rotation.kind !== 'missing' && rotation.kind !== 'legacy') {
            summary.configured += 1;
        }
        switch (rotation.kind) {
            case 'missing':
                summary.missing += 1;
                break;
            case 'legacy':
                summary.legacy += 1;
                break;
            case 'warning':
                summary.warning += 1;
                break;
            case 'due':
                summary.due += 1;
                break;
            case 'ok':
                summary.ok += 1;
                break;
            default:
                break;
        }
    });
    return summary;
}
