import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import fpoApi from '../../api/fpoApi.js';

const FPO_CROPS = [
  'Onion',
  'Soybean',
  'Tomato',
  'Wheat',
  'Cotton',
  'Grapes',
  'Pomegranate',
  'Turmeric',
  'Ginger',
  'Chilli',
  'Maize',
  'Pulses / Dal',
];

export const FpoProfile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [completion, setCompletion] = useState(0);

  const [formData, setFormData] = useState({
    fpoName: '',
    registrationNumber: '',
    state: 'Maharashtra',
    district: '',
    officeAddress: '',
    pincode: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    memberCount: 0,
    majorCrops: [],
    description: '',
  });

  useEffect(() => {
    let isMounted = true;
    fpoApi
      .getProfile()
      .then((res) => {
        if (isMounted) {
          const p = res?.data?.profile;
          if (p) {
            setFormData({
              fpoName: p.fpoName || user?.name || '',
              registrationNumber: p.registrationNumber || '',
              state: p.location?.state || 'Maharashtra',
              district: p.location?.district || '',
              officeAddress: p.location?.officeAddress || '',
              pincode: p.location?.pincode || '',
              contactPerson: p.contactInfo?.contactPerson || user?.name || '',
              contactPhone: p.contactInfo?.contactPhone || user?.phone || '',
              contactEmail: p.contactInfo?.contactEmail || user?.email || '',
              memberCount: p.memberCount || 0,
              majorCrops: p.majorCrops || [],
              description: p.description || '',
            });
            setCompletion(p.completionPercentage || 0);
          } else {
            setFormData((prev) => ({
              ...prev,
              fpoName: user?.name || '',
              contactPerson: user?.name || '',
              contactEmail: user?.email || '',
              contactPhone: user?.phone || '',
            }));
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch FPO profile');
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
      const exists = prev.majorCrops.includes(crop);
      return {
        ...prev,
        majorCrops: exists
          ? prev.majorCrops.filter((c) => c !== crop)
          : [...prev.majorCrops, crop],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      fpoName: formData.fpoName.trim(),
      registrationNumber: formData.registrationNumber.trim(),
      location: {
        state: formData.state.trim(),
        district: formData.district.trim(),
        officeAddress: formData.officeAddress.trim(),
        pincode: formData.pincode.trim(),
      },
      contactInfo: {
        contactPerson: formData.contactPerson.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
      },
      memberCount: Number(formData.memberCount) || 0,
      majorCrops: formData.majorCrops,
      description: formData.description.trim(),
    };

    try {
      const res = await fpoApi.updateProfile(payload);
      setSuccessMessage('FPO profile updated and saved successfully!');
      if (res?.data?.completionPercentage !== undefined) {
        setCompletion(res.data.completionPercentage);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update FPO profile');
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
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              KS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider">FPO Profile</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-1 shrink-0">
            <Link
              to="/fpo/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <Link
              to="/fpo/profile"
              className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shrink-0"
            >
              FPO Profile
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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FPO Profile Configuration</h1>
              <p className="text-sm text-slate-500 mt-1">
                Maintain registered collective information, aggregate capacity, and primary crop portfolios.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Onboarding Score</span>
              <span className="text-xl font-extrabold text-blue-700">{completion}%</span>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Registered User</span>
              <span className="font-bold text-slate-800">{user?.name} ({user?.email})</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Security Role</span>
              <span className="font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                FPO / Aggregator
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Registry Status</span>
              <span className="text-slate-700 font-medium">
                {user?.isVerified ? '✓ Verified Producer Company' : 'Self-declared FPO'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
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
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading FPO form...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Section 1: FPO Identification */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>🏢</span> 1. FPO Identity & Legal Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Official FPO / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fpoName}
                    onChange={(e) => setFormData({ ...formData, fpoName: e.target.value })}
                    placeholder="e.g. Sahyadri Farmer Producer Co. Ltd."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">FPO Registration No. / CIN</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g. FPO-MH-2022-9941"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Total Member Farmers</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.memberCount}
                    onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })}
                    placeholder="e.g. 1250"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Operating District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Nashik, Jalgaon, Satara"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Office / Collection Center Address</label>
                  <input
                    type="text"
                    value={formData.officeAddress}
                    onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                    placeholder="Street, Facility, Road"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Person */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>👤</span> 2. Point of Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Vilas Shinde"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="fpo@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Major Crops */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>🌾</span> 3. Major Aggregation Crops
              </h3>
              <div className="flex flex-wrap gap-2">
                {FPO_CROPS.map((crop) => {
                  const isSelected = formData.majorCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropToggle(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Organization Summary / Capabilities</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of grading, sorting, cold chain, or logistics facilities managed by your FPO..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/fpo/dashboard"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Back to Workspace
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save FPO Profile</span>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default FpoProfile;
