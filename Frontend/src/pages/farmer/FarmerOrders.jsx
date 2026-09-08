import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import ordersApi from '../../api/ordersApi.js';

export const FarmerOrders = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data.orders || data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.orderStatus === statusFilter;
  });

  const totalValue = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
  const isFpo = user?.role === 'fpo';
  const dashboardLink = isFpo ? '/fpo/dashboard' : '/farmer/dashboard';
  const offersLink = isFpo ? '/fpo/offers' : '/farmer/offers';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={dashboardLink} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                KS
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  {isFpo ? 'FPO Orders' : 'Farmer Orders'}
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-1 shrink-0">
            <Link
              to={dashboardLink}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <Link
              to={offersLink}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Incoming Offers
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Title Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                <span>📦</span> Sales Contracts & Orders
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Confirmed Produce Orders
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Track status of your confirmed buyer purchase orders through packing, dispatch, transit, and delivery.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Order Volume</span>
              <span className="text-2xl font-black text-emerald-700">
                ₹{totalValue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 block">
                {orders.length} transaction{orders.length !== 1 ? 's' : ''} confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {['all', 'confirmed', 'processing', 'ready_for_dispatch', 'in_transit', 'delivered', 'completed'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-colors capitalize cursor-pointer shrink-0 ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status.replace(/_/g, ' ')} ({orders.filter((o) => (status === 'all' ? true : o.orderStatus === status)).length})
              </button>
            )
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-2">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="text-base font-bold text-slate-800">No {statusFilter !== 'all' ? statusFilter.replace(/_/g, ' ') : ''} orders</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When buyers' commercial purchase offers are accepted, confirmed orders will appear here automatically.
            </p>
            <div className="pt-3">
              <Link
                to={offersLink}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200"
              >
                Review Incoming Offers →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const id = order._id || order.id;
              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">
                        {order.cropName} Procurement Contract
                      </span>
                      <span className="text-xs text-slate-400">({order.orderId})</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Grade {order.grade || 'A'}
                      </span>
                      {order.logistics?.status && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                          🚚 {order.logistics.status.replace(/_/g, ' ')}
                        </span>
                      )}
                      {order.payment?.status && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 capitalize">
                          💳 {order.payment.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Buyer: <strong>{order.buyer?.name || 'Commercial Buyer'}</strong></span>
                      <span>•</span>
                      <span>Quantity: <strong>{order.quantity} {order.unit || 'quintals'}</strong></span>
                      <span>•</span>
                      <span>Agreed Rate: <strong>₹{order.agreedPricePerUnit}/{order.unit || 'q'}</strong></span>
                      <span>•</span>
                      <span>Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Contract Value</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900">
                        ₹{order.totalValue?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${id}`}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      View Order Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerOrders;
