import { Router } from 'express';

const router = Router();

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

export const PRODUCE_UNITS = [
  { value: 'quintal', label: 'Quintal (100 kg)', short: 'q' },
  { value: 'tonne', label: 'Tonne (1,000 kg)', short: 't' },
  { value: 'kg', label: 'Kilogram (kg)', short: 'kg' },
];

export const QUALITY_GRADES = [
  { value: 'A', label: 'Grade A (Premium)' },
  { value: 'B', label: 'Grade B (Standard)' },
  { value: 'C', label: 'Grade C (Basic)' },
];

export const SOIL_TYPES = [
  { value: 'Black Cotton', label: 'Black Cotton Loam' },
  { value: 'Alluvial', label: 'Alluvial / Fertile Silt' },
  { value: 'Red / Laterite', label: 'Red Soil / Laterite' },
  { value: 'Sandy Loam', label: 'Sandy Loam' },
  { value: 'Clay Loam', label: 'Clay Loam' },
];

export const IRRIGATION_SOURCES = [
  { value: 'Drip & Borewell', label: 'Drip & Borewell' },
  { value: 'Canal / Surface Flow', label: 'Canal / Surface Flow' },
  { value: 'Sprinkler Irrigation', label: 'Sprinkler Irrigation' },
  { value: 'Open Well / Pump', label: 'Open Well / Pump' },
  { value: 'River / Lift Irrigation', label: 'River / Lift Irrigation' },
  { value: 'Rainfed / Dryland', label: 'Rainfed / Dryland' },
];

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

export const BUYER_CATEGORIES = [
  { value: 'wholesaler', label: 'Wholesaler / APMC Trader' },
  { value: 'processor', label: 'Food Processing Unit' },
  { value: 'retailer', label: 'Retail / Modern Grocery Chain' },
  { value: 'institutional', label: 'Institutional / Hotel / Catering' },
  { value: 'aggregator', label: 'Inter-State Aggregator' },
  { value: 'trader', label: 'Commission Agent / Broker' },
];

export const SUPPORTED_MARKETS = [
  { mandiName: 'Nashik APMC Yard', district: 'Nashik', state: 'Maharashtra' },
  { mandiName: 'Gultekdi Market Yard', district: 'Pune', state: 'Maharashtra' },
  { mandiName: 'Solapur APMC Main', district: 'Solapur', state: 'Maharashtra' },
  { mandiName: 'Aurangabad APMC', district: 'Aurangabad', state: 'Maharashtra' },
  { mandiName: 'Kolhapur Market Yard', district: 'Kolhapur', state: 'Maharashtra' },
];

// GET /api/meta/master-data
router.get('/master-data', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      crops: CANONICAL_CROPS,
      units: PRODUCE_UNITS,
      grades: QUALITY_GRADES,
      soilTypes: SOIL_TYPES,
      irrigationSources: IRRIGATION_SOURCES,
      languages: SUPPORTED_LANGUAGES,
      buyerCategories: BUYER_CATEGORIES,
      supportedMarkets: SUPPORTED_MARKETS,
    },
  });
});

export default router;
