import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import ordersApi from '../../api/ordersApi.js';
import OrderTimeline from '../../components/orders/OrderTimeline.jsx';

const STATUS_TRANSITIONS = {
  confirmed: { next: 'processing', label: 'Mark as Processing / Packing' },
  processing: { next: 'ready_for_dispatch', label: 'Mark as Ready for Dispatch' },
  ready_for_dispatch: { next: 'in_transit', label: 'Mark as In Transit' },
  in_transit: { next: 'delivered', label: 'Confirm Delivered' },
  delivered: { next: 'completed', label: 'Complete Order & Close Contract' },
};

export const OrderDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data.order || data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Update order status to '${newStatus.replace(/_/g, ' ')}'?`)) return;
    setActionLoading(true);
    try {
      await ordersApi.updateOrderStatus(id, {
        newStatus,
        note: statusNote || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
      });
      setStatusNote('');
      fetchOrder();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const isBuyer = order && user && (order.buyer?._id === user.id || order.buyer === user.id);
  const isSeller = order && user && (order.seller?._id === user.id || order.seller === user.id);
  const dashboardLink = isBuyer ? '/buyer/dashboard' : user?.role === 'fpo' ? '/fpo/dashboard' : '/farmer/dashboard';
  const ordersListLink = isBuyer ? '/buyer/orders' : user?.role === 'fpo' ? '/fpo/orders' : '/farmer/orders';

  const transitionConfig = order ? STATUS_TRANSITIONS[order.orderStatus] : null;

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
                  Order Management
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-3">
            <Link
              to={dashboardLink}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to={ordersListLink}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              All Orders
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold">Loading order details...</span>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-600 shadow-xs space-y-3">
            <div className="text-4xl">❌</div>
            <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
            <p className="text-xs text-slate-500">{error || 'This order does not exist or you are not authorized to view it.'}</p>
            <Link
              to={dashboardLink}
              className="inline-block mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Confirmed Contract
                    </span>
                    <span className="text-xs text-slate-400">Order #{order.orderId}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {order.cropName} Procurement Order
                  </h1>

                  <p className="text-xs text-slate-500 mt-1">
                    Contract initiated on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Agreed Value</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                    ₹{order.totalValue?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 block mt-0.5">
                    {order.quantity} {order.unit || 'quintals'} @ ₹{order.agreedPricePerUnit}/{order.unit || 'q'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <OrderTimeline currentStatus={order.orderStatus} timeline={order.timeline} />

            {/* Parties & Produce Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buyer Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Buyer Participant</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                    {order.buyer?.name?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.buyer?.name || 'Commercial Buyer'}</h4>
                    <span className="text-xs text-slate-500">{order.buyer?.email}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Role: <strong>Commercial Wholesale Buyer</strong></span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Seller Participant</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                    {order.seller?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.seller?.name || 'Produce Farmer / FPO'}</h4>
                    <span className="text-xs text-slate-500">{order.seller?.email}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Role: <strong>{order.seller?.role === 'fpo' ? 'Farmer Producer Organisation' : 'Individual Farmer'}</strong></span>
                </div>
              </div>
            </div>

            {/* Phase 2 Placeholders: Logistics & Payments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
                <span className="text-2xl">🚚</span>
                <div>
                  <span className="font-bold text-blue-900 block">Logistics & Transportation</span>
                  <p className="text-blue-700 mt-0.5">
                    {order.deliveryStatusPlaceholder || 'Logistics booking and driver assignment will activate in Phase 2.'}
                  </p>
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
                <span className="text-2xl">💳</span>
                <div>
                  <span className="font-bold text-purple-900 block">Payment & Settlement</span>
                  <p className="text-purple-700 mt-0.5">
                    {order.paymentStatusPlaceholder || 'Direct digital settlement & UPI escrow integration will activate in Phase 2.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Transition Actions for Participants */}
            {transitionConfig && order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Order Management Controls
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Add an optional progress note..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl p-2.5 flex-1 outline-none focus:border-emerald-500"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(transitionConfig.next)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'Updating...' : `Advance: ${transitionConfig.label} →`}
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus('cancelled')}
                      className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default OrderDetails;
