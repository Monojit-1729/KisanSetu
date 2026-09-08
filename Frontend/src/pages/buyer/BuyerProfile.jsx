import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import buyerApi from '../../api/buyerApi.js';

const BUYER_CROPS = [
  'Onion',
  'Tomato',
  'Potato',
  'Soybean',
  'Wheat',
  'Rice',
  'Cotton',
  'Green Chilli',
  'Grapes',
  'Pomegranate',
  'Maize',
  'Pulses / Dal',
];

export const BuyerProfile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [completion, setCompletion] = useState(0);

  const [formData, setFormData] = useState({
    businessName: '',
    buyerType: 'wholesaler',
    state: 'Maharashtra',
    district: '',
    facilityAddress: '',
    pincode: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    interestedCrops: [],
    description: '',
  });

  useEffect(() => {
    let isMounted = true;
    buyerApi
      .getProfile()
      .then((res) => {
        if (isMounted) {
          const p = res?.data?.profile;
          if (p) {
            setFormData({
              businessName: p.businessName || user?.name || '',
              buyerType: p.buyerType || 'wholesaler',
              state: p.location?.state || 'Maharashtra',
              district: p.location?.district || '',
              facilityAddress: p.location?.facilityAddress || '',
              pincode: p.location?.pincode || '',
              contactPerson: p.contactInfo?.contactPerson || user?.name || '',
              contactPhone: p.contactInfo?.contactPhone || user?.phone || '',
              contactEmail: p.contactInfo?.contactEmail || user?.email || '',
              interestedCrops: p.interestedCrops || [],
              description: p.description || '',
            });
            setCompletion(p.completionPercentage || 0);
          } else {
            setFormData((prev) => ({
              ...prev,
              businessName: user?.name || '',
              contactPerson: user?.name || '',
              contactEmail: user?.email || '',
              contactPhone: user?.phone || '',
            }));
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch Buyer profile');
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
      const exists = prev.interestedCrops.includes(crop);
      return {
        ...prev,
        interestedCrops: exists
          ? prev.interestedCrops.filter((c) => c !== crop)
          : [...prev.interestedCrops, crop],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      businessName: formData.businessName.trim(),
      buyerType: formData.buyerType,
      location: {
        state: formData.state.trim(),
        district: formData.district.trim(),
        facilityAddress: formData.facilityAddress.trim(),
        pincode: formData.pincode.trim(),
      },
      contactInfo: {
        contactPerson: formData.contactPerson.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
      },
      interestedCrops: formData.interestedCrops,
      description: formData.description.trim(),
    };

    try {
      const res = await buyerApi.updateProfile(payload);
      setSuccessMessage('Buyer profile updated and saved successfully!');
      if (res?.data?.completionPercentage !== undefined) {
        setCompletion(res.data.completionPercentage);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update Buyer profile');
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
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              KS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Buyer Profile</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-1 shrink-0">
            <Link
              to="/buyer/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <Link
              to="/buyer/profile"
              className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shrink-0"
            >
              Buyer Profile
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
        {/* Title Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buyer Procurement Profile</h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure commercial buyer details, procurement categories, and target crop requirements.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Readiness Score</span>
              <span className="text-xl font-extrabold text-amber-800">{completion}%</span>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Registered Entity</span>
              <span className="font-bold text-slate-800">{user?.name} ({user?.email})</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Security Role</span>
              <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                Buyer / Commercial
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">KYC Tier</span>
              <span className="text-slate-700 font-medium">
                {user?.isVerified ? '✓ Verified Enterprise' : 'Commercial Buyer Tier'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
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
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading Buyer form...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Section 1: Business Identity */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>🏢</span> 1. Commercial Entity Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Business / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. FreshDirect Retail Procurement Ltd."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Procurement Category</label>
                  <select
                    value={formData.buyerType}
                    onChange={(e) => setFormData({ ...formData, buyerType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  >
                    <option value="wholesaler">Wholesaler / APMC Trader</option>
                    <option value="processor">Food Processing Unit</option>
                    <option value="retailer">Retail / Modern Grocery Chain</option>
                    <option value="institutional">Institutional / Hotel / Catering</option>
                    <option value="aggregator">Inter-State Aggregator</option>
                    <option value="trader">Commission Agent / Broker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Delivery State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Primary District / Hub *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Pune, Mumbai, Nagpur"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Facility / Receiving Warehouse Address</label>
                  <input
                    type="text"
                    value={formData.facilityAddress}
                    onChange={(e) => setFormData({ ...formData, facilityAddress: e.target.value })}
                    placeholder="Warehouse / Hub location details"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Person */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>👤</span> 2. Procurement Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Officer Name</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Anand Verma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Official Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Procurement Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="buyer@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Target Procurement Crops */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>📦</span> 3. Target Procurement Commodities
              </h3>
              <div className="flex flex-wrap gap-2">
                {BUYER_CROPS.map((crop) => {
                  const isSelected = formData.interestedCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropToggle(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? `✓ ${crop}` : `+ ${crop}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Description */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Procurement Specs / Warehouse Logistics</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details on typical purchase lot sizes (e.g. 10MT+), grading tolerance, or payment terms..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/buyer/dashboard"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Back to Workspace
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save Buyer Profile</span>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default BuyerProfile;
