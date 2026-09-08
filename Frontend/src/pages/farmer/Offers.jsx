import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import offersApi from '../../api/offersApi.js';
import NegotiationHistory from '../../components/offers/NegotiationHistory.jsx';

export const FarmerOffers = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, countered, accepted, rejected

  // Counter drawer state
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const fetchOffers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await offersApi.getMyOffers();
      setOffers(data.offers || data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch incoming offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleRespond = async (offerId, action, extra = {}) => {
    setActionLoading(true);
    setError('');
    setSuccessBanner('');
    setCreatedOrder(null);
    try {
      const res = await offersApi.respondToOffer(offerId, {
        action,
        ...extra,
      });

      if (action === 'accept' && res.order) {
        setCreatedOrder(res.order);
        setSuccessBanner(
          `Offer accepted! Order #${res.order.orderId || res.order.id} has been automatically generated.`
        );
      } else if (action === 'counter') {
        setSuccessBanner('Counter-offer submitted to buyer successfully.');
      } else if (action === 'reject') {
        setSuccessBanner('Offer declined.');
      }

      setCounteringOfferId(null);
      setCounterPrice('');
      setCounterMessage('');
      fetchOffers();
    } catch (err) {
      setError(err.message || `Failed to ${action} offer`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const isFpo = user?.role === 'fpo';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={isFpo ? '/fpo/dashboard' : '/farmer/dashboard'} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                KS
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  {isFpo ? 'FPO Offers Hub' : 'Farmer Offers Hub'}
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-1 shrink-0">
            <Link
              to={isFpo ? '/fpo/dashboard' : '/farmer/dashboard'}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              Dashboard
            </Link>
            <Link
              to={isFpo ? '/fpo/orders' : '/farmer/orders'}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              My Orders
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
                <span>💼</span> Commercial Offers Management
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Incoming Purchase Proposals
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Review commercial purchase proposals from verified buyers, negotiate price per unit,
                or accept to generate an official purchase contract.
              </p>
            </div>

            <Link
              to={isFpo ? '/fpo/orders' : '/farmer/orders'}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
            >
              View Confirmed Orders →
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {successBanner && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs p-4 rounded-2xl font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3 flex-wrap">
              <span>✓ {successBanner}</span>
              {createdOrder && (
                <Link
                  to={`/orders/${createdOrder.orderId || createdOrder.id || createdOrder._id}`}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Inspect Order →
                </Link>
              )}
            </div>
            <button
              onClick={() => {
                setSuccessBanner('');
                setCreatedOrder(null);
              }}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-3 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-4 rounded-2xl font-semibold flex items-center justify-between shadow-xs">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900 font-bold ml-3">
              ✕
            </button>
          </div>
        )}

        {/* Tabs Filter Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {['all', 'pending', 'countered', 'accepted', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors capitalize cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab} ({offers.filter((o) => (tab === 'all' ? true : o.status === tab)).length})
            </button>
          ))}
        </div>

        {/* Offers List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold">Loading commercial offers...</span>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-2">
            <div className="text-4xl mb-2">📬</div>
            <h3 className="text-base font-bold text-slate-800">No {activeTab !== 'all' ? activeTab : ''} offers found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Commercial purchase offers submitted by interested buyers will appear here with price and terms.
            </p>
            <div className="pt-3">
              <Link
                to="/marketplace/my-lots"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200"
              >
                View Active Produce Lots →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => {
              const id = offer._id || offer.id;
              const isPending = offer.status === 'pending';
              const isCountered = offer.status === 'countered';
              const isAccepted = offer.status === 'accepted';
              const isMyTurn =
                (isPending && offer.lastActionRole === 'buyer') ||
                (isCountered && offer.lastActionRole === 'buyer');

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-base">
                          {offer.cropName} Produce Lot
                        </span>
                        <span className="text-xs text-slate-400">({offer.offerId})</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : isPending
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : isCountered
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Buyer: <strong>{offer.buyer?.name || 'Commercial Buyer'}</strong></span>
                        <span>•</span>
                        <span>Date: {new Date(offer.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Commitment</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900">
                        ₹{offer.totalOfferedValue?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-emerald-700 font-semibold block">
                        ₹{offer.offeredPricePerUnit}/{offer.unit || 'q'} × {offer.quantity} {offer.unit || 'quintals'}
                      </span>
                    </div>
                  </div>

                  {/* Message if present */}
                  {offer.message && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-0.5">Buyer Note:</span>
                      "{offer.message}"
                    </div>
                  )}

                  {/* Accepted Contract Link */}
                  {offer.status === 'accepted' && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold">✓ Official Purchase Order Generated</span>
                        <span className="text-slate-500">· Fulfillment in progress</span>
                      </div>
                      <Link
                        to={isFpo ? '/fpo/orders' : '/farmer/orders'}
                        className="text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
                      >
                        View in Orders Desk →
                      </Link>
                    </div>
                  )}

                  {/* Action Controls for Farmer/FPO */}
                  {isMyTurn && (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-emerald-900">
                        {isPending
                          ? 'Commercial proposal received. Choose to accept, counter, or decline.'
                          : 'Buyer submitted a counter-offer. Your turn to respond.'}
                      </span>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleRespond(id, 'accept')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {actionLoading ? '…' : '✓ Accept & Create Order'}
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => {
                            setCounteringOfferId(counteringOfferId === id ? null : id);
                            setCounterPrice(offer.offeredPricePerUnit);
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          🔄 Counter Offer
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleRespond(id, 'reject')}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Counter Proposal Drawer */}
                  {counteringOfferId === id && (
                    <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-3 animate-in fade-in">
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Propose Counter Terms
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Your Counter Price (₹/{offer.unit || 'q'})
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={counterPrice}
                            onChange={(e) => setCounterPrice(e.target.value)}
                            className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Counter Note (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Asking price reflecting premium moisture grade."
                            value={counterMessage}
                            onChange={(e) => setCounterMessage(e.target.value)}
                            className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setCounteringOfferId(null)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading || !counterPrice || Number(counterPrice) <= 0}
                          onClick={() =>
                            handleRespond(id, 'counter', {
                              counterPrice: Number(counterPrice),
                              message: counterMessage,
                            })
                          }
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Send Counter to Buyer →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Negotiation Audit History */}
                  {offer.history?.length > 1 && (
                    <NegotiationHistory history={offer.history} unit={offer.unit} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerOffers;
