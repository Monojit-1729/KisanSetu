import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import lotsApi from '../../api/lotsApi.js';
import recommendationApi from '../../api/recommendationApi.js';
import OpportunityCard from '../../components/recommendations/OpportunityCard.jsx';

export const MarketIntelligence = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryLotId = searchParams.get('lotId');

  const [activeLots, setActiveLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(queryLotId || '');
  const [loadingLots, setLoadingLots] = useState(true);

  const [intelligenceData, setIntelligenceData] = useState(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState('netReturn'); // 'netReturn', 'score', 'distance', 'grossPrice'
  const [channelFilter, setChannelFilter] = useState('all'); // 'all', 'buyer', 'mandi'

  // 1. Fetch user's active lots
  useEffect(() => {
    let mounted = true;
    setLoadingLots(true);

    lotsApi
      .getMyLots()
      .then((data) => {
        if (!mounted) return;
        const lots = (data.lots || []).filter((l) => l.status === 'active');
        setActiveLots(lots);

        if (!selectedLotId && lots.length > 0) {
          const firstId = lots[0].id || lots[0]._id;
          setSelectedLotId(firstId);
          setSearchParams({ lotId: firstId });
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load your active lots');
      })
      .finally(() => {
        if (mounted) setLoadingLots(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch intelligence for selected lot
  useEffect(() => {
    if (!selectedLotId) {
      setIntelligenceData(null);
      return;
    }

    let mounted = true;
    setLoadingIntelligence(true);
    setError('');

    recommendationApi
      .getForLot(selectedLotId)
      .then((data) => {
        if (mounted) setIntelligenceData(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to analyze market intelligence for this lot.');
          setIntelligenceData(null);
        }
      })
      .finally(() => {
        if (mounted) setLoadingIntelligence(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedLotId]);

  const handleSelectLot = (e) => {
    const lotId = e.target.value;
    setSelectedLotId(lotId);
    setSearchParams({ lotId });
  };

  const selectedLotObj = useMemo(() => {
    return activeLots.find((l) => (l.id || l._id) === selectedLotId) || intelligenceData?.lotSummary;
  }, [activeLots, selectedLotId, intelligenceData]);

  // Filter and sort opportunities
  const processedOpportunities = useMemo(() => {
    if (!intelligenceData?.rankedOpportunities) return [];

    let list = [...intelligenceData.rankedOpportunities];

    if (channelFilter !== 'all') {
      list = list.filter((o) => o.channelType === channelFilter);
    }

    switch (sortBy) {
      case 'score':
        list.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'grossPrice':
        list.sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0));
        break;
      case 'distance':
        list.sort((a, b) => (a.realization?.distanceKm || 0) - (b.realization?.distanceKm || 0));
        break;
      case 'netReturn':
      default:
        list.sort((a, b) => (b.netPerQuintal || 0) - (a.netPerQuintal || 0));
        break;
    }

    return list;
  }, [intelligenceData, channelFilter, sortBy]);

  const topRecommendedId = intelligenceData?.recommendedTopOption?.opportunityId;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/farmer/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
                KS
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  Market Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 sm:space-x-3">
            <Link
              to={user?.role === 'fpo' ? '/fpo/dashboard' : '/farmer/dashboard'}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <Link
              to="/marketplace/my-lots"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              My Lots
            </Link>
            {selectedLotId && (
              <Link
                to={`/farmer/recommendations?lotId=${selectedLotId}`}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                Top Recommendation →
              </Link>
            )}
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 md:hidden">
            {selectedLotId && (
              <Link
                to={`/farmer/recommendations?lotId=${selectedLotId}`}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg shadow-xs"
              >
                Top Rec →
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <Link
              to={user?.role === 'fpo' ? '/fpo/dashboard' : '/farmer/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              ← Back to Dashboard
            </Link>
            <Link
              to="/marketplace/my-lots"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              My Lots
            </Link>
            {selectedLotId && (
              <Link
                to={`/farmer/recommendations?lotId=${selectedLotId}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Top Recommendation →
              </Link>
            )}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header & Lot Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                <span>📊</span> Comparative Sales Intelligence
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Where & To Whom Should I Sell?
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Compare actual direct commercial buyer requirements against regulated APMC mandi auctions.
                All figures calculate true net returns after freight, fees, and handling.
              </p>
            </div>

            {/* Active Lot Selector */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <label htmlFor="lot-select" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Lot:
              </label>
              {loadingLots ? (
                <span className="text-xs text-slate-400">Loading lots...</span>
              ) : activeLots.length === 0 ? (
                <div className="text-xs text-amber-700">
                  <span>No active lots found. </span>
                  <Link to="/marketplace/create" className="font-bold underline">
                    Create a Lot
                  </Link>
                </div>
              ) : (
                <select
                  id="lot-select"
                  value={selectedLotId}
                  onChange={handleSelectLot}
                  className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 w-full sm:w-auto max-w-full truncate"
                >
                  {activeLots.map((lot) => (
                    <option key={lot.id || lot._id} value={lot.id || lot._id}>
                      {lot.cropName} ({lot.variety || 'Standard'}) — {lot.quantity} {lot.unit} [₹{lot.pricePerQuintal}/q]
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Selected Lot Metadata Pills */}
          {selectedLotObj && (
            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Current Lot Profile:</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                Crop: <strong>{selectedLotObj.cropName}</strong>
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                Quantity: <strong>{selectedLotObj.quantity} {selectedLotObj.unit}</strong>
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                Quality: <strong>Grade {selectedLotObj.quality || 'A'}</strong>
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                Farm Origin: <strong>{selectedLotObj.location?.district || 'Nashik'}</strong>
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                Target Price: <strong>₹{selectedLotObj.pricePerQuintal || selectedLotObj.askingPricePerQuintal}/q</strong>
              </span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loadingIntelligence && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Analyzing Current Market Opportunities...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Scanning active commercial buyer demands, calculating road haulage tariffs, and evaluating APMC mandi benchmarks.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loadingIntelligence && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="text-base font-bold">Unable to Load Intelligence</h3>
            <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => setSelectedLotId(selectedLotId)}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Content Area */}
        {!loadingIntelligence && !error && intelligenceData && (
          <>
            {/* Market Benchmark Ribbon & Data Source Attribution */}
            {intelligenceData.marketBenchmark && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <span className="font-bold text-blue-900 block">
                      Local APMC Mandi Benchmark: {intelligenceData.marketBenchmark.mandiName} ({intelligenceData.marketBenchmark.district})
                    </span>
                    <span className="text-blue-700 text-[11px]">
                      Modal Price: <strong>₹{intelligenceData.marketBenchmark.modalPrice?.toLocaleString('en-IN')}/q</strong> (Min: ₹{intelligenceData.marketBenchmark.minPrice} · Max: ₹{intelligenceData.marketBenchmark.maxPrice})
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right text-[11px] text-blue-700 shrink-0">
                  <span className="block font-semibold">Source: AGMARKNET / MSAMB</span>
                  <span className="text-blue-600">
                    {intelligenceData.marketBenchmark.freshnessNotice || 'Prevailing arrivals'}
                  </span>
                </div>
              </div>
            )}

            {/* Filter and Sort Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Channel:</span>
                <button
                  type="button"
                  onClick={() => setChannelFilter('all')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    channelFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All Channels ({intelligenceData.totalOpportunitiesCount || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setChannelFilter('buyer')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    channelFilter === 'buyer'
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Direct Buyers
                </button>
                <button
                  type="button"
                  onClick={() => setChannelFilter('mandi')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    channelFilter === 'mandi'
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  APMC Mandis
                </button>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500"
                >
                  <option value="netReturn">Highest Net Realization</option>
                  <option value="score">Highest Fit Score</option>
                  <option value="distance">Shortest Distance</option>
                  <option value="grossPrice">Highest Gross Price</option>
                </select>
              </div>
            </div>

            {/* Opportunities List */}
            {processedOpportunities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
                <div className="text-4xl mb-2">🔍</div>
                <h3 className="text-base font-bold text-slate-800">No Viable Opportunities Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No matching commercial buyer demands or local APMC arrivals currently align with this lot's specifications.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {processedOpportunities.map((opp, idx) => {
                  const isTop = opp.opportunityId === topRecommendedId;
                  return (
                    <OpportunityCard
                      key={opp.opportunityId || idx}
                      opportunity={opp}
                      isTopRecommended={isTop}
                      rank={idx + 1}
                      onSelect={() => navigate(`/farmer/recommendations?lotId=${selectedLotId}`)}
                    />
                  );
                })}
              </div>
            )}

            {/* Bottom Recommendation CTA Strip */}
            {intelligenceData.recommendedTopOption && (
              <div className="bg-emerald-800 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                    Decision Confidence
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Recommended: {intelligenceData.recommendedTopOption.partnerName}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
                    {intelligenceData.explanation}
                  </p>
                </div>

                <Link
                  to={`/farmer/recommendations?lotId=${selectedLotId}`}
                  className="px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors text-center shrink-0 shadow-xs"
                >
                  View Full Recommendation & Rationale →
                </Link>
              </div>
            )}

            {/* Non-binding Legal/Regulatory Disclaimer */}
            <div className="text-center text-[11px] text-slate-400 py-4 max-w-3xl mx-auto leading-relaxed">
              {intelligenceData.disclaimer ||
                'DISCLAIMER: All outputs are non-binding estimates based on prevailing market tariffs and stated target prices. Actual realization may vary based on final physical quality inspection, vehicle availability, and mutual agreement.'}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MarketIntelligence;
