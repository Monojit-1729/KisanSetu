import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import fpoApi from '../../api/fpoApi.js';
import lotsApi from '../../api/lotsApi.js';
import marketsApi from '../../api/marketsApi.js';
import matchingApi from '../../api/matchingApi.js';

export const FpoDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLots, setActiveLots] = useState(null);
  const [marketPrice, setMarketPrice] = useState(null);
  const [matchedBuyersCount, setMatchedBuyersCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fpoApi
      .getProfile()
      .then((res) => {
        if (isMounted) {
          const prof = res?.data?.profile || null;
          setProfile(prof);
          setCompletion(res?.data?.completionPercentage || 0);

          lotsApi.getMyStats().then((d) => {
            if (isMounted) setActiveLots(d.activeCount ?? 0);
          }).catch(() => {});

          matchingApi.getMyLotsMatchSummary().then((summary) => {
            if (isMounted) setMatchedBuyersCount(summary.totalMatches ?? 0);
          }).catch(() => {});

          const topCrop = prof?.majorCrops?.[0];
          const district = prof?.location?.district;
          if (topCrop && district) {
            marketsApi.getCropPrice({ cropName: topCrop, district }).then((d) => {
              if (isMounted) setMarketPrice(d.price || null);
            }).catch(() => {});
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load FPO profile');
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
  }, []);

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
              <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider">FPO Portal</span>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              to="/fpo/dashboard"
              className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              Dashboard
            </Link>
            <Link
              to="/fpo/profile"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              FPO Profile
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{user?.name}</div>
              <div className="text-[10px] text-slate-500">{user?.email}</div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              FPO
            </span>
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Phase 1.2: FPO Aggregation Workspace Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {profile?.fpoName || user?.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                FPO coordination center for member aggregation, grading facilities, and bulk buyer linkages.
              </p>
            </div>

            <Link
              to="/fpo/profile"
              className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              {profile ? 'Edit FPO Profile' : 'Setup Profile'} →
            </Link>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">FPO Onboarding Score</span>
              <span className="font-bold text-blue-700">{completion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            {completion < 80 && (
              <p className="text-[11px] text-blue-700 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-200 flex items-center justify-between">
                <span>Complete FPO registration number and primary crop focus to qualify for institutional procurement matching.</span>
                <Link to="/fpo/profile" className="font-bold underline ml-2">Update FPO Profile</Link>
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading FPO information...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* Quick Profile Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Registration</span>
                <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                  {profile?.registrationNumber || 'Pending Registration'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile?.isVerified ? '✓ Verified Producer Org' : 'Self-declared'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Member Farmers</span>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {profile?.memberCount ? `${profile.memberCount.toLocaleString()} Farmers` : '0 Members'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Aggregated supplier base
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Major Produce</span>
                <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                  {profile?.majorCrops?.length > 0 ? profile.majorCrops.join(', ') : 'None registered'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile?.majorCrops?.length || 0} primary crops
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Operating Hub</span>
                <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                  {profile?.location?.district ? `${profile.location.district}, ${profile.location.state}` : 'Not Specified'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {profile?.contactInfo?.contactPerson || 'Contact person not set'}
                </div>
              </div>
            </div>

            {/* Marketplace & Buyer Matches Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Lots Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">FPO Active Lots</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Live</span>
                  </div>
                  <div className="text-4xl font-bold text-emerald-700 mb-1">
                    {activeLots === null ? <span className="text-slate-300 text-2xl">…</span> : activeLots}
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeLots === 0 ? 'Create aggregated lots to reach bulk buyers.' : 'Consolidated supply lots on marketplace.'}
                  </p>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link to="/marketplace/create" className="flex-1 text-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors">
                    + New Lot
                  </Link>
                  <Link to="/marketplace/my-lots" className="flex-1 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors">
                    Manage
                  </Link>
                </div>
              </div>

              {/* Matched Buyers Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Matched Buyers</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">Demands</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-700 mb-1">
                    {matchedBuyersCount === null ? <span className="text-slate-300 text-2xl">…</span> : matchedBuyersCount}
                  </div>
                  <p className="text-xs text-slate-500">
                    {matchedBuyersCount === 0
                      ? 'No active commercial demands matching FPO lots yet.'
                      : 'Commercial buyer requirements matching your aggregated crop lots.'}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to="/marketplace/my-lots"
                    className="block text-center text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    View Matched Demands →
                  </Link>
                </div>
              </div>

              {/* Market Price Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Market Price</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">APMC Live</span>
                  </div>
                  {marketPrice ? (
                    <>
                      <p className="text-xs text-slate-500 mb-1">{marketPrice.cropName} · {marketPrice.district}</p>
                      <div className="text-3xl font-bold text-slate-900 mb-1">₹{marketPrice.modalPrice?.toLocaleString('en-IN')}<span className="text-sm font-normal text-slate-400">/q</span></div>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span>Min ₹{marketPrice.minPrice?.toLocaleString('en-IN')}</span>
                        <span>Max ₹{marketPrice.maxPrice?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">
                      {profile?.majorCrops?.[0] ? `No price data for ${profile.majorCrops[0]} yet.` : 'Add major crops to profile to see prices.'}
                    </p>
                  )}
                </div>
                <Link to="/marketplace/intelligence" className="block text-center text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition-colors mt-4">
                  Price Intelligence →
                </Link>
              </div>

              {/* Browse Marketplace Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Marketplace</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Open</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Browse active produce listings and access the full market intelligence dashboard.
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link to="/marketplace" className="block text-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors">
                    Browse Listings →
                  </Link>
                  <Link to="/marketplace/intelligence" className="block text-center text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors">
                    Price Intelligence
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FpoDashboard;
