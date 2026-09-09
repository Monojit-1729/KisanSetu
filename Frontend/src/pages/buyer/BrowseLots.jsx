import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import lotsApi from '../../api/lotsApi.js';
import { FILTER_GRADE_OPTIONS } from '../../data/masterData.js';

const QUALITY_COLORS = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-amber-100 text-amber-800 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const BrowseLots = () => {
  const { logout } = useAuth();
  const [lots, setLots] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    cropName: '',
    district: '',
    quality: '',
  });

  const [availableCrops, setAvailableCrops] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  useEffect(() => {
    lotsApi.getDistinctCrops().then((d) => setAvailableCrops(d.crops || [])).catch(() => {});
    lotsApi.getDistinctDistricts().then((d) => setAvailableDistricts(d.districts || [])).catch(() => {});
  }, []);

  const fetchLots = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError('');
      try {
        const res = await lotsApi.listActive({ ...filters, page: pageNum, limit: 12 });
        setLots(res.items || []);
        setTotal(res.total || 0);
        setPage(res.page || 1);
        setPages(res.pages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load available produce lots');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchLots(1);
  }, [fetchLots]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => {
    setFilters({ cropName: '', district: '', quality: '' });
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
              className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shrink-0"
            >
              Browse Supply
            </Link>
            <Link
              to="/buyer/demand/create"
              className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs shrink-0"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Farmer & FPO Supply</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Discover verified produce lots available directly from farmers and aggregated FPO supply across Maharashtra.
            </p>
          </div>

          <Link
            to="/buyer/demand/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            Can't find what you need? <strong>+ Post Demand</strong>
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Crop Commodity</label>
              <select
                name="cropName"
                value={filters.cropName}
                onChange={handleFilterChange}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">All Commodities</option>
                {availableCrops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">District</label>
              <select
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">All Districts</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Quality Grade</label>
              <select
                name="quality"
                value={filters.quality}
                onChange={handleFilterChange}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {FILTER_GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Lots Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading produce lots...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        ) : lots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto mb-3">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching lots found</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
              No active produce lots match the selected filters. Try clearing filters or post a demand to let suppliers come to you.
            </p>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {lot.cropName}
                          {lot.variety && <span className="text-slate-400 font-normal ml-1 text-sm">({lot.variety})</span>}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lot.location?.district}, {lot.location?.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            QUALITY_COLORS[lot.quality] || QUALITY_COLORS.B
                          }`}
                        >
                          Grade {lot.quality}
                        </span>
                        {lot.qualityStatus && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                              lot.qualityStatus === 'verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : lot.qualityStatus === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {lot.qualityStatus === 'verified' ? '✓ Verified' : lot.qualityStatus === 'rejected' ? 'Rejected' : 'Declared'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3">
                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quantity</span>
                        <span className="font-bold text-slate-800">{lot.quantity} {lot.unit}</span>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-xl text-xs">
                        <span className="text-[10px] uppercase font-semibold text-emerald-700 block">Ask Price</span>
                        <span className="font-bold text-emerald-800">₹{lot.pricePerQuintal?.toLocaleString('en-IN')}/q</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="truncate">{lot.owner?.name || 'Producer'}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded-md capitalize text-slate-600">
                        {lot.ownerRole}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    <Link
                      to={`/marketplace/${lot.id}`}
                      className="w-full text-center text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors shadow-xs"
                    >
                      View Lot Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchLots(page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {page} of {pages} ({total} total)
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => fetchLots(page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BrowseLots;
