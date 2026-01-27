/**
 * PHASE S12 - Payment Methods Registry
 * 
 * Registry of available payment methods.
 */

const methods = {
  CASH: {
    label: 'Cash',
    labelRo: 'Numerar',
    needsExternalFlow: false,
    icon: '💵',
  },
  CARD: {
    label: 'Card',
    labelRo: 'Card',
    needsExternalFlow: true, // May require terminal confirmation
    icon: '💳',
  },
  VOUCHER: {
    label: 'Voucher',
    labelRo: 'Voucher',
    needsExternalFlow: false,
    icon: '🎫',
  },
  TRANSFER: {
    label: 'Bank Transfer',
    labelRo: 'Transfer Bancar',
    needsExternalFlow: false,
    icon: '🏦',
  },
  OTHER: {
    label: 'Other',
    labelRo: 'Altele',
    needsExternalFlow: false,
    icon: '📝',
  },
};

/**
 * Get all available payment methods
 */
function getAllMethods() {
  return Object.keys(methods).map((key) => ({
    key,
    ...methods[key],
  }));
}

/**
 * Get method by key
 */
function getMethod(key) {
  return methods[key] || null;
}

/**
 * Check if method needs external flow
 */
function needsExternalFlow(methodKey) {
  const method = getMethod(methodKey);
  return method ? method.needsExternalFlow : false;
}

module.exports = {
  methods,
  getAllMethods,
  getMethod,
  needsExternalFlow,
};

