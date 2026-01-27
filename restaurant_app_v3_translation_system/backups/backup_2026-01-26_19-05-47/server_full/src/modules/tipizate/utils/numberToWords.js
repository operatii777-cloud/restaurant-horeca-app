/**
 * PHASE S6.1 - Number to Words Converter (Romanian) - JavaScript Version
 * Converts numbers to Romanian words for receipts and invoices
 * 
 * Example: 1234.56 → "una mie două sute treizeci și patru lei și cincizeci și șase bani"
 */

const ONES = [
  '', 'unu', 'două', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă',
  'zece', 'unsprezece', 'douăsprezece', 'treisprezece', 'paisprezece',
  'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece'
];

const TENS = [
  '', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci',
  'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci'
];

const HUNDREDS = [
  '', 'o sută', 'două sute', 'trei sute', 'patru sute', 'cinci sute',
  'șase sute', 'șapte sute', 'opt sute', 'nouă sute'
];

/**
 * Convert a number (0-999) to Romanian words
 */
function convertHundreds(num) {
  if (num === 0) return '';
  if (num < 20) return ONES[num];
  
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  
  if (tens === 1) {
    return ONES[num];
  }
  
  if (ones === 0) {
    return TENS[tens];
  }
  
  return `${TENS[tens]} și ${ONES[ones]}`;
}

/**
 * Convert a number (0-999999) to Romanian words
 */
function convertThousands(num) {
  if (num === 0) return 'zero';
  
  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;
  
  let result = '';
  
  if (thousands > 0) {
    if (thousands === 1) {
      result = 'o mie';
    } else {
      result = `${convertHundreds(thousands)} mii`;
    }
  }
  
  if (remainder > 0) {
    const hundreds = Math.floor(remainder / 100);
    const tensAndOnes = remainder % 100;
    
    if (hundreds > 0) {
      if (result) result += ' ';
      result += HUNDREDS[hundreds];
    }
    
    if (tensAndOnes > 0) {
      if (result) result += ' ';
      result += convertHundreds(tensAndOnes);
    }
  }
  
  return result || 'zero';
}

/**
 * Convert a number to Romanian words with lei and bani
 * @param {number} amount - Amount in RON (e.g., 1234.56)
 * @returns {string} Romanian words (e.g., "una mie două sute treizeci și patru lei și cincizeci și șase bani")
 */
function numberToWords(amount) {
  if (amount < 0) {
    return 'minus ' + numberToWords(-amount);
  }
  
  if (amount === 0) {
    return 'zero lei';
  }
  
  // Split into integer and decimal parts
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  
  let result = '';
  
  // Convert integer part
  if (integerPart > 0) {
    result = convertThousands(integerPart);
    
    // Add "lei" with correct form
    if (integerPart === 1) {
      result += ' leu';
    } else {
      result += ' lei';
    }
  } else {
    result = 'zero lei';
  }
  
  // Convert decimal part (bani)
  if (decimalPart > 0) {
    if (result) result += ' și ';
    
    const bani = convertHundreds(decimalPart);
    if (decimalPart === 1) {
      result += 'un ban';
    } else {
      result += `${bani} bani`;
    }
  }
  
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Format amount in words for receipts (with "RON" suffix)
 */
function formatAmountInWords(amount) {
  return numberToWords(amount) + ' RON';
}

module.exports = {
  numberToWords,
  formatAmountInWords
};

