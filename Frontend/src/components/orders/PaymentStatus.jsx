import React, { useState } from 'react';
import paymentsApi from '../../api/paymentsApi.js';

const STATUS_BADGES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  refunded: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const PaymentStatus = ({
  payment,
  orderId,
  isParticipant = true,
  onStatusUpdated = () => {},
}) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [noteInput, setNoteInput] = useState('');

  if (!payment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-2">
        <span className="text-2xl block">💳</span>
        <h4 className="font-bold text-slate-800 text-sm">No Payment Record Initialized</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Payment settlement tracking has not been created for this order yet.
        </p>
      </div>
    );
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Update simulated payment status to '${newStatus}'?`)) return;
    setUpdating(true);
    setError('');
    try {
      await paymentsApi.updateStatus(payment.id || payment._id, {
        status: newStatus,
        note: noteInput || `Payment status transitioned to ${newStatus}`,
      });
      setNoteInput('');
      onStatusUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">💳</span>
            <h3 className="font-bold text-slate-900 text-base">Payment & Settlement Status</h3>
            <span className="text-xs text-slate-400 font-mono">({payment.paymentId})</span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                STATUS_BADGES[payment.status] || STATUS_BADGES.pending
              }`}
            >
              {payment.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contract settlement ledger and buyer-to-farmer direct escrow simulation.
          </p>
        </div>

        <div className="text-left sm:text-right bg-purple-50/70 border border-purple-200 px-4 py-2.5 rounded-xl shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
            Settlement Amount
          </span>
          <div className="text-xl sm:text-2xl font-black text-purple-950">
            ₹{payment.amount?.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-purple-700 font-semibold block">
            Contract Value (INR)
          </span>
        </div>
      </div>

      {/* Payment Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Settlement Channel</span>
          <div className="font-bold text-slate-800 text-xs truncate">
            {payment.methodPlaceholder || 'Direct Bank Transfer / Escrow'}
          </div>
          <p className="text-[11px] text-slate-500">Simulated Digital Clearing</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Transaction Reference</span>
          <div className="font-bold text-slate-800 text-xs font-mono truncate">
            {payment.transactionRefPlaceholder || 'Pending Authorization'}
          </div>
          <p className="text-[11px] text-slate-500">Ledger Verification ID</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Settlement Timestamp</span>
          <div className="font-bold text-slate-800 text-xs">
            {payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-IN') : 'Awaiting Settlement'}
          </div>
          <p className="text-[11px] text-slate-500">
            {payment.paidAt ? 'Funds released' : 'Condition: Delivery acceptance'}
          </p>
        </div>
      </div>

      {/* Prototype Advisory Disclaimer Banner */}
      <div className="bg-purple-50/50 border border-purple-200/60 rounded-xl p-3 text-[11px] text-purple-900 flex items-start gap-2">
        <span className="text-sm">⚠️</span>
        <p className="leading-relaxed">
          <strong>Simulated Payment Status:</strong> This interface tracks settlement workflow milestones for prototype evaluation.
          No live banking debit or real monetary deduction has occurred. Real automated UPI escrow and payment gateways will activate in Phase 2.
        </p>
      </div>

      {/* Milestone Control Actions */}
      {isParticipant && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {payment.status === 'pending' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('processing')}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Simulate Buyer Payment Initiation →'}
              </button>
            )}

            {payment.status === 'processing' && (
              <>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('completed')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Updating...' : '✓ Confirm Settlement Release to Seller'}
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('failed')}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Simulate Payment Failure
                </button>
              </>
            )}

            {payment.status === 'failed' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('pending')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Retry Settlement Workflow
              </button>
            )}

            {payment.status === 'completed' && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <span>✓</span> Payment Settled (Simulated)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
