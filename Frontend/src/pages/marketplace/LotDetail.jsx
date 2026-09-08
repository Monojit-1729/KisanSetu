import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import lotsApi from '../../api/lotsApi.js';

const QUALITY_LABELS = { A: 'Grade A — Premium', B: 'Grade B — Standard', C: 'Grade C — Basic' };
const QUALITY_COLORS = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-amber-100 text-amber-800 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
};
const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
  sold: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const LotDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let mounted = true;
    lotsApi
      .getLotById(id)
      .then((data) => { if (mounted) setLot(data.lot); })
      .catch((err) => { if (mounted) setError(err.message || 'Lot not found'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  const isOwner =
    lot &&
    user &&
    (lot.owner?.id === (user.id || user._id) ||
      lot.owner?._id === (user.id || user._id) ||
      lot.owner === (user.id || user._id));

  const handleClose = async () => {
    if (!window.confirm('Mark this lot as closed? Buyers will no longer see it.')) return;
    setClosing(true);
    try {
      await lotsApi.closeLot(id);
      navigate('/marketplace/my-lots');
    } catch (err) {
      setError(err.message || 'Failed to close lot');
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-sm">
          <div className="text-4xl mb-3">❌</div>
          <h2 className="font-bold text-slate-800 text-lg">Lot Not Found</h2>
          <p className="text-slate-500 text-sm mt-1">{error || 'This listing may have been removed.'}</p>
          <Link to="/marketplace" className="inline-flex mt-4 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">KS</div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Lot Detail</span>
            </div>
          </div>
          <Link to="/marketplace" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            ← Browse All Lots
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Status + actions bar */}
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${STATUS_COLORS[lot.status] || STATUS_COLORS.active}`}>
            {lot.status}
          </span>
          {isOwner && lot.status === 'active' && (
            <div className="flex gap-2">
              <Link
                to={`/marketplace/my-lots`}
                className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Manage Lots
              </Link>
              <button
                onClick={handleClose}
                disabled={closing}
                className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {closing ? 'Closing…' : 'Close Lot'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">{lot.cropName}</h1>
                  {lot.variety && <p className="text-slate-500 text-sm mt-0.5">{lot.variety}</p>}
                </div>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${QUALITY_COLORS[lot.quality] || QUALITY_COLORS.B}`}>
                  {QUALITY_LABELS[lot.quality] || lot.quality}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">Quantity</span>
                  <span className="font-bold text-slate-800">{lot.quantity} {lot.unit}</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 block mb-0.5">Ask Price</span>
                  <span className="font-bold text-emerald-700">₹{lot.pricePerQuintal?.toLocaleString('en-IN')}/q</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">Harvest Date</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {lot.harvestDate ? new Date(lot.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">Available From</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {lot.availableFrom ? new Date(lot.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Now'}
                  </span>
                </div>
              </div>

              {lot.description && (
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{lot.description}</p>
                </div>
              )}
            </div>

            {/* Location card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-800 mb-3">📍 Location</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">District</span>
                  <span className="font-semibold text-slate-700">{lot.location?.district || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Taluka</span>
                  <span className="font-semibold text-slate-700">{lot.location?.taluka || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Village</span>
                  <span className="font-semibold text-slate-700">{lot.location?.village || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">State</span>
                  <span className="font-semibold text-slate-700">{lot.location?.state || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Seller info + CTA */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Seller Information</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                  {lot.owner?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{lot.owner?.name || 'Anonymous'}</p>
                  <span className="text-[10px] uppercase font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                    {lot.ownerRole}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                <strong className="text-amber-800">Note:</strong> Direct contact and offer capabilities will be available in the next phase.
              </div>
            </div>

            {/* Total value card */}
            <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-sm">
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">Estimated Lot Value</p>
              <p className="text-2xl font-bold">
                ₹{((lot.quantity || 0) * (lot.pricePerQuintal || 0)).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-emerald-200 mt-1">{lot.quantity} {lot.unit} × ₹{lot.pricePerQuintal?.toLocaleString('en-IN')}/q</p>
            </div>

            {/* Decision Support Card for Owner */}
            {isOwner && lot.status === 'active' && (
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-emerald-400 text-emerald-950 font-bold px-2 py-0.5 rounded">
                    AI Decision Support
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  Where Should You Sell This Lot?
                </h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Evaluate real buyer demands, freight tariffs, and local mandi prices to discover your best net return.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to={`/farmer/recommendations?lotId=${lot.id || lot._id}`}
                    className="block text-center text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-2 rounded-xl transition-colors shadow-xs"
                  >
                    🎯 View Top Recommendation
                  </Link>
                  <Link
                    to={`/farmer/market-intelligence?lotId=${lot.id || lot._id}`}
                    className="block text-center text-xs font-semibold text-emerald-200 hover:text-white bg-white/10 px-3 py-2 rounded-xl transition-colors"
                  >
                    📊 Compare All Markets
                  </Link>
                </div>
              </div>
            )}

            <Link
              to="/marketplace"
              className="block text-center text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2.5 transition-colors"
            >
              ← Back to Browse
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LotDetail;
