import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import farmerApi from '../../api/farmerApi.js';
import {
  INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  getSubDistrictsForDistrict,
  getSubDistrictTermForState,
  normalizeDistrict,
  CANONICAL_CROPS,
  SOIL_TYPES,
  IRRIGATION_SOURCES,
  SUPPORTED_LANGUAGES,
  useVillages,
} from '../../data/masterData.js';

export const FarmerProfile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [completion, setCompletion] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    state: 'Maharashtra',
    district: '',
    taluka: '',
    village: '',
    pincode: '',
    preferredLanguage: 'en',
    cropInterests: [],
    totalLandAcres: 0,
    soilType: '',
    irrigationSource: '',
    isFpoMember: false,
    fpoName: '',
  });

  useEffect(() => {
    let isMounted = true;
    farmerApi
      .getProfile()
      .then((res) => {
        if (isMounted) {
          const p = res?.data?.profile;
          if (p) {
            const rawState = p.location?.state || 'Maharashtra';
            const rawDistrict = p.location?.district || '';
            const normalizedDistrict = normalizeDistrict(rawState, rawDistrict);

            setFormData({
              fullName: p.fullName || user?.name || '',
              phone: p.phone || user?.phone || '',
              state: rawState,
              district: normalizedDistrict,
              taluka: p.location?.taluka || '',
              village: p.location?.village || '',
              pincode: p.location?.pincode || '',
              preferredLanguage: p.preferredLanguage || 'en',
              cropInterests: p.cropInterests || [],
              totalLandAcres: p.farmInfo?.totalLandAcres || 0,
              soilType: p.farmInfo?.soilType || '',
              irrigationSource: p.farmInfo?.irrigationSource || '',
              isFpoMember: Boolean(p.fpoAffiliation?.isMember),
              fpoName: p.fpoAffiliation?.fpoName || '',
            });
            setCompletion(p.completionPercentage || 0);
          } else {
            setFormData((prev) => ({
              ...prev,
              fullName: user?.name || '',
              phone: user?.phone || '',
            }));
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch farmer profile');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCropToggle = (crop) => {
    setFormData((prev) => {
      const exists = prev.cropInterests.includes(crop);
      return {
        ...prev,
        cropInterests: exists
          ? prev.cropInterests.filter((c) => c !== crop)
          : [...prev.cropInterests, crop],
      };
    });
  };

  const availableDistricts = getDistrictsForState(formData.state);
  const availableSubDistricts = getSubDistrictsForDistrict(formData.state, formData.district);
  const subDistrictTerm = getSubDistrictTermForState(formData.state);
  const { villages: availableVillages, loading: villagesLoading } = useVillages(
    formData.state,
    formData.district,
    formData.taluka
  );

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: '',
      taluka: '',
      village: '',
      pincode: '',
    }));
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      taluka: '',
      village: '',
      pincode: '',
    }));
  };

  const handleSubDistrictChange = (e) => {
    const newSubDistrict = e.target.value;
    setFormData((prev) => ({
      ...prev,
      taluka: newSubDistrict,
      village: '',
      pincode: '',
    }));
  };

  const handleVillageChange = (e) => {
    const selectedVillageName = e.target.value;
    const villageObj = availableVillages.find(
      (v) => v.name.toLowerCase() === selectedVillageName.toLowerCase() || v.code === selectedVillageName
    );
    const resolvedPin = villageObj?.pincode || (Array.isArray(villageObj?.pincodes) ? villageObj.pincodes[0] : '') || '';
    setFormData((prev) => ({
      ...prev,
      village: selectedVillageName,
      pincode: resolvedPin,
    }));
  };

  const currentVillageObj = availableVillages.find(
    (v) => v.name.toLowerCase() === (formData.village || '').toLowerCase()
  );
  const currentVillagePins = currentVillageObj?.pincodes || (formData.pincode ? [formData.pincode] : []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      location: {
        state: formData.state.trim(),
        district: formData.district.trim(),
        taluka: formData.taluka.trim(),
        village: formData.village.trim(),
        pincode: formData.pincode.trim(),
      },
      preferredLanguage: formData.preferredLanguage,
      cropInterests: formData.cropInterests,
      farmInfo: {
        totalLandAcres: Number(formData.totalLandAcres) || 0,
        soilType: formData.soilType.trim(),
        irrigationSource: formData.irrigationSource.trim(),
      },
      fpoAffiliation: {
        isMember: formData.isFpoMember,
        fpoName: formData.fpoName.trim(),
      },
    };

    try {
      const res = await farmerApi.updateProfile(payload);
      setSuccessMessage('Farmer profile updated and saved successfully!');
      if (res?.data?.completionPercentage !== undefined) {
        setCompletion(res.data.completionPercentage);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update farmer profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              KS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Farmer Profile</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-1 shrink-0">
            <Link
              to="/farmer/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <Link
              to="/farmer/profile"
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0"
            >
              My Profile
            </Link>
            <div className="h-4 w-px bg-slate-200 shrink-0"></div>
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Title & Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farmer Profile Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure your agricultural profile to connect with regional markets and matching buyers.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Profile Score</span>
              <span className="text-xl font-extrabold text-emerald-700">{completion}%</span>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Registered Account</span>
              <span className="font-bold text-slate-800">{user?.name} ({user?.email})</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Security Role</span>
              <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Farmer
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Account Verification</span>
              <span className="text-slate-700 font-medium">
                {user?.isVerified ? '✓ Verified Account' : 'Standard Tier'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <span>!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading profile form...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Section 1: Contact & Location */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>📍</span> 1. Farmer Identification & Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Direct Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State / Union Territory *</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.state}
                      onChange={handleStateChange}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="">-- Select State / UT --</option>
                      {INDIAN_STATES_AND_UTS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">District *</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.district}
                      onChange={handleDistrictChange}
                      disabled={!formData.state || availableDistricts.length === 0}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.state
                          ? '-- Select State First --'
                          : availableDistricts.length === 0
                          ? '-- No districts available --'
                          : '-- Select District --'}
                      </option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      {formData.district && !availableDistricts.includes(formData.district) && (
                        <option key={formData.district} value={formData.district}>
                          {formData.district}
                        </option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {subDistrictTerm ? `${subDistrictTerm} / Sub-district` : 'Taluka / Tehsil'}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.taluka}
                      onChange={handleSubDistrictChange}
                      disabled={!formData.district || availableSubDistricts.length === 0}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.district
                          ? '-- Select District First --'
                          : availableSubDistricts.length === 0
                          ? `-- No ${subDistrictTerm.toLowerCase()}s available --`
                          : `-- Select ${subDistrictTerm} --`}
                      </option>
                      {availableSubDistricts.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      {formData.taluka && !availableSubDistricts.includes(formData.taluka) && (
                        <option key={formData.taluka} value={formData.taluka}>
                          {formData.taluka}
                        </option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Village *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.village}
                      onChange={handleVillageChange}
                      disabled={!formData.taluka || villagesLoading}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.taluka
                          ? `-- Select ${subDistrictTerm || 'Sub-district'} First --`
                          : villagesLoading
                          ? '-- Loading official villages... --'
                          : availableVillages.length === 0
                          ? '-- No official villages found --'
                          : '-- Select Village --'}
                      </option>
                      {availableVillages.map((v) => (
                        <option key={v.code || v.name} value={v.name}>
                          {v.name} {v.pincode ? `(${v.pincode})` : ''}
                        </option>
                      ))}
                      {formData.village &&
                        !availableVillages.some(
                          (v) => v.name.toLowerCase() === formData.village.toLowerCase()
                        ) && (
                          <option key={formData.village} value={formData.village}>
                            {formData.village} (Current / Legacy)
                          </option>
                        )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {availableVillages.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1 px-1">
                      {availableVillages.length} official LGD villages available
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Postal PIN Code (Auto-Resolved)
                  </label>
                  {currentVillagePins.length > 1 ? (
                    <div className="relative">
                      <select
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        disabled={!formData.village}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {currentVillagePins.map((p) => (
                          <option key={p} value={p}>
                            {p} {p === '422206' ? '(Primary / Local Area)' : p === '422207' ? '(Janori B.O)' : '(Official Postal Code)'}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      disabled={!formData.village}
                      value={formData.pincode}
                      placeholder={!formData.village ? 'Auto-populated on village selection' : 'Resolving PIN...'}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-mono text-slate-700 cursor-not-allowed focus:outline-none"
                    />
                  )}
                  <div className="flex items-center justify-between text-[11px] mt-1 px-1">
                    {formData.pincode ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <span>✓</span> Auto-resolved from LGD / Postal Directory
                      </span>
                    ) : (
                      <span className="text-slate-400">Pincode resolves automatically</span>
                    )}
                    {currentVillagePins.length > 1 && (
                      <span className="text-amber-700 font-medium">Multiple official PINs available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Crop Interests */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>🌾</span> 2. Crop Cultivation Focus
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Click to select crops you actively harvest or plan to sell through KisanSetu:
              </p>
              <div className="flex flex-wrap gap-2">
                {CANONICAL_CROPS.map((crop) => {
                  const isSelected = formData.cropInterests.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropToggle(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      {isSelected ? `✓ ${crop}` : `+ ${crop}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Farm Land & Language */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>🚜</span> 3. Agricultural Landholding & Language
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Total Land (Acres)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.totalLandAcres}
                    onChange={(e) => setFormData({ ...formData, totalLandAcres: e.target.value })}
                    placeholder="e.g. 4.5"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Soil Type</label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="">Select soil type</option>
                    {SOIL_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                    {formData.soilType && !SOIL_TYPES.some((s) => s.value === formData.soilType) && (
                      <option key={formData.soilType} value={formData.soilType}>
                        {formData.soilType} (Current)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Irrigation Source</label>
                  <select
                    value={formData.irrigationSource}
                    onChange={(e) => setFormData({ ...formData, irrigationSource: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="">Select irrigation source</option>
                    {IRRIGATION_SOURCES.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                    {formData.irrigationSource && !IRRIGATION_SOURCES.some((i) => i.value === formData.irrigationSource) && (
                      <option key={formData.irrigationSource} value={formData.irrigationSource}>
                        {formData.irrigationSource} (Current)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Language</label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: FPO Membership */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>🏢</span> 4. FPO Affiliation
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isFpoMember}
                    onChange={(e) => setFormData({ ...formData, isFpoMember: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>I am an active member of a registered Farmer Producer Organization (FPO/FPC)</span>
                </label>

                {formData.isFpoMember && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Affiliated FPO Name</label>
                    <input
                      type="text"
                      value={formData.fpoName}
                      onChange={(e) => setFormData({ ...formData, fpoName: e.target.value })}
                      placeholder="e.g. Sahyadri Farmer Producer Company"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/farmer/dashboard"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Back to Workspace
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save Farmer Profile</span>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default FarmerProfile;
