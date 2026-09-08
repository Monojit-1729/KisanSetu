import React, { useState } from 'react';
import offersApi from '../../api/offersApi.js';

export const MakeOfferModal = ({ lot, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !lot) return null;

  const availableQty = lot.quantity || 0;
  const askingPrice = lot.pricePerQuintal || 0;

  const [quantity, setQuantity] = useState(availableQty);
  const [offeredPrice, setOfferedPrice] = useState(askingPrice);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const numQty = Number(quantity) || 0;
  const numPrice = Number(offeredPrice) || 0;
  const totalValue = Number((numQty * numPrice).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (numQty <= 0) {
      setError('Please specify a positive quantity.');
      return;
    }
    if (numQty > availableQty) {
      setError(`Quantity cannot exceed available lot quantity (${availableQty} ${lot.unit}).`);
      return;
    }
    if (numPrice <= 0) {
      setError('Please specify a valid offered price per unit.');
      return;
    }

    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await offersApi.createOffer({
        lotId: lot.id || lot._id,
        quantity: numQty,
        offeredPricePerUnit: numPrice,
        message,
      });

      if (onSuccess) {
        onSuccess(res.offer || res.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit commercial offer');
      setConfirmed(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-base">💼</span>
              <h3 className="text-lg font-bold text-white">Make Commercial Purchase Offer</h3>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-slate-400 hover:text-white text-xl leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Submit a binding commercial proposal to purchase produce from this active listing.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Lot Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Target Produce:</span>
              <span className="font-bold text-slate-900">
                {lot.cropName} {lot.variety ? `(${lot.variety})` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Available Quantity:</span>
              <span className="font-bold text-slate-900">{availableQty} {lot.unit || 'quintal'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Asking Price:</span>
              <span className="font-bold text-emerald-700">₹{askingPrice?.toLocaleString('en-IN')}/{lot.unit || 'q'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Farm Origin:</span>
              <span className="text-slate-700">{lot.location?.district}, {lot.location?.state}</span>
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Offer Quantity ({lot.unit || 'q'})
              </label>
              <input
                type="number"
                min="1"
                max={availableQty}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setConfirmed(false);
                }}
                required
                className="w-full text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Max available: {availableQty}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price Per Unit (₹)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={offeredPrice}
                onChange={(e) => {
                  setOfferedPrice(e.target.value);
                  setConfirmed(false);
                }}
                required
                className="w-full text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Asking: ₹{askingPrice}</span>
            </div>
          </div>

          {/* Message / Delivery Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Procurement Note / Terms (Optional)
            </label>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Seeking immediate farm-gate pickup this Friday, standard grading."
              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-xl p-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
            />
          </div>

          {/* Total Value Computation Strip */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Total Offer Value</span>
              <span className="text-xs text-amber-700 font-medium">
                {numQty} {lot.unit || 'q'} × ₹{numPrice}/unit
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-950">
                ₹{totalValue?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Confirmation Notice if in stage 2 */}
          {confirmed && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
              <span className="font-bold block mb-0.5">Please Confirm:</span>
              You are proposing to purchase <strong>{numQty} {lot.unit || 'quintals'}</strong> of {lot.cropName} at <strong>₹{numPrice}/{lot.unit || 'q'}</strong> for a total commitment of <strong>₹{totalValue?.toLocaleString('en-IN')}</strong>. The seller will be notified.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || numQty <= 0 || numPrice <= 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                confirmed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {submitting
                ? 'Submitting Offer...'
                : confirmed
                ? 'Confirm & Send Offer ✓'
                : 'Review & Send Offer →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakeOfferModal;
