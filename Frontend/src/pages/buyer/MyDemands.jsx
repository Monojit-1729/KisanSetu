import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import demandApi from '../../api/demandApi.js';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  fulfilled: 'bg-blue-100 text-blue-800 border-blue-200',
  expired: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export const MyDemands = () => {
  const { user, logout } = useAuth();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDemands = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await demandApi.getMyDemands({ status: statusFilter === 'all' ? undefined : statusFilter });
      setDemands(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load procurement demands');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDemands();
  }, [fetchDemands]);

  const handleCancel = async (demandId) => {
    if (!window.confirm('Cancel this procurement demand? It will no longer receive matching alerts.')) return;
    setActionLoading(demandId);
    try {
      await demandApi.deleteDemand(demandId);
      await fetchDemands();
    } catch (err) {
      alert(err.message || 'Failed to cancel demand');
    } finally {
      setActionLoading(null);
    }
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
          <nav className="flex items-center space-x-3">
            <Link
              to="/buyer/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/buyer/demands"
              className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
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
              to="/buyer/demand/create"
              className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              + Post Demand
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
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Procurement Demands</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your active commodity buying requirements and review matching Farmer & FPO produce lots.
            </p>
          </div>

          <Link
            to="/buyer/demand/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <span className="text-base leading-none">+</span> Post New Demand
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
          {['active', 'all', 'fulfilled', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab} Demands
            </button>
          ))}
        </div>

        {/* List of Demands */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading procurement demands...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        ) : demands.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl mx-auto mb-3">
              📋
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No demands found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              You do not have any {statusFilter !== 'all' ? statusFilter : ''} procurement demands yet. Post a demand to start matching with verified producers.
            </p>
            <Link
              to="/buyer/demand/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              + Post First Demand
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {demands.map((demand) => (
              <div
                key={demand.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {demand.demandId || demand.id.slice(-6)}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {demand.cropName}
                      {demand.variety && <span className="text-slate-400 font-normal text-sm ml-1">({demand.variety})</span>}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                        STATUS_COLORS[demand.status] || STATUS_COLORS.active
                      }`}
                    >
                      {demand.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quantity</span>
                      <span className="font-bold text-slate-800">
                        {demand.quantity} {demand.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Acceptable Grade</span>
                      <span className="font-bold text-slate-800">
                        {demand.quality === 'Any' ? 'Any Grade' : `Grade ${demand.quality}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Delivery District</span>
                      <span className="font-bold text-slate-800">
                        {demand.deliveryLocation?.district || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Delivery Deadline</span>
                      <span className="font-bold text-slate-800">
                        {demand.deliveryWindow?.endDate
                          ? new Date(demand.deliveryWindow.endDate).toLocaleDateString('en-IN')
                          : 'Flexible'}
                      </span>
                    </div>
                  </div>

                  {demand.targetPrice && (
                    <div className="mt-2 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg inline-block border border-amber-200">
                      Target Budget: <strong>₹{demand.targetPrice.toLocaleString('en-IN')} / {demand.unit}</strong>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to={`/buyer/demands/${demand.id}/matches`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
                  >
                    <span>🎯</span> View Matches
                  </Link>

                  {demand.status === 'active' && (
                    <button
                      onClick={() => handleCancel(demand.id)}
                      disabled={actionLoading === demand.id}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading === demand.id ? '…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyDemands;
