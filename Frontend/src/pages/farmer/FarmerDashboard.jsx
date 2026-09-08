import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import farmerApi from '../../api/farmerApi.js';
import lotsApi from '../../api/lotsApi.js';
import marketsApi from '../../api/marketsApi.js';
import matchingApi from '../../api/matchingApi.js';
import recommendationApi from '../../api/recommendationApi.js';

export const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLots, setActiveLots] = useState(null);
  const [lotsList, setLotsList] = useState([]);
  const [bestRecommendation, setBestRecommendation] = useState(null);
  const [marketPrice, setMarketPrice] = useState(null);
  const [matchedBuyersCount, setMatchedBuyersCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    farmerApi
      .getProfile()
      .then((res) => {
        if (isMounted) {
          const prof = res?.data?.profile || null;
          setProfile(prof);
          setCompletion(res?.data?.completionPercentage || 0);

          // Fetch marketplace data & active lots after profile is loaded
          lotsApi.getMyStats().then((d) => {
            if (isMounted) setActiveLots(d.activeCount ?? 0);
          }).catch(() => {});

          lotsApi.getMyLots().then((data) => {
            if (!isMounted) return;
            const active = (data.lots || []).filter((l) => l.status === 'active');
            setLotsList(active);

            // Fetch top recommendation for the primary active lot
            if (active.length > 0) {
              const topLot = active[0];
              recommendationApi.getForLot(topLot.id || topLot._id).then((rec) => {
                if (isMounted && rec?.recommendedTopOption) {
                  setBestRecommendation({
                    lot: topLot,
                    ...rec.recommendedTopOption,
                    explanation: rec.explanation,
                  });
                }
              }).catch(() => {});
            }
          }).catch(() => {});

          // Fetch buyer demand matches for farmer lots
          matchingApi.getMyLotsMatchSummary().then((summary) => {
            if (isMounted) setMatchedBuyersCount(summary.totalMatches ?? 0);
          }).catch(() => {});

          const topCrop = prof?.cropInterests?.[0];
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
          setError(err.message || 'Failed to load profile');
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
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              KS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Farmer Portal</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/farmer/dashboard"
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
            >
              Dashboard
            </Link>
            <Link
              to="/farmer/offers"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Offers
            </Link>
            <Link
              to="/farmer/orders"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Orders
            </Link>
            <Link
              to="/farmer/profile"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              My Profile
            </Link>
            <Link
              to="/sms"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              📱 2G SMS
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{user?.name}</div>
              <div className="text-[10px] text-slate-500">{user?.email}</div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Farmer
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
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                A7 Operations Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Namaste, {profile?.fullName || user?.name}!
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Your farmer hub for crop management, transparent mandi intelligence, and direct buyer connections.
              </p>
            </div>

            <Link
              to="/farmer/profile"
              className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              {profile ? 'Edit Profile' : 'Setup Profile'} →
            </Link>
          </div>

          {/* Profile Completion Progress Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">Profile Completion</span>
              <span className="font-bold text-emerald-700">{completion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            {completion < 80 && (
              <p className="text-[11px] text-amber-700 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                <span>Complete your location and crop interests to unlock customized net-realisation ranking in Phase 2.</span>
                <Link to="/farmer/profile" className="font-bold underline ml-2">Update Now</Link>
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading profile information...
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
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Location</span>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {profile?.location?.district ? `${profile.location.district}, ${profile.location.state}` : 'Not Specified'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile?.location?.taluka ? `Taluka: ${profile.location.taluka}` : 'Taluka pending'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Cultivated Land</span>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {profile?.farmInfo?.totalLandAcres ? `${profile.farmInfo.totalLandAcres} Acres` : '0 Acres'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile?.farmInfo?.soilType || 'Soil type not added'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Primary Crops</span>
                <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                  {profile?.cropInterests?.length > 0 ? profile.cropInterests.join(', ') : 'None selected'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile?.cropInterests?.length || 0} registered crops
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">FPO Membership</span>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {profile?.fpoAffiliation?.isMember ? 'Affiliated' : 'Individual'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {profile?.fpoAffiliation?.fpoName || 'Not linked to an FPO'}
                </div>
              </div>
            </div>

            {/* Best Sales Opportunity Preview Banner */}
            {bestRecommendation && (
              <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm mb-8 border border-emerald-700/60">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-emerald-400 text-emerald-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                        ⭐ Best Sales Recommendation
                      </span>
                      <span className="bg-white/10 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full">
                        Lot: {bestRecommendation.lot?.cropName} ({bestRecommendation.lot?.quantity} {bestRecommendation.lot?.unit})
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mt-1">
                      {bestRecommendation.partnerName}
                    </h2>

                    <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl line-clamp-2">
                      {bestRecommendation.explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 bg-white/10 backdrop-blur-xs border border-white/10 px-5 py-3.5 rounded-xl">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">Est. Net Return</span>
                      <div className="text-2xl font-black text-white">
                        ₹{bestRecommendation.netPerQuintal?.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-emerald-200">/q</span>
                      </div>
                    </div>

                    <div className="text-center pl-3 border-l border-white/20">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">Score</span>
                      <span className="text-xl font-black text-emerald-300">
                        {bestRecommendation.overallScore}/100
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pl-2">
                      <Link
                        to={`/farmer/recommendations?lotId=${bestRecommendation.lot?.id || bestRecommendation.lot?._id}`}
                        className="text-xs font-bold px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-lg transition-colors text-center"
                      >
                        Recommendation →
                      </Link>
                      <Link
                        to={`/farmer/market-intelligence?lotId=${bestRecommendation.lot?.id || bestRecommendation.lot?._id}`}
                        className="text-[11px] font-semibold text-emerald-200 hover:text-white text-center"
                      >
                        Compare All Markets
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Marketplace & Buyer Match Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Lots Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">My Active Lots</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Live</span>
                  </div>
                  <div className="text-4xl font-bold text-emerald-700 mb-1">
                    {activeLots === null ? <span className="text-slate-300 text-2xl">…</span> : activeLots}
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeLots === 0 ? 'No active listings. Create one to reach buyers.' : 'Active produce listings on the marketplace.'}
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
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Live Demands</span>
                  </div>
                  <div className="text-4xl font-bold text-amber-600 mb-1">
                    {matchedBuyersCount === null ? <span className="text-slate-300 text-2xl">…</span> : matchedBuyersCount}
                  </div>
                  <p className="text-xs text-slate-500">
                    {matchedBuyersCount === 0
                      ? 'No active buyer demands matching your lots at the moment.'
                      : `Potential commercial buyer procurement demands matching your active produce lots.`}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to="/marketplace/my-lots"
                    className="block text-center text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    View Matching Buyers →
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
                      <p className="text-[11px] text-slate-400 mt-1">{marketPrice.mandiName}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">
                      {profile?.cropInterests?.[0]
                        ? `No price data for ${profile.cropInterests[0]} in ${profile.location?.district || 'your district'} yet.`
                        : 'Add crops to your profile to see market prices here.'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to={`/marketplace/analytics?district=${profile?.location?.district || 'Nashik'}${profile?.cropInterests?.[0] ? `&crop=${profile.cropInterests[0]}` : ''}`}
                    className="block text-center text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-lg transition-colors"
                  >
                    📈 Analytics & Forecast →
                  </Link>
                  <Link
                    to="/marketplace/intelligence"
                    className="block text-center text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View All Mandi Prices
                  </Link>
                </div>
              </div>

              {/* Browse Marketplace Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Marketplace</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Open</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Browse all active produce lots from farmers and FPOs across Maharashtra. Compare prices and plan procurement.
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

            {/* Transactions & Deal Desk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 p-5 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    A6 Transaction Desk
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">Incoming Buyer Offers</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Review, accept, or negotiate counter-proposals with verified buyers.
                  </p>
                </div>
                <Link
                  to="/farmer/offers"
                  className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  View Offers →
                </Link>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-5 shadow-xs flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Fulfillment
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">Active Sales Orders</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Track confirmed sales orders, fulfillment progress, and lifecycle status.
                  </p>
                </div>
                <Link
                  to="/farmer/orders"
                  className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Track Orders →
                </Link>
              </div>
            </div>

            {/* Active Produce Lots — Decision Intelligence Strip */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Active Produce Lots & Sales Intelligence
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select any active lot to compare markets and inspect explainable recommendations.
                  </p>
                </div>

                <Link
                  to="/farmer/market-intelligence"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto"
                >
                  Market Intelligence Hub →
                </Link>
              </div>

              {lotsList.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200 text-xs text-slate-500">
                  <p>You have no active produce lots listed right now.</p>
                  <Link
                    to="/marketplace/create"
                    className="inline-block mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    + Create Your First Lot
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {lotsList.map((lot) => {
                    const id = lot.id || lot._id;
                    return (
                      <div
                        key={id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-3 -mx-3 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{lot.cropName}</span>
                            {lot.variety && (
                              <span className="text-xs text-slate-500">({lot.variety})</span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              Grade {lot.quality || 'A'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex gap-3">
                            <span>{lot.quantity} {lot.unit}</span>
                            <span>Target: ₹{lot.pricePerQuintal}/q</span>
                            <span>{lot.location?.district}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            to={`/farmer/market-intelligence?lotId=${id}`}
                            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            📊 Markets
                          </Link>
                          <Link
                            to={`/farmer/recommendations?lotId=${id}`}
                            className="text-xs font-semibold px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
                          >
                            🎯 Recommendation
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FarmerDashboard;
