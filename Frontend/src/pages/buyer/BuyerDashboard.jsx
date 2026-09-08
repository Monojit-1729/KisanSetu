import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import buyerApi from '../../api/buyerApi.js';
import demandApi from '../../api/demandApi.js';

export const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demandStats, setDemandStats] = useState({ activeCount: 0, totalCount: 0 });
  const [recentDemands, setRecentDemands] = useState([]);

  useEffect(() => {
    let isMounted = true;
    buyerApi
      .getProfile()
      .then((res) => {
        if (isMounted) {
          setProfile(res?.data?.profile || null);
          setCompletion(res?.data?.completionPercentage || 0);

          // Fetch demand statistics
          demandApi.getMyStats().then((stats) => {
            if (isMounted) setDemandStats(stats);
          }).catch(() => {});

          // Fetch recent demands
          demandApi.getMyDemands({ limit: 3 }).then((demandsRes) => {
            if (isMounted) setRecentDemands(demandsRes.items || []);
          }).catch(() => {});
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load Buyer profile');
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
              className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
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
            <Link
              to="/buyer/profile"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Buyer Profile
            </Link>
            <Link
              to="/buyer/demand/create"
              className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              + Post Demand
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{user?.name}</div>
              <div className="text-[10px] text-slate-500">{user?.email}</div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Buyer
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
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Phase 1.2: Commercial Buyer Workspace Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {profile?.businessName || user?.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Commercial procurement workspace for verified direct farmer and FPO supply discovery.
              </p>
            </div>

            <Link
              to="/buyer/profile"
              className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              {profile ? 'Edit Buyer Profile' : 'Setup Profile'} →
            </Link>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">Procurement Readiness</span>
              <span className="font-bold text-amber-800">{completion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            {completion < 80 && (
              <p className="text-[11px] text-amber-800 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                <span>Complete business category and procurement crop interests to enable automated supplier matching.</span>
                <Link to="/buyer/profile" className="font-bold underline ml-2">Update Buyer Profile</Link>
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading Buyer information...
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
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Buyer Type</span>
                <div className="text-sm font-bold text-slate-800 mt-1 capitalize">
                  {profile?.buyerType || 'Wholesaler'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Procurement Category
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Verification</span>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {profile?.isVerified ? '✓ Verified Enterprise' : 'Pending Verification'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Corporate KYC tier
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Target Commodities</span>
                <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                  {profile?.interestedCrops?.length > 0 ? profile.interestedCrops.join(', ') : 'None registered'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile?.interestedCrops?.length || 0} procurement crops
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Primary Delivery Hub</span>
                <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                  {profile?.location?.district ? `${profile.location.district}, ${profile.location.state}` : 'Not Specified'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {profile?.contactInfo?.contactPerson || 'Procurement contact'}
                </div>
              </div>
            </div>

            {/* A3 Procurement & Demand Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Active Demands Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Procurement Demands</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Live
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-amber-700 mb-1">
                    {demandStats.activeCount}
                  </div>
                  <p className="text-xs text-slate-500">
                    {demandStats.activeCount === 0
                      ? 'No active buying demands. Post one to trigger supplier matching.'
                      : `Active procurement requirements out of ${demandStats.totalCount} total demands.`}
                  </p>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to="/buyer/demand/create"
                    className="flex-1 text-center text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg transition-colors shadow-xs"
                  >
                    + Post Demand
                  </Link>
                  <Link
                    to="/buyer/demands"
                    className="flex-1 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    My Demands
                  </Link>
                </div>
              </div>

              {/* Recent Demands / Matching Quick-Access */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900">Recent Procurement & Matches</h3>
                    <Link to="/buyer/demands" className="text-xs font-semibold text-amber-700 hover:underline">
                      View All →
                    </Link>
                  </div>

                  {recentDemands.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 my-2">
                      No procurement demands posted yet. Post your crop requirements to find verified producer supply.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentDemands.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs hover:bg-amber-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {d.demandId || d.id.slice(-6)}
                            </span>
                            <span className="font-bold text-slate-900">{d.cropName}</span>
                            <span className="text-slate-500">
                              ({d.quantity} {d.unit} · {d.deliveryLocation?.district || 'MH'})
                            </span>
                          </div>
                          <Link
                            to={`/buyer/demands/${d.id}/matches`}
                            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px]"
                          >
                            <span>🎯</span> Matches
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Deterministic matching updates in real-time as farmers list lots.</span>
                  <Link to="/buyer/supply" className="font-semibold text-slate-700 hover:underline">
                    Browse All Supply →
                  </Link>
                </div>
              </div>
            </div>

            {/* Marketplace & Price Intelligence Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Browse Produce Supply */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Browse Farmer & FPO Supply</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Live Lots</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Filter and inspect live produce lots direct from verified farmers and aggregated FPO supply across Maharashtra.
                  </p>
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <strong>Your target commodities:</strong> {profile?.interestedCrops?.slice(0, 4).join(', ') || 'Wheat, Onion, Tomato'}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link to="/buyer/supply" className="block text-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl transition-colors">
                    Search & Filter Supply →
                  </Link>
                </div>
              </div>

              {/* Market Price Intelligence */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">APMC Price Intelligence</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">Live APMC</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Track live mandi arrival modal prices, 30-day price trends, and min/max spreads across APMC yards to benchmark procurement bids.
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                    5 districts · 7 commodities · Updated daily
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link to="/marketplace/intelligence" className="block text-center text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-xl transition-colors">
                    Open APMC Intelligence →
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

export default BuyerDashboard;
