import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import matchingApi from '../../api/matchingApi.js';

const QUALITY_COLORS = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-amber-100 text-amber-800 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
};

const getScoreColor = (score) => {
  if (score >= 85) return 'bg-emerald-500 text-white';
  if (score >= 70) return 'bg-blue-500 text-white';
  if (score >= 50) return 'bg-amber-500 text-white';
  return 'bg-slate-500 text-white';
};

export const MatchedSupply = () => {
  const { demandId } = useParams();
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    matchingApi
      .getMatchesForDemand(demandId)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load matching supply');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [demandId]);

  const demand = data?.demand;
  const matches = data?.matches || [];

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
          <nav className="flex items-center space-x-3">
            <Link
              to="/buyer/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/buyer/demands"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              My Demands
            </Link>
            <Link
              to="/buyer/supply"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Browse Supply
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link to="/buyer/demands" className="text-xs font-semibold text-amber-700 hover:underline">
            ← Back to My Demands
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Finding matching produce supply from verified farmers and FPOs...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-sm mb-6">
            {error}
          </div>
        ) : !demand ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            Demand not found.
          </div>
        ) : (
          <>
            {/* Demand Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {demand.demandId || demand.id.slice(-6)}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Procurement Requirement
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {demand.cropName} {demand.variety && <span className="text-slate-400 text-lg">({demand.variety})</span>}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    🎯 {matches.length} Compatible Lot{matches.length !== 1 ? 's' : ''} Found
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Required Quantity</span>
                  <span className="font-bold text-slate-800 text-sm">{demand.quantity} {demand.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Acceptable Grade</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {demand.quality === 'Any' ? 'Any Grade (A/B/C)' : `Grade ${demand.quality}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Delivery District</span>
                  <span className="font-bold text-slate-800 text-sm">{demand.deliveryLocation?.district || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Target Budget</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {demand.targetPrice ? `₹${demand.targetPrice.toLocaleString('en-IN')}/${demand.unit}` : 'Open Budget'}
                  </span>
                </div>
              </div>
            </div>

            {/* Matching Supply List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>Matched Produce Lots</span>
                <span className="text-xs font-normal text-slate-400">Ranked by deterministic fit score</span>
              </h2>

              {matches.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto mb-3">
                    🔍
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">No matching supply found</h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                    Currently no active Farmer or FPO lots match your criteria for {demand.cropName} in {demand.deliveryLocation?.district}.
                  </p>
                  <Link
                    to="/buyer/supply"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Browse All Produce Listings →
                  </Link>
                </div>
              ) : (
                matches.map(({ lot, fitScore, criteria, reasons }) => (
                  <div
                    key={lot.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-amber-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Left details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        {/* Match Score Badge */}
                        <div
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-2xs flex items-center gap-1 ${getScoreColor(
                            fitScore
                          )}`}
                        >
                          <span>★</span>
                          <span>{fitScore}% Match</span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                          {lot.cropName}
                          {lot.variety && <span className="text-slate-400 font-normal text-sm ml-1.5">({lot.variety})</span>}
                        </h3>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            QUALITY_COLORS[lot.quality] || QUALITY_COLORS.B
                          }`}
                        >
                          Grade {lot.quality}
                        </span>

                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                          {lot.ownerRole} Listing
                        </span>
                      </div>

                      {/* Lot Specifications Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl mb-3">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Available Quantity</span>
                          <span className="font-bold text-slate-800">{lot.quantity} {lot.unit}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Asking Price</span>
                          <span className="font-bold text-emerald-700">₹{lot.pricePerQuintal?.toLocaleString('en-IN')}/q</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Origin</span>
                          <span className="font-bold text-slate-800">{lot.location?.district}, {lot.location?.state}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Producer</span>
                          <span className="font-bold text-slate-800 truncate block">{lot.owner?.name || 'Verified Producer'}</span>
                        </div>
                      </div>

                      {/* Match Reasons Checklist */}
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                        {reasons.map((r, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            <span className="text-emerald-600 font-bold">✓</span> {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <Link
                        to={`/marketplace/${lot.id}`}
                        className="inline-flex items-center justify-center gap-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors shadow-xs"
                      >
                        Inspect Lot Details →
                      </Link>
                      <span className="text-[10px] text-center text-slate-400">
                        {lot.location?.taluka ? `Taluka: ${lot.location.taluka}` : 'Direct Farm Gate'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MatchedSupply;
