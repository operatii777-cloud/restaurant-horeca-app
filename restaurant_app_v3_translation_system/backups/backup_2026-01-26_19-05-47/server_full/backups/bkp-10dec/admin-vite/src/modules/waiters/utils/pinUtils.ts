import type { InterfacePin } from '@/types/pins';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const PIN_ROTATION_INTERVAL_DAYS = 30;
export const PIN_ROTATION_WARNING_DAYS = 5;

export type RotationStatusKind = 'missing' | 'legacy' | 'due' | 'warning' | 'ok' | 'unknown';

export type RotationStatus = {
  kind: RotationStatusKind;
  label: string;
  summary: string;
  lastRotatedAt: Date | null;
  lastRotatedLabel: string;
  dueAt: Date | null;
  daysSinceRotation: number | null;
  daysUntilDue: number | null;
};

export type InterfaceMetadata = {
  label: string;
  category: string;
  sortIndex: number;
};

const buildInterfaceMetadata = (): Record<string, InterfaceMetadata> => {
  const metadata: Record<string, InterfaceMetadata> = {
    admin: { label: 'Admin Panel', category: 'Admin', sortIndex: 1 },
    kds: { label: 'Bucătărie (KDS)', category: 'Bucătărie', sortIndex: 5 },
    bar: { label: 'Bar', category: 'Bar', sortIndex: 6 },
  };

  for (let index = 1; index <= 10; index += 1) {
    const from = (index - 1) * 20 + 1;
    const to = index * 20;
    metadata[`livrare${index}`] = {
      label: `Ospătar ${index} (Mese ${from}-${to})`,
      category: 'Ospătari POS',
      sortIndex: 10 + index,
    };
  }

  for (let index = 1; index <= 10; index += 1) {
    metadata[`comanda-supervisor${index}`] = {
      label: `Comandă Supervisor ${index}`,
      category: 'Supervisori Comenzi',
      sortIndex: 40 + index,
    };
  }

  return metadata;
};

export const INTERFACE_METADATA = buildInterfaceMetadata();

export function getInterfaceMetadata(interfaceId: string): InterfaceMetadata {
  return (
    INTERFACE_METADATA[interfaceId] ?? {
      label: interfaceId,
      category: 'Altele',
      sortIndex: 999,
    }
  );
}

const formatDateTime = (value: Date | null): string => {
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

export function computeRotationStatus(pin: InterfacePin): RotationStatus {
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

  const rotatedAt = new Date(pin.lastRotatedAt);
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

  const dueAt = new Date(rotatedAt.getTime() + PIN_ROTATION_INTERVAL_DAYS * DAY_IN_MS);
  const now = new Date();
  const daysSinceRotation = Math.max(0, Math.floor((now.getTime() - rotatedAt.getTime()) / DAY_IN_MS));
  const daysUntilDue = Math.ceil((dueAt.getTime() - now.getTime()) / DAY_IN_MS);

  let kind: RotationStatusKind = 'ok';
  if (now >= dueAt) {
    kind = 'due';
  } else if (daysUntilDue <= PIN_ROTATION_WARNING_DAYS) {
    kind = 'warning';
  }

  let label = 'Valabil';
  if (kind === 'warning') {
    label = `Atenție (${Math.max(daysUntilDue, 0)} zile)`;
  } else if (kind === 'due') {
    label = 'Expirat';
  }

  let summary = `Rotit acum ${daysSinceRotation} zile.`;
  if (kind === 'warning') {
    summary = `Rotație necesară în ${Math.max(daysUntilDue, 0)} zile.`;
  } else if (kind === 'due') {
    summary = `Rotație întârziată cu ${Math.max(daysSinceRotation - PIN_ROTATION_INTERVAL_DAYS, 0)} zile.`;
  }

  return {
    kind,
    label,
    summary,
    lastRotatedAt: rotatedAt,
    lastRotatedLabel: formatDateTime(rotatedAt),
    dueAt,
    daysSinceRotation,
    daysUntilDue,
  };
}

export type PinRotationSummary = {
  total: number;
  configured: number;
  due: number;
  warning: number;
  legacy: number;
  missing: number;
  ok: number;
};

export function summarizeRotationStatuses(pins: InterfacePin[]): PinRotationSummary {
  const summary: PinRotationSummary = {
    total: pins.length,
    configured: 0,
    due: 0,
    warning: 0,
    legacy: 0,
    missing: 0,
    ok: 0,
  };

  pins.forEach((pin) => {
    const rotation = computeRotationStatus(pin);

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


