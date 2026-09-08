import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import ordersApi from '../../api/ordersApi.js';
import logisticsApi from '../../api/logisticsApi.js';
import paymentsApi from '../../api/paymentsApi.js';
import OrderTimeline from '../../components/orders/OrderTimeline.jsx';
import LogisticsEstimate from '../../components/orders/LogisticsEstimate.jsx';
import PaymentStatus from '../../components/orders/PaymentStatus.jsx';

const STATUS_TRANSITIONS = {
  confirmed: { next: 'processing', label: 'Mark as Processing / Packing' },
  processing: { next: 'ready_for_dispatch', label: 'Mark as Ready for Dispatch' },
  ready_for_dispatch: { next: 'in_transit', label: 'Mark as In Transit' },
  in_transit: { next: 'delivered', label: 'Confirm Delivered' },
  delivered: { next: 'completed', label: 'Complete Order & Close Contract' },
};

const QUALITY_STATUS_STYLES = {
  verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Verified Quality' },
  declared: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Farmer Declared' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Inspection Pending' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Quality Rejected' },
};

export const OrderDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.getOrderById(id);
      const fetchedOrder = data.order || data.data || data;
      setOrder(fetchedOrder);

      // Populate logistics & payment from response or fetch directly
      if (fetchedOrder.logistics && typeof fetchedOrder.logistics === 'object') {
        setLogistics(fetchedOrder.logistics);
      } else {
        try {
          const logRes = await logisticsApi.getByOrderId(id);
          setLogistics(logRes.data || logRes);
        } catch (lErr) {
          console.warn('[OrderDetails] Could not fetch logistics:', lErr.message);
        }
      }

      if (fetchedOrder.payment && typeof fetchedOrder.payment === 'object') {
        setPayment(fetchedOrder.payment);
      } else {
        try {
          const payRes = await paymentsApi.getByOrderId(id);
          setPayment(payRes.data || payRes);
        } catch (pErr) {
          console.warn('[OrderDetails] Could not fetch payment:', pErr.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleLogisticsUpdated = (updated) => {
    setLogistics(updated);
    fetchOrder();
  };

  const handlePaymentUpdated = (updated) => {
    setPayment(updated);
    fetchOrder();
  };

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

          <nav className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-1 shrink-0">
            <Link
              to={dashboardLink}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <Link
              to={ordersListLink}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              All Orders
            </Link>
            <Link
              to={isBuyer ? '/buyer/offers' : '/farmer/offers'}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Offers Desk
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

            {/* Produce Quality & Specifications Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Quality & Produce Specifications</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {order.cropName} {order.variety ? `(${order.variety})` : ''} — Grade {order.grade || 'A'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    Grade {order.grade || 'A'}
                  </span>
                  {(() => {
                    const qStatus = order.qualityStatus || 'declared';
                    const style = QUALITY_STATUS_STYLES[qStatus] || QUALITY_STATUS_STYLES.declared;
                    return (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        {style.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Quantity Contracted</span>
                  <span className="font-bold text-slate-800">{order.quantity} {order.unit || 'quintals'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Quality Assessment</span>
                  <span className="font-bold text-slate-800 capitalize">{order.qualityStatus || 'declared'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Verification Reference</span>
                  <span className="font-mono text-slate-700 font-medium">{order.qualityRef || 'Self-declared by producer'}</span>
                </div>
              </div>

              {order.qualityNotes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-0.5">Quality Assessment Notes:</span>
                  <p className="leading-relaxed">{order.qualityNotes}</p>
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic">
                * Note: Grade and quality parameters are captured from the seller lot declaration. Physical batch inspection is advised prior to final settlement.
              </p>
            </div>

            {/* Operational Logistics & Payment Systems */}
            <div className="grid grid-cols-1 gap-6">
              <LogisticsEstimate
                logistics={logistics}
                orderId={order._id || order.id}
                isParticipant={isBuyer || isSeller}
                onStatusUpdated={handleLogisticsUpdated}
              />

              <PaymentStatus
                payment={payment}
                orderId={order._id || order.id}
                isParticipant={isBuyer || isSeller}
                onStatusUpdated={handlePaymentUpdated}
              />
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
