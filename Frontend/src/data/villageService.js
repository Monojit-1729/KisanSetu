import { useState, useEffect } from 'react';
import maharashtraVillages from './villages/maharashtra.json' with { type: 'json' };

// State slug manifest for dynamic chunk loading
const STATE_SLUGS = {
  'Maharashtra': 'maharashtra',
  'Andhra Pradesh': 'andhra_pradesh',
  'Arunachal Pradesh': 'arunachal_pradesh',
  'Assam': 'assam',
  'Bihar': 'bihar',
  'Chandigarh': 'chandigarh',
  'Chhattisgarh': 'chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu': 'dadra_and_nagar_haveli_and_daman_and_diu',
  'Delhi (NCT)': 'delhi',
  'Goa': 'goa',
  'Gujarat': 'gujarat',
  'Haryana': 'haryana',
  'Himachal Pradesh': 'himachal_pradesh',
  'Jammu and Kashmir': 'jammu_and_kashmir',
  'Jharkhand': 'jharkhand',
  'Karnataka': 'karnataka',
  'Kerala': 'kerala',
  'Ladakh': 'ladakh',
  'Lakshadweep': 'lakshadweep',
  'Madhya Pradesh': 'madhya_pradesh',
  'Manipur': 'manipur',
  'Meghalaya': 'meghalaya',
  'Mizoram': 'mizoram',
  'Nagaland': 'nagaland',
  'Odisha': 'odisha',
  'Puducherry': 'puducherry',
  'Punjab': 'punjab',
  'Rajasthan': 'rajasthan',
  'Sikkim': 'sikkim',
  'Tamil Nadu': 'tamil_nadu',
  'Telangana': 'telangana',
  'Tripura': 'tripura',
  'Uttar Pradesh': 'uttar_pradesh',
  'Uttarakhand': 'uttarakhand',
  'West Bengal': 'west_bengal',
  'Andaman and Nicobar Islands': 'andaman_and_nicobar_islands',
};

// In-memory cache pre-seeded with Maharashtra for instant zero-latency demo rendering
const stateCache = new Map();
stateCache.set('Maharashtra', maharashtraVillages);

// Dynamic loaders for all non-preloaded states (Vite will code-split these)
const STATE_LOADERS = {
  'andhra_pradesh': () => import('./villages/andhra_pradesh.json', { with: { type: 'json' } }),
  'arunachal_pradesh': () => import('./villages/arunachal_pradesh.json', { with: { type: 'json' } }),
  'assam': () => import('./villages/assam.json', { with: { type: 'json' } }),
  'bihar': () => import('./villages/bihar.json', { with: { type: 'json' } }),
  'chandigarh': () => import('./villages/chandigarh.json', { with: { type: 'json' } }),
  'chhattisgarh': () => import('./villages/chhattisgarh.json', { with: { type: 'json' } }),
  'dadra_and_nagar_haveli_and_daman_and_diu': () => import('./villages/dadra_and_nagar_haveli_and_daman_and_diu.json', { with: { type: 'json' } }),
  'delhi': () => import('./villages/delhi.json', { with: { type: 'json' } }),
  'goa': () => import('./villages/goa.json', { with: { type: 'json' } }),
  'gujarat': () => import('./villages/gujarat.json', { with: { type: 'json' } }),
  'haryana': () => import('./villages/haryana.json', { with: { type: 'json' } }),
  'himachal_pradesh': () => import('./villages/himachal_pradesh.json', { with: { type: 'json' } }),
  'jammu_and_kashmir': () => import('./villages/jammu_and_kashmir.json', { with: { type: 'json' } }),
  'jharkhand': () => import('./villages/jharkhand.json', { with: { type: 'json' } }),
  'karnataka': () => import('./villages/karnataka.json', { with: { type: 'json' } }),
  'kerala': () => import('./villages/kerala.json', { with: { type: 'json' } }),
  'ladakh': () => import('./villages/ladakh.json', { with: { type: 'json' } }),
  'lakshadweep': () => import('./villages/lakshadweep.json', { with: { type: 'json' } }),
  'madhya_pradesh': () => import('./villages/madhya_pradesh.json', { with: { type: 'json' } }),
  'manipur': () => import('./villages/manipur.json', { with: { type: 'json' } }),
  'meghalaya': () => import('./villages/meghalaya.json', { with: { type: 'json' } }),
  'mizoram': () => import('./villages/mizoram.json', { with: { type: 'json' } }),
  'nagaland': () => import('./villages/nagaland.json', { with: { type: 'json' } }),
  'odisha': () => import('./villages/odisha.json', { with: { type: 'json' } }),
  'puducherry': () => import('./villages/puducherry.json', { with: { type: 'json' } }),
  'punjab': () => import('./villages/punjab.json', { with: { type: 'json' } }),
  'rajasthan': () => import('./villages/rajasthan.json', { with: { type: 'json' } }),
  'sikkim': () => import('./villages/sikkim.json', { with: { type: 'json' } }),
  'tamil_nadu': () => import('./villages/tamil_nadu.json', { with: { type: 'json' } }),
  'telangana': () => import('./villages/telangana.json', { with: { type: 'json' } }),
  'tripura': () => import('./villages/tripura.json', { with: { type: 'json' } }),
  'uttar_pradesh': () => import('./villages/uttar_pradesh.json', { with: { type: 'json' } }),
  'uttarakhand': () => import('./villages/uttarakhand.json', { with: { type: 'json' } }),
  'west_bengal': () => import('./villages/west_bengal.json', { with: { type: 'json' } }),
  'andaman_and_nicobar_islands': () => import('./villages/andaman_and_nicobar_islands.json', { with: { type: 'json' } }),
};

/**
 * Loads the state dataset into cache (async).
 */
