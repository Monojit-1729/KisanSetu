/**
 * KisanSetu A8 — SMS Command Parser
 * Deterministic tokenizer and validator for basic feature-phone text messages.
 */

const CROP_CANONICAL_MAP = {
  tomato: 'Tomato',
  tomatoes: 'Tomato',
  tamatar: 'Tomato',
  onion: 'Onion',
  onions: 'Onion',
  pyaz: 'Onion',
  kanda: 'Onion',
  wheat: 'Wheat',
  gehu: 'Wheat',
  gehun: 'Wheat',
  soybean: 'Soybean',
  soya: 'Soybean',
  soyabean: 'Soybean',
  grapes: 'Grapes',
  grape: 'Grapes',
  angur: 'Grapes',
  draksh: 'Grapes',
  cotton: 'Cotton',
  kapas: 'Cotton',
  pomegranate: 'Pomegranate',
  anar: 'Pomegranate',
  dalimb: 'Pomegranate',
  potato: 'Potato',
  potatoes: 'Potato',
  alu: 'Potato',
  aloo: 'Potato',
  maize: 'Maize',
  makka: 'Maize',
  corn: 'Maize',
  chilli: 'Green Chilli',
  mirchi: 'Green Chilli',
  rice: 'Rice',
  chawal: 'Rice',
  dhan: 'Rice',
};

export const parseSmsMessage = (rawText = '') => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      isValid: false,
      command: 'EMPTY',
      error: 'No text message provided.',
    };
  }

  // Normalize whitespace and punctuation
  const normalized = rawText.trim().replace(/\s+/g, ' ');
  const upper = normalized.toUpperCase();

  // 1. HELP / INFO Command
  if (['HELP', 'INFO', 'COMMANDS', '?', 'MADAD'].includes(upper)) {
    return {
      isValid: true,
      command: 'HELP',
      raw: normalized,
    };
  }

  // 2. BUY <buyer-code> Command (e.g. "BUY A", "BUY 1", "BUY B") or single letter "A"
  const buyMatch = normalized.match(/^(?:BUY\s+)?([A-Za-z0-9])$/i);
  if (buyMatch && (upper.startsWith('BUY ') || buyMatch[1].length === 1)) {
    return {
      isValid: true,
      command: 'BUY',
      buyerCode: buyMatch[1].toUpperCase(),
      raw: normalized,
    };
  }

  // 3. SELL <quantity> [unit] <crop> Command (e.g. "SELL 2000 TOMATO", "SELL 50 Q WHEAT", "SELL 1000KG ONION")
  if (upper.startsWith('SELL')) {
    // Remove "SELL" prefix
    const rest = normalized.slice(4).trim();
    if (!rest) {
      return {
        isValid: false,
        command: 'SELL',
        error: 'Missing quantity and crop name. Example: SELL 2000 TOMATO',
      };
    }

    // Match quantity and optional unit followed by crop
    // Patterns: "2000 TOMATO", "2000 KG TOMATO", "20 Q ONION", "50QUINTAL WHEAT"
    const sellRegex = /^(\d+(?:\.\d+)?)\s*(KG|QUINTAL|Q|TONNE|TONS|T)?\s+(.+)$/i;
    const match = rest.match(sellRegex);

    if (!match) {
      return {
        isValid: false,
        command: 'SELL',
        error: 'Invalid SELL format. Example: SELL 2000 TOMATO or SELL 50 Q WHEAT',
      };
    }

    const quantity = parseFloat(match[1]);
    if (isNaN(quantity) || quantity <= 0) {
      return {
        isValid: false,
        command: 'SELL',
        error: 'Quantity must be a positive number greater than zero.',
      };
    }

    const rawUnit = (match[2] || '').toUpperCase();
    let unit = 'kg';
    if (rawUnit === 'Q' || rawUnit === 'QUINTAL') {
      unit = 'quintal';
    } else if (rawUnit === 'TONNE' || rawUnit === 'TONS' || rawUnit === 'T') {
      unit = 'tonne';
    } else if (rawUnit === 'KG') {
      unit = 'kg';
    } else {
      // Default inference: quantities >= 100 are typically in kg, < 100 can be quintals or kg
      unit = quantity >= 100 ? 'kg' : 'quintal';
    }

    const rawCrop = match[3].trim().toLowerCase();
    const canonicalCrop = CROP_CANONICAL_MAP[rawCrop];

    if (!canonicalCrop) {
      return {
        isValid: false,
        command: 'SELL',
        quantity,
        unit,
        rawCrop,
        error: `Crop "${match[3].trim()}" not recognized. Supported: Tomato, Onion, Wheat, Soybean, Grapes, Cotton, Pomegranate, Potato, Maize.`,
      };
    }

    return {
      isValid: true,
      command: 'SELL',
      quantity,
      unit,
      crop: canonicalCrop,
      raw: normalized,
    };
  }

  // 4. Unknown command
  return {
    isValid: false,
    command: 'UNKNOWN',
    raw: normalized,
    error: 'Unrecognized SMS command. Send "HELP" for instructions or "SELL 2000 TOMATO".',
  };
};

export default parseSmsMessage;
