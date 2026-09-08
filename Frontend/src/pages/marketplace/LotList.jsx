import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import lotsApi from '../../api/lotsApi.js';

const QUALITY_LABELS = { A: 'Grade A', B: 'Grade B', C: 'Grade C' };
const QUALITY_COLORS = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-amber-100 text-amber-800 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
};

const LotCard = ({ lot }) => (
  <Link
    to={`/marketplace/${lot.id}`}
    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col gap-3 group"
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors leading-snug">
          {lot.cropName}
          {lot.variety && <span className="text-slate-400 font-normal ml-1 text-sm">({lot.variety})</span>}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {lot.location?.district}, {lot.location?.state}
        </p>
      </div>
      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${QUALITY_COLORS[lot.quality] || QUALITY_COLORS.B}`}>
        {QUALITY_LABELS[lot.quality] || lot.quality}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="bg-slate-50 rounded-xl p-3">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Quantity</span>
        <span className="font-bold text-slate-800 text-sm">{lot.quantity} {lot.unit}</span>
      </div>
      <div className="bg-emerald-50 rounded-xl p-3">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 block">Ask Price</span>
        <span className="font-bold text-emerald-700 text-sm">₹{lot.pricePerQuintal?.toLocaleString('en-IN')}/q</span>
      </div>
    </div>

    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
      <span className="font-medium">{lot.owner?.name || 'Anonymous'}</span>
      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded-full capitalize font-semibold text-slate-600">
        {lot.ownerRole}
      </span>
    </div>
  </Link>
);

export const LotList = () => {
  const { user, logout } = useAuth();
  const [lots, setLots] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ cropName: '', district: '', quality: '' });
  const [crops, setCrops] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Load filter options
  useEffect(() => {
    lotsApi.getDistinctCrops().then((d) => setCrops(d.crops || [])).catch(() => {});
    lotsApi.getDistinctDistricts().then((d) => setDistricts(d.districts || [])).catch(() => {});
  }, []);

  const fetchLots = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await lotsApi.listActive({ ...filters, page: currentPage, limit: 12 });
      setLots(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLots(1);
  }, [fetchLots]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLots(1);
  };

  const canCreateLot = user?.role === 'farmer' || user?.role === 'fpo';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">KS</div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Marketplace</span>
            </div>
          </div>
          <nav className="flex items-center space-x-3">
            <Link to={`/${user?.role}/dashboard`} className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Dashboard
            </Link>
            <Link to="/marketplace" className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Browse
            </Link>
            <Link to="/marketplace/intelligence" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Price Intel
            </Link>
            {canCreateLot && (
              <Link to="/marketplace/my-lots" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                My Lots
              </Link>
            )}
            <div className="h-4 w-px bg-slate-200" />
            <button onClick={logout} className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Produce Marketplace</h1>
            <p className="text-sm text-slate-500 mt-0.5">{total} active listing{total !== 1 ? 's' : ''} available</p>
          </div>
          {canCreateLot && (
            <Link
              to="/marketplace/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <span className="text-lg leading-none">+</span> List Produce
            </Link>
          )}
        </div>

        {/* Filters */}
        <form onSubmit={handleFilterSubmit} className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-end shadow-xs">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">Crop</label>
            <select
              name="cropName"
              value={filters.cropName}
              onChange={handleFilterChange}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Crops</option>
              {crops.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">District</label>
            <select
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Districts</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">Quality</label>
            <select
              name="quality"
              value={filters.quality}
              onChange={handleFilterChange}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => { setFilters({ cropName: '', district: '', quality: '' }); }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>
        ) : lots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
            <div className="text-4xl mb-3">🌾</div>
            <h3 className="font-semibold text-slate-700 text-base">No listings found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or check back later.</p>
            {canCreateLot && (
              <Link to="/marketplace/create" className="inline-flex mt-4 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
                List Your Produce →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {lots.map((lot) => <LotCard key={lot.id} lot={lot} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchLots(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-sm text-slate-600 font-medium px-2">Page {page} of {pages}</span>
                <button
                  onClick={() => fetchLots(page + 1)}
                  disabled={page >= pages}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LotList;
