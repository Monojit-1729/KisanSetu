import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import demandApi from '../../api/demandApi.js';

import {
  INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  getSubDistrictsForDistrict,
  getSubDistrictTermForState,
  CANONICAL_CROPS,
  PRODUCE_UNITS,
  DEMAND_QUALITY_OPTIONS,
} from '../../data/masterData.js';

const FieldGroup = ({ label, children, required }) => (
  <div>
    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all';

export const PostDemand = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cropName: '',
    variety: '',
    quantity: '',
    unit: 'quintal',
    quality: 'B',
    deliveryState: 'Maharashtra',
    deliveryDistrict: 'Pune',
    taluka: '',
    village: '',
    pincode: '',
    deliveryAddress: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    targetPrice: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const availableDistricts = getDistrictsForState(form.deliveryState);
  const availableSubDistricts = getSubDistrictsForDistrict(form.deliveryState, form.deliveryDistrict);
  const subDistrictTerm = getSubDistrictTermForState(form.deliveryState);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setForm((prev) => ({
      ...prev,
      deliveryState: newState,
      deliveryDistrict: '',
      taluka: '',
    }));
    if (errors.deliveryDistrict) setErrors((prev) => ({ ...prev, deliveryDistrict: '' }));
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    const subs = getSubDistrictsForDistrict(form.deliveryState, newDistrict);
    setForm((prev) => ({
      ...prev,
      deliveryDistrict: newDistrict,
      taluka: subs.includes(prev.taluka) ? prev.taluka : '',
    }));
    if (errors.deliveryDistrict) setErrors((prev) => ({ ...prev, deliveryDistrict: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.cropName.trim()) e.cropName = 'Crop commodity is required';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Valid required quantity is required';
    if (!form.deliveryDistrict.trim()) e.deliveryDistrict = 'Delivery district is required';
    if (!form.endDate) e.endDate = 'Delivery deadline date is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        cropName: form.cropName,
        variety: form.variety,
        quantity: Number(form.quantity),
        unit: form.unit,
        quality: form.quality,
        deliveryLocation: {
          state: form.deliveryState,
          district: form.deliveryDistrict,
          taluka: form.taluka,
          village: form.village,
          pincode: form.pincode,
          deliveryAddress: form.deliveryAddress,
        },
        deliveryWindow: {
          startDate: form.startDate ? new Date(form.startDate) : new Date(),
          endDate: new Date(form.endDate),
        },
        targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined,
        description: form.description,
        status: 'active',
      };

      const res = await demandApi.createDemand(payload);
      if (res?.demand?.id) {
        navigate(`/buyer/demands/${res.demand.id}/matches`);
      } else {
        navigate('/buyer/demands');
      }
    } catch (err) {
      setServerError(err.message || 'Failed to publish procurement demand');
    } finally {
      setSubmitting(false);
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
              <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Buyer Portal</span>
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
              to="/buyer/demands"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              My Demands
            </Link>
            <Link
              to="/buyer/offers"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Offers
            </Link>
            <Link
              to="/buyer/supply"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Browse Supply
            </Link>
            <Link
              to="/buyer/demand/create"
              className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shrink-0"
            >
              + Post Demand
            </Link>
            <div className="h-4 w-px bg-slate-200 shrink-0" />
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Title */}
        <div className="mb-6">
          <Link to="/buyer/demands" className="text-xs font-semibold text-amber-700 hover:underline mb-2 inline-block">
            ← Back to My Demands
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Post Procurement Demand</h1>
          <p className="text-sm text-slate-500 mt-1">
            Specify your commodity requirements to discover matching produce supply from verified Farmers & FPOs.
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Commodity Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Commodity Requirements</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Crop Commodity" required>
                <input
                  type="text"
                  list="crop-options"
                  value={form.cropName}
                  onChange={(e) => set('cropName', e.target.value)}
                  placeholder="e.g. Onion, Tomato, Wheat"
                  className={`${inputCls} ${errors.cropName ? 'border-red-400 bg-red-50' : ''}`}
                />
                <datalist id="crop-options">
                  {CANONICAL_CROPS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.cropName && <p className="text-xs text-red-600 mt-1">{errors.cropName}</p>}
              </FieldGroup>

              <FieldGroup label="Preferred Variety">
                <input
                  type="text"
                  value={form.variety}
                  onChange={(e) => set('variety', e.target.value)}
                  placeholder="e.g. Garva, GW 496, Abhinav"
                  className={inputCls}
                />
              </FieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldGroup label="Required Quantity" required>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={form.quantity}
                  onChange={(e) => set('quantity', e.target.value)}
                  placeholder="e.g. 50"
                  className={`${inputCls} ${errors.quantity ? 'border-red-400 bg-red-50' : ''}`}
                />
                {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
              </FieldGroup>

              <FieldGroup label="Measurement Unit">
                <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputCls}>
                  {PRODUCE_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="Acceptable Grade">
                <select value={form.quality} onChange={(e) => set('quality', e.target.value)} className={inputCls}>
                  {DEMAND_QUALITY_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </FieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Target Price (₹ per unit) — Optional">
                <input
                  type="number"
                  min="0"
                  value={form.targetPrice}
                  onChange={(e) => set('targetPrice', e.target.value)}
                  placeholder="e.g. 2100"
                  className={inputCls}
                />
                <p className="text-[11px] text-slate-400 mt-1">Expected max budget per {form.unit}</p>
              </FieldGroup>
            </div>
          </div>

          {/* Delivery & Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Delivery Logistics & Window</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FieldGroup label="Delivery State / UT *">
                <select
                  required
                  value={form.deliveryState}
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

              <FieldGroup label="Delivery District *" required>
                <select
                  value={form.deliveryDistrict}
                  onChange={handleDistrictChange}
                  disabled={!form.deliveryState || availableDistricts.length === 0}
                  className={`${inputCls} ${errors.deliveryDistrict ? 'border-red-400 bg-red-50' : ''}`}
                >
                  <option value="">
                    {!form.deliveryState
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
                  {form.deliveryDistrict && !availableDistricts.includes(form.deliveryDistrict) && (
                    <option key={form.deliveryDistrict} value={form.deliveryDistrict}>
                      {form.deliveryDistrict} (Current)
                    </option>
                  )}
                </select>
                {errors.deliveryDistrict && <p className="text-xs text-red-600 mt-1">{errors.deliveryDistrict}</p>}
              </FieldGroup>

              <FieldGroup label={subDistrictTerm ? `${subDistrictTerm} / Sub-district` : 'Sub-district'}>
                <select
                  value={form.taluka}
                  onChange={(e) => set('taluka', e.target.value)}
                  disabled={!form.deliveryDistrict || availableSubDistricts.length === 0}
                  className={inputCls}
                >
                  <option value="">
                    {!form.deliveryDistrict
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Delivery Start Date">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                  className={inputCls}
                />
              </FieldGroup>

              <FieldGroup label="Delivery Deadline (End Date)" required>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                  className={`${inputCls} ${errors.endDate ? 'border-red-400 bg-red-50' : ''}`}
                />
                {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
              </FieldGroup>
            </div>

            <FieldGroup label="Warehouse / Facility Address">
              <input
                type="text"
                value={form.deliveryAddress}
                onChange={(e) => set('deliveryAddress', e.target.value)}
                placeholder="e.g. APMC Market Yard Stall 14 / Processing Hub B"
                className={inputCls}
              />
            </FieldGroup>

            <FieldGroup label="Specifications / Procurement Notes">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Specific sizing, packaging preferences, moisture content limits, or gate delivery guidelines..."
                className={inputCls}
              />
            </FieldGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/buyer/demands"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing Demand...
                </>
              ) : (
                'Publish Demand & Find Matches →'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PostDemand;
