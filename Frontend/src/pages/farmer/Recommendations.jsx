import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import lotsApi from '../../api/lotsApi.js';
import recommendationApi from '../../api/recommendationApi.js';
import ScoreExplanation from '../../components/recommendations/ScoreExplanation.jsx';
import NetRealizationBreakdown from '../../components/recommendations/NetRealizationBreakdown.jsx';

export const Recommendations = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryLotId = searchParams.get('lotId');

  const [activeLots, setActiveLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(queryLotId || '');
  const [loadingLots, setLoadingLots] = useState(true);

  const [recommendationData, setRecommendationData] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [error, setError] = useState('');

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
        if (mounted) setError(err.message || 'Failed to load your lots');
      })
      .finally(() => {
        if (mounted) setLoadingLots(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch recommendations for selected lot
  useEffect(() => {
    if (!selectedLotId) {
      setRecommendationData(null);
      return;
    }

    let mounted = true;
    setLoadingRecommendation(true);
    setError('');

    recommendationApi
      .getForLot(selectedLotId)
      .then((data) => {
        if (mounted) setRecommendationData(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load recommendations for this lot');
          setRecommendationData(null);
        }
      })
      .finally(() => {
        if (mounted) setLoadingRecommendation(false);
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

  const topOption = recommendationData?.recommendedTopOption;
  const rankedOpportunities = recommendationData?.rankedOpportunities || [];
  const marketBenchmark = recommendationData?.marketBenchmark;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/farmer/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                KS
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  Recommendation Engine
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-1 shrink-0">
            <Link
              to={user?.role === 'fpo' ? '/fpo/dashboard' : '/farmer/dashboard'}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              ← Dashboard
            </Link>
            {selectedLotId && (
              <Link
                to={`/farmer/market-intelligence?lotId=${selectedLotId}`}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              >
                Market Comparison
              </Link>
            )}
            <Link
              to="/farmer/offers"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Offers
            </Link>
            <Link
              to="/marketplace/my-lots"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              My Lots
            </Link>
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Lot Selector & Purpose Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                <span>🎯</span> Intelligent Sale Decision
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Recommended Sales Action
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Explainable, algorithmic recommendation designed to maximize your net take-home realization
                while balancing buyer credibility and logistics friction.
              </p>
            </div>

            {/* Lot Selector */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <label htmlFor="rec-lot-select" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Produce Lot:
              </label>
              {loadingLots ? (
                <span className="text-xs text-slate-400">Loading lots...</span>
              ) : activeLots.length === 0 ? (
                <span className="text-xs text-amber-700">No active lots available.</span>
              ) : (
                <select
                  id="rec-lot-select"
                  value={selectedLotId}
                  onChange={handleSelectLot}
                  className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
                >
                  {activeLots.map((lot) => (
                    <option key={lot.id || lot._id} value={lot.id || lot._id}>
                      {lot.cropName} ({lot.variety || 'Standard'}) — {lot.quantity} {lot.unit}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loadingRecommendation && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Calculating Top Sales Recommendation...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluating buyer demands, freight costs, and APMC tariffs to identify your best net realization.
            </p>
          </div>
        )}

        {/* Error */}
        {!loadingRecommendation && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="text-base font-bold">Error Loading Recommendation</h3>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loadingRecommendation && !error && recommendationData && (
          <>
            {/* No Top Option State */}
            {!topOption ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
                <div className="text-4xl mb-2">🌾</div>
                <h3 className="text-base font-bold text-slate-800">No Viable Opportunities Found for This Lot</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {recommendationData.message ||
                    'Currently no buyer procurement demands or active mandi auctions align with this lot quantity and grade.'}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    to="/marketplace/my-lots"
                    className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
                  >
                    Manage Lots
                  </Link>
                  <Link
                    to="/marketplace/intelligence"
                    className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                  >
                    View Market Trends
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. HERO CARD: Top Recommended Option */}
                <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-1 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-400 text-emerald-950 font-black text-xs uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <span>⭐</span> RECOMMENDED OPTION
                        </span>
                        <span className="bg-white/10 text-emerald-200 text-xs px-3 py-1 rounded-full font-medium">
                          {topOption.channelType === 'buyer' ? 'Direct Commercial Procurement' : 'APMC Mandi Auction'}
                        </span>
                        {topOption.buyerMetadata?.isVerified && (
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-400/30 flex items-center gap-1">
                            <span>✓</span> Verified Buyer
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {topOption.partnerName}
                      </h2>

                      <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
                        {recommendationData.explanation}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-emerald-200/80 pt-2">
                        <span>📍 Delivery: <strong>{topOption.destinationLocation}</strong></span>
                        {topOption.realization?.distanceKm > 0 && (
                          <span>🛣️ Distance: <strong>~{topOption.realization.distanceKm} km</strong></span>
                        )}
                        {topOption.demandMetadata?.deliveryWindow?.endDate && (
                          <span>
                            ⏰ Deadline: <strong>{new Date(topOption.demandMetadata.deliveryWindow.endDate).toLocaleDateString('en-IN')}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial Callout Box */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center sm:text-right shrink-0 min-w-[240px]">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 block">
                        Estimated Net Realization
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-white my-1">
                        ₹{topOption.netPerQuintal?.toLocaleString('en-IN')}
                        <span className="text-sm font-normal text-emerald-200"> /q</span>
                      </div>
                      <div className="text-xs text-emerald-200">
                        Total Net: <strong className="text-white text-sm">₹{topOption.estimatedNetRealization?.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-emerald-300">Algorithmic Fit:</span>
                        <span className="font-black text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-400/30">
                          {topOption.overallScore} / 100
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/15">
                        <Link
                          to={topOption.channelType === 'buyer' ? '/farmer/offers' : `/marketplace/analytics?crop=${recommendationData.lotSummary?.cropName}&district=${topOption.destinationLocation || 'Nashik'}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl transition-colors shadow-xs"
                        >
                          {topOption.channelType === 'buyer' ? '💼 View Buyer Offers & Deals →' : '📈 View Market Analytics →'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. EXPLAINABILITY: Why This is Recommended */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <ScoreExplanation
                    overallScore={topOption.overallScore}
                    scoreBreakdown={topOption.scoreBreakdown}
                    reasons={topOption.reasons}
                  />

                  {/* Detailed Net Realization Cost Breakdown for Top Option */}
                  <NetRealizationBreakdown
                    realization={topOption.realization}
                    channelType={topOption.channelType}
                    partnerName={topOption.partnerName}
                  />
                </div>

                {/* 3. MULTI-OPPORTUNITY COMPARISON TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Net Realization Comparison Across Channels
                      </h3>
                      <p className="text-xs text-slate-500">
                        Gross revenue minus estimated logistics and regulatory costs across all evaluated options.
                      </p>
                    </div>

                    <Link
                      to={`/farmer/market-intelligence?lotId=${selectedLotId}`}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-auto"
                    >
                      Compare In Detail →
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                          <th className="py-3 px-3">Opportunity</th>
                          <th className="py-3 px-3">Channel</th>
                          <th className="py-3 px-3">Gross Price</th>
                          <th className="py-3 px-3">Est. Transport</th>
                          <th className="py-3 px-3">APMC Cess & Fees</th>
                          <th className="py-3 px-3">Est. Net Realisation</th>
                          <th className="py-3 px-3 text-center">Score</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rankedOpportunities.map((opp, idx) => {
                          const isTop = opp.opportunityId === topOption.opportunityId;
                          return (
                            <tr
                              key={opp.opportunityId || idx}
                              className={isTop ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50/70'}
                            >
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2">
                                  {isTop && <span className="text-amber-500">⭐</span>}
                                  <span className="font-bold text-slate-900">{opp.partnerName}</span>
                                  {isTop && (
                                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                                      Best
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 block">{opp.destinationLocation}</span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="capitalize text-slate-600">
                                  {opp.channelType === 'buyer' ? 'Direct Buyer' : 'APMC Mandi'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-slate-800">
                                ₹{opp.unitPrice?.toLocaleString('en-IN')}/q
                                <span className="text-[10px] text-slate-400 block">
                                  (₹{opp.realization?.grossValue?.toLocaleString('en-IN')})
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-rose-600">
                                − ₹{opp.realization?.transportCost?.toLocaleString('en-IN')}
                                <span className="text-[10px] text-slate-400 block">
                                  (~{opp.realization?.distanceKm || 0} km)
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-rose-600">
                                − ₹{(opp.realization?.mandiCess + opp.realization?.handlingCost)?.toLocaleString('en-IN')}
                                <span className="text-[10px] text-slate-400 block">
                                  {opp.channelType === 'mandi' ? '1.5% cess + weighing' : '0% cess (direct)'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="font-extrabold text-emerald-700 text-sm">
                                  ₹{opp.netPerQuintal?.toLocaleString('en-IN')}/q
                                </span>
                                <span className="text-[10px] text-emerald-600 block">
                                  Total: ₹{opp.estimatedNetRealization?.toLocaleString('en-IN')}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    opp.overallScore >= 80
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : opp.overallScore >= 60
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {opp.overallScore}/100
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                {opp.channelType === 'buyer' ? (
                                  <Link
                                    to="/farmer/offers"
                                    className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                  >
                                    Offers →
                                  </Link>
                                ) : (
                                  <Link
                                    to={`/marketplace/analytics?crop=${recommendationData.lotSummary?.cropName}&district=${opp.destinationLocation || 'Nashik'}`}
                                    className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  >
                                    Trends →
                                  </Link>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. MARKET DATA TRANSPARENCY & STATUTORY CITATION */}
                {marketBenchmark && (
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Mandi Benchmark Source:</span> AGMARKNET / MSAMB State APMC Feed
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Benchmark Reference:</span> {marketBenchmark.mandiName} ({marketBenchmark.district}) · Modal: ₹{marketBenchmark.modalPrice}/q
                    </div>
                  </div>
                )}

                {/* Advisory Disclaimer */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-center text-xs text-amber-900 leading-relaxed max-w-4xl mx-auto">
                  <strong>Decision Support Disclaimer:</strong> All figures are deterministic non-binding estimates based on prevailing market tariffs, buyer stated requirements, and APMC daily market arrivals. This system does not guarantee future price stability or physical quality acceptance at delivery.
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Recommendations;