export async function loadStateVillages(stateName) {
  if (!stateName) return null;
  if (stateCache.has(stateName)) {
    return stateCache.get(stateName);
  }

  const slug = STATE_SLUGS[stateName] || stateName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const loader = STATE_LOADERS[slug];
  if (!loader) return null;

  try {
    const mod = await loader();
    const data = mod.default || mod;
    stateCache.set(stateName, data);
    return data;
  } catch (err) {
    console.error(`Failed to load villages for ${stateName}:`, err);
    return null;
  }
}

function normalizeName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b(tehsil|taluk|taluka|block|sub-division|circle)\b/g, '')
    .replace(/\b(viii|vii|vi|v|iv|iii|ii|i)\b/g, (m) => {
      const rom = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8' };
      return rom[m] || m;
    })
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Helper to find district and subdistrict in state dataset.
 */
function findSubdistrictEntries(stateData, district, subDistrict) {
  if (!stateData || !district || !subDistrict) return [];

  // Match district
  const distKeys = Object.keys(stateData);
  let distMatch = distKeys.find((k) => k.toLowerCase() === district.toLowerCase());
  if (!distMatch) {
    const normDist = normalizeName(district);
    distMatch = distKeys.find((k) => normalizeName(k) === normDist);
  }
  if (!distMatch) {
    // Check common aliases
    if (/aurangabad/i.test(district)) distMatch = distKeys.find((k) => /Chhatrapati Sambhajinagar/i.test(k));
    else if (/osmanabad/i.test(district)) distMatch = distKeys.find((k) => /Dharashiv/i.test(k));
    else if (/ahmednagar|ahilyanagar/i.test(district)) distMatch = distKeys.find((k) => /Ahmednagar/i.test(k));
  }
  if (!distMatch) return [];

  const districtData = stateData[distMatch];
  if (!districtData) return [];

  // Match subdistrict
  const subKeys = Object.keys(districtData);
  let subMatch = subKeys.find((k) => k.toLowerCase() === subDistrict.toLowerCase());
  if (!subMatch) {
    const normSub = normalizeName(subDistrict);
    subMatch = subKeys.find((k) => normalizeName(k) === normSub);
  }
  if (!subMatch) {
    subMatch = subKeys.find((k) => {
      const kNorm = normalizeName(k);
      const sNorm = normalizeName(subDistrict);
      return kNorm.includes(sNorm) || sNorm.includes(kNorm);
    });
  }
  if (!subMatch) return [];

  return districtData[subMatch] || [];
}


/**
 * Formats a raw village tuple into a standardized object.
 * Raw format: [name, code, primaryPin, optionalAltPins]
 */
function formatVillage(raw) {
  if (!raw || !raw[0]) return null;
  const name = raw[0];
  const code = raw[1] || '';
  const pincode = raw[2] || '';
  const altPins = Array.isArray(raw[3]) ? raw[3] : [];
  const allPins = pincode ? [pincode, ...altPins.filter((p) => p !== pincode)] : [...altPins];

  return {
    name,
    code,
    pincode,
    pincodes: allPins,
    isAmbiguous: allPins.length > 1,
  };
}

/**
 * Synchronous lookup for preloaded states (e.g. Maharashtra).
 */
export function getVillagesForSubDistrictSync(state, district, subDistrict) {
  if (!state || !district || !subDistrict) return [];
  const stateData = stateCache.get(state);
  if (!stateData) return [];

  const entries = findSubdistrictEntries(stateData, district, subDistrict);
  return entries.map(formatVillage).filter(Boolean);
}

/**
 * Asynchronous lookup supporting any of the 36 Indian States/UTs.
 */
export async function getVillagesForSubDistrictAsync(state, district, subDistrict) {
  if (!state || !district || !subDistrict) return [];
  let stateData = stateCache.get(state);
  if (!stateData) {
    stateData = await loadStateVillages(state);
  }
  if (!stateData) return [];

  const entries = findSubdistrictEntries(stateData, district, subDistrict);
  return entries.map(formatVillage).filter(Boolean);
}

/**
 * Resolves the official PIN code for a given village.
 */
export function resolvePincodeForVillage(state, district, subDistrict, villageNameOrCode) {
  if (!state || !district || !subDistrict || !villageNameOrCode) {
    return { pincode: '', pincodes: [], isAmbiguous: false, code: '' };
  }

  const list = getVillagesForSubDistrictSync(state, district, subDistrict);
  const found = list.find(
    (v) =>
      v.code === villageNameOrCode ||
      v.name.toLowerCase() === villageNameOrCode.toLowerCase()
  );

  if (found) {
    return {
      pincode: found.pincode,
      pincodes: found.pincodes,
      isAmbiguous: found.isAmbiguous,
      code: found.code,
    };
  }

  return { pincode: '', pincodes: [], isAmbiguous: false, code: '' };
}

/**
 * React hook to reactively provide villages for the current selection.
 * Preloaded states load synchronously with zero latency; other states load on-demand.
 */
export function useVillages(state, district, subDistrict) {
  const [villages, setVillages] = useState(() =>
    getVillagesForSubDistrictSync(state, district, subDistrict)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!state || !district || !subDistrict) {
      setVillages([]);
      setLoading(false);
      return;
    }

    const syncList = getVillagesForSubDistrictSync(state, district, subDistrict);
    if (syncList && syncList.length > 0) {
      setVillages(syncList);
      setLoading(false);
      return;
    }

    setLoading(true);
    getVillagesForSubDistrictAsync(state, district, subDistrict)
      .then((list) => {
        if (active) {
          setVillages(list);
        }
      })
      .catch((err) => {
        console.error('Error fetching villages:', err);
        if (active) setVillages([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [state, district, subDistrict]);

  return { villages, loading };
}
