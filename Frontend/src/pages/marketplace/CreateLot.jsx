import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import lotsApi from '../../api/lotsApi.js';

import {
  INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  getSubDistrictsForDistrict,
  getSubDistrictTermForState,
  CANONICAL_CROPS,
  PRODUCE_UNITS,
} from '../../data/masterData.js';

const FieldGroup = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";

export const CreateLot = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cropName: '',
    variety: '',
    quantity: '',
    unit: 'quintal',
    pricePerQuintal: '',
    quality: 'B',
    harvestDate: '',
    availableFrom: new Date().toISOString().slice(0, 10),
    state: 'Maharashtra',
    district: '',
    taluka: '',
    village: '',
    pincode: '',
    description: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const availableDistricts = getDistrictsForState(form.state);
  const availableSubDistricts = getSubDistrictsForDistrict(form.state, form.district);
  const subDistrictTerm = getSubDistrictTermForState(form.state);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setForm((prev) => ({
      ...prev,
      state: newState,
      district: '',
      taluka: '',
    }));
    if (errors.district) setErrors((prev) => ({ ...prev, district: '' }));
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    const subs = getSubDistrictsForDistrict(form.state, newDistrict);
    setForm((prev) => ({
      ...prev,
      district: newDistrict,
      taluka: subs.includes(prev.taluka) ? prev.taluka : '',
    }));
    if (errors.district) setErrors((prev) => ({ ...prev, district: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.cropName.trim()) e.cropName = 'Crop name is required';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Enter a valid quantity';
    if (!form.pricePerQuintal || Number(form.pricePerQuintal) <= 0) e.pricePerQuintal = 'Enter a valid price';
    if (!form.district.trim()) e.district = 'District is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');

    try {
      await lotsApi.createLot({
        cropName: form.cropName,
        variety: form.variety,
        quantity: Number(form.quantity),
        unit: form.unit,
        pricePerQuintal: Number(form.pricePerQuintal),
        quality: form.quality,
        harvestDate: form.harvestDate || undefined,
        availableFrom: form.availableFrom || undefined,
        location: {
          state: form.state,
          district: form.district,
          taluka: form.taluka,
          village: form.village,
          pincode: form.pincode,
        },
        description: form.description,
        status: form.status,
      });
      navigate('/marketplace/my-lots');
    } catch (err) {
      setServerError(err.message || 'Failed to create lot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">KS</div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">List Produce</span>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 shrink-0">
            <Link to={`/${user?.role}/dashboard`} className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              Dashboard
            </Link>
            <Link to="/marketplace/my-lots" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              My Lots
            </Link>
            <button onClick={logout} className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0">
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link to="/marketplace" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">← Back to Marketplace</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">List New Produce Lot</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to make your produce visible to buyers on the marketplace.</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">Crop Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Crop Name *">
                <select
                  value={form.cropName}
                  onChange={(e) => set('cropName', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select crop…</option>
                  {CANONICAL_CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__other">Other (type below)</option>
                </select>
                {form.cropName === '__other' && (
                  <input
                    type="text"
                    placeholder="Enter crop name"
                    onChange={(e) => set('cropName', e.target.value)}
                    className={`${inputCls} mt-2`}
                  />
                )}
                {errors.cropName && <p className="text-red-600 text-xs mt-1">{errors.cropName}</p>}
              </FieldGroup>

              <FieldGroup label="Variety / Type">
                <input
                  type="text"
                  placeholder="e.g. Red Nasik, Thompson Seedless"
                  value={form.variety}
                  onChange={(e) => set('variety', e.target.value)}
                  className={inputCls}
                />
              </FieldGroup>

              <FieldGroup label="Quality Grade *">
                <div className="flex gap-2">
                  {['A', 'B', 'C'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set('quality', g)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                        form.quality === g
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      Grade {g}
                    </button>
                  ))}
                </div>
              </FieldGroup>
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">Quantity & Pricing</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <FieldGroup label="Quantity *">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="0.0"
                      value={form.quantity}
                      onChange={(e) => set('quantity', e.target.value)}
                      className={`${inputCls} flex-1`}
                    />
                    <select
                      value={form.unit}
                      onChange={(e) => set('unit', e.target.value)}
                      className={`${inputCls} w-36`}
                    >
                      {PRODUCE_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.quantity && <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>}
                </FieldGroup>
              </div>

              <FieldGroup label="Ask Price (₹/Quintal) *">
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2400"
                  value={form.pricePerQuintal}
                  onChange={(e) => set('pricePerQuintal', e.target.value)}
                  className={inputCls}
                />
                {errors.pricePerQuintal && <p className="text-red-600 text-xs mt-1">{errors.pricePerQuintal}</p>}
              </FieldGroup>

              <FieldGroup label="Harvest Date">
                <input
                  type="date"
                  value={form.harvestDate}
                  onChange={(e) => set('harvestDate', e.target.value)}
                  className={inputCls}
                />
              </FieldGroup>

              <FieldGroup label="Available From">
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => set('availableFrom', e.target.value)}
                  className={inputCls}
                />
              </FieldGroup>
            </div>

            {/* Total value preview */}
            {form.quantity && form.pricePerQuintal && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Estimated Lot Value</span>
                <span className="font-bold text-emerald-800">
                  ₹{(Number(form.quantity) * Number(form.pricePerQuintal)).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">Pickup Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldGroup label="State / UT *">
                <select
                  required
                  value={form.state}
                  onChange={handleStateChange}
                  className={inputCls}
                >
                  <option value="">-- Select State / UT --</option>
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="District *">
                <select
                  required
                  value={form.district}
                  onChange={handleDistrictChange}
                  disabled={!form.state || availableDistricts.length === 0}
                  className={`${inputCls} ${errors.district ? 'border-red-400 bg-red-50' : ''}`}
                >
                  <option value="">
                    {!form.state
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
                  {form.district && !availableDistricts.includes(form.district) && (
                    <option key={form.district} value={form.district}>
                      {form.district} (Current)
                    </option>
                  )}
                </select>
                {errors.district && <p className="text-red-600 text-xs mt-1">{errors.district}</p>}
              </FieldGroup>

              <FieldGroup label={subDistrictTerm ? `${subDistrictTerm} / Sub-district` : 'Sub-district'}>
                <select
                  value={form.taluka}
                  onChange={(e) => set('taluka', e.target.value)}
                  disabled={!form.district || availableSubDistricts.length === 0}
                  className={inputCls}
                >
                  <option value="">
                    {!form.district
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
                  {form.taluka && !availableSubDistricts.includes(form.taluka) && (
                    <option key={form.taluka} value={form.taluka}>
                      {form.taluka} (Current)
                    </option>
                  )}
                </select>
              </FieldGroup>

              <FieldGroup label="Village">
                <input type="text" placeholder="e.g. Janori" value={form.village} onChange={(e) => set('village', e.target.value)} className={inputCls} />
              </FieldGroup>

              <FieldGroup label="Pincode">
                <input type="text" placeholder="e.g. 422206" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} className={inputCls} />
              </FieldGroup>
            </div>
          </div>

          {/* Description & Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100">Additional Details</h2>
            <FieldGroup label="Description">
              <textarea
                rows={3}
                placeholder="Describe quality, post-harvest handling, packaging, grading notes…"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className={`${inputCls} resize-none`}
                maxLength={1000}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{form.description.length}/1000</p>
            </FieldGroup>

            <FieldGroup label="Publish Status">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={form.status === 'active'}
                    onChange={() => set('status', 'active')}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Publish immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={form.status === 'draft'}
                    onChange={() => set('status', 'draft')}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Save as draft</span>
                </label>
              </div>
            </FieldGroup>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Link
              to="/marketplace/my-lots"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl transition-colors shadow-xs"
            >
              {submitting ? 'Creating…' : form.status === 'active' ? 'Publish Lot' : 'Save Draft'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateLot;
