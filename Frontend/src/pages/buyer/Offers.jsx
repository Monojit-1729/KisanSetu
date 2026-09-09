import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import offersApi from '../../api/offersApi.js';
import NegotiationHistory from '../../components/offers/NegotiationHistory.jsx';

export const BuyerOffers = () => {
  const { user, logout } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Counter drawer
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await offersApi.getMyOffers();
      setOffers(data.offers || data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch sent offers');
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
          `Counter accepted! Official Order #${res.order.orderId || res.order.id} generated.`
        );
      } else if (action === 'counter') {
        setSuccessBanner('Revised counter-offer sent to seller.');
      } else if (action === 'withdraw') {
        setSuccessBanner('Commercial proposal withdrawn.');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/buyer/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
                KS
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
                <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  Buyer Purchase Offers
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            <Link
              to="/buyer/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/buyer/orders"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              My Orders
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

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <Link
              to="/buyer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              to="/buyer/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              My Orders
            </Link>
            <Link
              to="/buyer/supply"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Browse Supply
            </Link>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Title Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mb-2">
                <span>💼</span> Procurement Negotiations
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                My Commercial Offers
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Track status of purchase offers submitted on farmer produce lots, review seller counter-proposals,
                and finalize contracts.
              </p>
            </div>

            <Link
              to="/buyer/orders"
              className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
            >
              View Confirmed Orders →
            </Link>
          </div>
        </div>

        {/* Banners */}
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {['all', 'pending', 'countered', 'accepted', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors capitalize cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-amber-600 text-white shadow-xs'
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
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold">Loading your sent offers...</span>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-2">
            <div className="text-4xl mb-2">🏷️</div>
            <h3 className="text-base font-bold text-slate-800">No {activeTab !== 'all' ? activeTab : ''} offers found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Find produce lots from verified farmers and submit purchase offers directly.
            </p>
            <Link
              to="/buyer/supply"
              className="inline-block mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Browse Farmer Supply →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => {
              const id = offer._id || offer.id;
              const isPending = offer.status === 'pending';
              const isCountered = offer.status === 'countered';
              const isAccepted = offer.status === 'accepted';
              const isBuyerTurn = isCountered && offer.lastActionRole !== 'buyer';

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-base">
                          {offer.cropName}
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
                        <span>Seller: <strong>{offer.seller?.name || 'Produce Farmer/FPO'}</strong></span>
                        <span>•</span>
                        <span>Date: {new Date(offer.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Offer Total</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900">
                        ₹{offer.totalOfferedValue?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-amber-700 font-semibold block">
                        ₹{offer.offeredPricePerUnit}/{offer.unit || 'q'} × {offer.quantity} {offer.unit || 'quintals'}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Buyer */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      {isPending && (
                        <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                          ⏳ Awaiting seller response or counter-offer
                        </span>
                      )}
                      {isBuyerTurn && (
                        <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                          Seller proposed a counter-offer. Your action needed.
                        </span>
                      )}
                      {isAccepted && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                            ✓ Offer Accepted — Order Confirmed
                          </span>
                          <Link
                            to="/buyer/orders"
                            className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors shadow-xs"
                          >
                            View Orders Desk →
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isBuyerTurn && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleRespond(id, 'accept')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {actionLoading ? '…' : '✓ Accept Counter & Create Order'}
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
                            🔄 Counter Again
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleRespond(id, 'reject')}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {isPending && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleRespond(id, 'withdraw')}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Withdraw Proposal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Counter Drawer */}
                  {counteringOfferId === id && (
                    <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-3 animate-in fade-in">
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Submit Revised Counter Proposal
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Your Revised Price (₹/{offer.unit || 'q'})
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
                            Revision Note (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Can meet midway at ₹X if delivery is expedited."
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
                          Send Revised Counter →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Negotiation History */}
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

export default BuyerOffers;
