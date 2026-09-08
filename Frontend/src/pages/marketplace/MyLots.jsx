import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import lotsApi from '../../api/lotsApi.js';
import matchingApi from '../../api/matchingApi.js';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
  sold: 'bg-blue-100 text-blue-800 border-blue-200',
};

const LotRow = ({ lot, matchCount, onViewMatches, onPublish, onClose, actionLoading }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <h3 className="font-bold text-slate-900 text-base leading-tight">{lot.cropName}</h3>
        {lot.variety && <span className="text-slate-400 text-sm">({lot.variety})</span>}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[lot.status] || STATUS_COLORS.draft}`}>
          {lot.status}
        </span>
        {lot.status === 'active' && matchCount > 0 && (
          <button
            onClick={() => onViewMatches(lot)}
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>🎯</span> {matchCount} Buyer Match{matchCount !== 1 ? 'es' : ''}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span>{lot.quantity} {lot.unit}</span>
        <span>₹{lot.pricePerQuintal?.toLocaleString('en-IN')}/q</span>
        <span>Grade {lot.quality}</span>
        <span>{lot.location?.district}, {lot.location?.state}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0 flex-wrap">
      <Link
        to={`/marketplace/${lot.id}`}
        className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        View
      </Link>
      {lot.status === 'active' && (
        <Link
          to={`/farmer/recommendations?lotId=${lot.id || lot._id}`}
          className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
        >
          <span>🎯</span> Recommendation
        </Link>
      )}
      {lot.status === 'active' && (
        <Link
          to={`/farmer/market-intelligence?lotId=${lot.id || lot._id}`}
          className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          📊 Markets
        </Link>
      )}
      {lot.status === 'active' && matchCount > 0 && (
        <button
          onClick={() => onViewMatches(lot)}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          View Buyers
        </button>
      )}
      {lot.status === 'draft' && (
        <button
          onClick={() => onPublish(lot.id)}
          disabled={actionLoading === lot.id}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {actionLoading === lot.id ? '…' : 'Publish'}
        </button>
      )}
      {lot.status === 'active' && (
        <button
          onClick={() => onClose(lot.id)}
          disabled={actionLoading === lot.id}
          className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {actionLoading === lot.id ? '…' : 'Close'}
        </button>
      )}
    </div>
  </div>
);

export const MyLots = () => {
  const { user, logout } = useAuth();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Matched buyers modal state
  const [matchSummary, setMatchSummary] = useState({});
  const [selectedLot, setSelectedLot] = useState(null);
  const [matchedDemands, setMatchedDemands] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const fetchLots = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await lotsApi.getMyLots();
      setLots(data.lots || []);

      // Fetch matching summary
      matchingApi.getMyLotsMatchSummary().then((summary) => {
        const map = {};
        (summary.lots || []).forEach((item) => {
          map[item.lotId] = item.matchingBuyersCount;
        });
        setMatchSummary(map);
      }).catch(() => {});
    } catch (err) {
      setError(err.message || 'Failed to load your lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleViewMatches = async (lot) => {
    setSelectedLot(lot);
    setMatchesLoading(true);
    try {
      const res = await matchingApi.getMatchesForLot(lot.id);
      setMatchedDemands(res.matches || []);
    } catch (err) {
      alert(err.message || 'Failed to fetch matched buyers');
    } finally {
      setMatchesLoading(false);
    }
  };

  const handlePublish = async (id) => {
    setActionLoading(id);
    try {
      await lotsApi.updateLot(id, { status: 'active' });
      setLots((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'active' } : l)));
    } catch (err) {
      setError(err.message || 'Failed to publish lot');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this lot? It will be removed from the marketplace.')) return;
    setActionLoading(id);
    try {
      await lotsApi.closeLot(id);
      setLots((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'closed' } : l)));
    } catch (err) {
      setError(err.message || 'Failed to close lot');
    } finally {
      setActionLoading(null);
    }
  };

  const activeLots = lots.filter((l) => l.status === 'active');
  const draftLots = lots.filter((l) => l.status === 'draft');
  const pastLots = lots.filter((l) => l.status === 'closed' || l.status === 'sold');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              KS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">My Lots</span>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 shrink-0">
            <Link
              to={`/${user?.role}/dashboard`}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Browse
            </Link>
            <Link
              to="/farmer/offers"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Offers
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title + create button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Produce Lots</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your produce listings and discover interested buyers</p>
          </div>
          <Link
            to="/marketplace/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <span className="text-lg leading-none">+</span> New Lot
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading your listings...
          </div>
        ) : lots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-3">
              🌱
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No lots listed yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Create your first produce lot to list your harvest and automatically match with interested commercial buyers.
            </p>
            <Link
              to="/marketplace/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              + Create First Lot
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Lots */}
            {activeLots.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-bold text-slate-800">Active Listings</h2>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    {activeLots.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {activeLots.map((lot) => (
                    <LotRow
                      key={lot.id}
                      lot={lot}
                      matchCount={matchSummary[lot.id] || 0}
                      onViewMatches={handleViewMatches}
                      onPublish={handlePublish}
                      onClose={handleClose}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Draft Lots */}
            {draftLots.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-bold text-slate-800">Drafts</h2>
                  <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {draftLots.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {draftLots.map((lot) => (
                    <LotRow
                      key={lot.id}
                      lot={lot}
                      matchCount={0}
                      onViewMatches={handleViewMatches}
                      onPublish={handlePublish}
                      onClose={handleClose}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Closed / Sold Lots */}
            {pastLots.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-bold text-slate-800">Past Lots</h2>
                  <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                    {pastLots.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {pastLots.map((lot) => (
                    <LotRow
                      key={lot.id}
                      lot={lot}
                      matchCount={0}
                      onViewMatches={handleViewMatches}
                      onPublish={handlePublish}
                      onClose={handleClose}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Matched Buyers Modal (Read-Only) */}
        {selectedLot && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col shadow-xl">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Buyer Demand Matches
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Buyers Looking for {selectedLot.cropName} ({selectedLot.quantity} {selectedLot.unit})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministic matches based on commodity, grade, location, and delivery timing.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLot(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Matched list */}
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {matchesLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Finding matching buyer demands...
                  </div>
                ) : matchedDemands.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No active buyer demands match this lot at the moment.
                  </div>
                ) : (
                  matchedDemands.map(({ demand, fitScore, reasons }) => (
                    <div
                      key={demand.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-200 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {demand.buyer?.name || 'Commercial Buyer'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {demand.demandId || demand.id.slice(-6)}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {fitScore}% Match
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 bg-white p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Required Qty</span>
                          <span className="font-semibold text-slate-800">{demand.quantity} {demand.unit}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Acceptable Grade</span>
                          <span className="font-semibold text-slate-800">{demand.quality}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Destination</span>
                          <span className="font-semibold text-slate-800">{demand.deliveryLocation?.district}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Target Budget</span>
                          <span className="font-semibold text-emerald-700">
                            {demand.targetPrice ? `₹${demand.targetPrice.toLocaleString('en-IN')}/q` : 'Open'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {reasons.map((r, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span>💡 Direct buyer matching active.</span>
                  <Link
                    to={`/farmer/recommendations?lotId=${selectedLot.id || selectedLot._id}`}
                    className="font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Evaluate Net Realization →
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/farmer/offers"
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                  >
                    View Offers Desk
                  </Link>
                  <button
                    onClick={() => setSelectedLot(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyLots;
