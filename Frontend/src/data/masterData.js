/**
 * KisanSetu Centralized Master Data & Controlled Vocabularies
 *
 * Single authoritative source for:
 * - India-wide Location Hierarchy (States, Districts, Sub-districts)
 * - Canonical Produce Crops & Normalization
 * - Produce Units & Quality Grades
 * - Agronomic parameters (Soil Types, Irrigation Sources)
 * - Platform Controlled Vocabularies (Languages, Buyer Categories, Supported APMC Markets)
 */

import {
  INDIAN_STATES_AND_UTS,
  INDIAN_STATES,
  getDistrictsForState,
  getSubDistrictTermForState,
  normalizeDistrict,
  getSubDistrictsForDistrict,
  getTalukasForDistrict,
  INDIA_LOCATIONS,
  MAHARASHTRA_LOCATIONS,
} from './locations.js';

// Re-export all location utilities
export {
  INDIAN_STATES_AND_UTS,
  INDIAN_STATES,
  getDistrictsForState,
  getSubDistrictTermForState,
  normalizeDistrict,
  getSubDistrictsForDistrict,
  getTalukasForDistrict,
  INDIA_LOCATIONS,
  MAHARASHTRA_LOCATIONS,
};

/**
 * Authoritative Canonical Crops List
 * Contains all commodities supported across lots, demands, APMC markets, and profiles.
 */
export const CANONICAL_CROPS = [
  'Bajra',
  'Cotton',
  'Ginger',
  'Gram (Chana)',
  'Grapes',
  'Green Chilli',
  'Maize',
  'Onion',
  'Pomegranate',
  'Potato',
  'Pulses / Dal',
  'Rice',
  'Soybean',
  'Sugarcane',
  'Tomato',
  'Turmeric',
  'Wheat',
];

/**
 * Aliases for crop normalization across different user entries / historical records.
 */
const CROP_ALIASES = {
  tomato: 'Tomato',
  onion: 'Onion',
  wheat: 'Wheat',
  cotton: 'Cotton',
  soybean: 'Soybean',
  grapes: 'Grapes',
  pomegranate: 'Pomegranate',
  potato: 'Potato',
  rice: 'Rice',
  maize: 'Maize',
  bajra: 'Bajra',
  sugarcane: 'Sugarcane',
  chilli: 'Green Chilli',
  'green chilli': 'Green Chilli',
  'green chili': 'Green Chilli',
  chili: 'Green Chilli',
  turmeric: 'Turmeric',
  ginger: 'Ginger',
  gram: 'Gram (Chana)',
  chana: 'Gram (Chana)',
  'gram (chana)': 'Gram (Chana)',
  pulses: 'Pulses / Dal',
  dal: 'Pulses / Dal',
  'pulses / dal': 'Pulses / Dal',
};

/**
 * Normalizes user-input crop names to the canonical title.
 * Preserves original text if no direct canonical alias match is found.
 */
export const normalizeCropName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return '';
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();
  if (CROP_ALIASES[lower]) return CROP_ALIASES[lower];

  // Check if exactly matches canonical with different casing
  const match = CANONICAL_CROPS.find((c) => c.toLowerCase() === lower);
  if (match) return match;

  // Title-case fallback
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Produce Quantity Measurement Units
 */
export const PRODUCE_UNITS = [
  { value: 'quintal', label: 'Quintal (100 kg)', short: 'q' },
  { value: 'tonne', label: 'Tonne (1,000 kg)', short: 't' },
  { value: 'kg', label: 'Kilogram (kg)', short: 'kg' },
];

/**
 * Produce Quality Grading
 */
export const QUALITY_GRADES = [
  { value: 'A', label: 'Grade A (Premium)' },
  { value: 'B', label: 'Grade B (Standard)' },
  { value: 'C', label: 'Grade C (Basic)' },
];

/**
 * Buyer Demand Quality Options (Includes 'Any')
 */
export const DEMAND_QUALITY_OPTIONS = [
  { value: 'Any', label: 'Any Grade (A, B, or C)' },
  { value: 'A', label: 'Grade A (Premium)' },
  { value: 'B', label: 'Grade B (Standard)' },
  { value: 'C', label: 'Grade C (Basic)' },
];

/**
 * Filter Grade Options for Marketplace
 */
export const FILTER_GRADE_OPTIONS = [
  { value: '', label: 'All Grades' },
  { value: 'A', label: 'Grade A (Premium)' },
  { value: 'B', label: 'Grade B (Standard)' },
  { value: 'C', label: 'Grade C (Basic)' },
];

/**
 * Agricultural Soil Classifications
 */
export const SOIL_TYPES = [
  { value: 'Black Cotton', label: 'Black Cotton Loam' },
  { value: 'Alluvial', label: 'Alluvial / Fertile Silt' },
  { value: 'Red / Laterite', label: 'Red Soil / Laterite' },
  { value: 'Sandy Loam', label: 'Sandy Loam' },
  { value: 'Clay Loam', label: 'Clay Loam' },
];

/**
 * Farm Irrigation Sources
 */
export const IRRIGATION_SOURCES = [
  { value: 'Drip & Borewell', label: 'Drip & Borewell' },
  { value: 'Canal / Surface Flow', label: 'Canal / Surface Flow' },
  { value: 'Sprinkler Irrigation', label: 'Sprinkler Irrigation' },
  { value: 'Open Well / Pump', label: 'Open Well / Pump' },
  { value: 'River / Lift Irrigation', label: 'River / Lift Irrigation' },
  { value: 'Rainfed / Dryland', label: 'Rainfed / Dryland' },
];

/**
 * Supported Multilingual Interface Languages
 */
export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'mr', label: 'Marathi (मराठी)' },
  { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'te', label: 'Telugu (తెలుగు)' },
  { value: 'ta', label: 'Tamil (தமிழ்)' },
  { value: 'bn', label: 'Bengali (বাংলা)' },
  { value: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
];

/**
 * Commercial Buyer Categories
 */
export const BUYER_CATEGORIES = [
  { value: 'wholesaler', label: 'Wholesaler / APMC Trader' },
  { value: 'processor', label: 'Food Processing Unit' },
  { value: 'retailer', label: 'Retail / Modern Grocery Chain' },
  { value: 'institutional', label: 'Institutional / Hotel / Catering' },
  { value: 'aggregator', label: 'Inter-State Aggregator' },
  { value: 'trader', label: 'Commission Agent / Broker' },
];

/**
 * Supported APMC Market Yards with active price tracking data
 */
export const SUPPORTED_MARKETS = [
  { mandiName: 'Nashik APMC Yard', district: 'Nashik', state: 'Maharashtra' },
  { mandiName: 'Gultekdi Market Yard', district: 'Pune', state: 'Maharashtra' },
  { mandiName: 'Solapur APMC Main', district: 'Solapur', state: 'Maharashtra' },
  { mandiName: 'Aurangabad APMC', district: 'Aurangabad', state: 'Maharashtra' },
  { mandiName: 'Kolhapur Market Yard', district: 'Kolhapur', state: 'Maharashtra' },
];

export const SUPPORTED_APMC_DISTRICTS = [
  'Nashik',
  'Pune',
  'Solapur',
  'Aurangabad',
  'Kolhapur',
];
