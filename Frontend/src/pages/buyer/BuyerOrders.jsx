import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import ordersApi from '../../api/ordersApi.js';

export const BuyerOrders = () => {
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
      setError(err.message || 'Failed to load procurement orders');
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

  const totalProcurementValue = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/buyer/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                KS
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
                <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  Buyer Procurement Orders
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-3">
            <Link
              to="/buyer/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/buyer/offers"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              My Offers
            </Link>
            <Link
              to="/buyer/supply"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Browse Supply
            </Link>
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mb-2">
                <span>📦</span> Procurement Contracts
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                My Purchase Orders
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Track status of your confirmed produce procurement contracts through seller packing, dispatch, and delivery.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Procurement</span>
              <span className="text-2xl font-black text-amber-950">
                ₹{totalProcurementValue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 block">
                {orders.length} contract{orders.length !== 1 ? 's' : ''} confirmed
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
                    ? 'bg-amber-600 text-white shadow-xs'
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
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-2">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="text-base font-bold text-slate-800">No {statusFilter !== 'all' ? statusFilter.replace(/_/g, ' ') : ''} orders</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Accepted purchase offers automatically turn into confirmed procurement contracts.
            </p>
            <Link
              to="/buyer/supply"
              className="inline-block mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              Browse Available Lots →
            </Link>
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
                        {order.cropName} Procurement Order
                      </span>
                      <span className="text-xs text-slate-400">({order.orderId})</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 capitalize">
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
                      <span>Seller: <strong>{order.seller?.name || 'Produce Farmer / FPO'}</strong></span>
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
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Order Commitment</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900">
                        ₹{order.totalValue?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${id}`}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      Track Order Details →
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

export default BuyerOrders;
