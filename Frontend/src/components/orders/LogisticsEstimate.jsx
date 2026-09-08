import React, { useState } from 'react';
import logisticsApi from '../../api/logisticsApi.js';

const STATUS_BADGES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

const NEXT_TRANSITIONS = {
  pending: { next: 'scheduled', label: 'Schedule Dispatch' },
  scheduled: { next: 'picked_up', label: 'Confirm Produce Picked Up' },
  picked_up: { next: 'in_transit', label: 'Mark In Transit' },
  in_transit: { next: 'delivered', label: 'Confirm Delivery at Destination' },
};

export const LogisticsEstimate = ({
  logistics,
  orderId,
  isParticipant = true,
  onStatusUpdated = () => {},
}) => {
  const [updating, setUpdating] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [error, setError] = useState('');

  if (!logistics) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-2">
        <span className="text-2xl block">🚚</span>
        <h4 className="font-bold text-slate-800 text-sm">No Logistics Record Found</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No transport coordination has been initiated for this order consignment yet.
        </p>
      </div>
    );
  }

  const handleAdvanceStatus = async (targetStatus) => {
    if (!window.confirm(`Advance logistics milestone to '${targetStatus.replace(/_/g, ' ')}'?`)) return;
    setUpdating(true);
    setError('');
    try {
      await logisticsApi.updateStatus(logistics.id || logistics._id, {
        status: targetStatus,
        note: noteInput || `Logistics status updated to ${targetStatus.replace(/_/g, ' ')}`,
      });
      setNoteInput('');
      onStatusUpdated();
    } catch (err) {
      setError(err.message || 'Failed to advance logistics status');
    } finally {
      setUpdating(false);
    }
  };

  const currentTransition = NEXT_TRANSITIONS[logistics.status];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">🚚</span>
            <h3 className="font-bold text-slate-900 text-base">Logistics Coordination</h3>
            <span className="text-xs text-slate-400 font-mono">({logistics.logisticsId})</span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                STATUS_BADGES[logistics.status] || STATUS_BADGES.pending
              }`}
            >
              {logistics.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated farm-to-hub produce transit and vehicular dispatch tracking.
          </p>
        </div>

        <div className="text-left sm:text-right bg-blue-50/70 border border-blue-200 px-4 py-2.5 rounded-xl shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
            Estimated Transport Cost
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-950">
            ₹{logistics.estimatedCost?.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-blue-700 font-medium block">
            ₹15/q loading + ₹0.40/q/km
          </span>
        </div>
      </div>

      {/* Transit Route Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispatch Origin</span>
          <div className="font-bold text-slate-800 text-xs truncate">
            {logistics.origin?.district ? `${logistics.origin.district}, ${logistics.origin.state}` : 'Farm-gate Origin'}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {logistics.origin?.village || logistics.origin?.address || 'Producer Village Depot'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Destination</span>
          <div className="font-bold text-slate-800 text-xs truncate">
            {logistics.destination?.district ? `${logistics.destination.district}, ${logistics.destination.state}` : 'Buyer Facility'}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {logistics.destination?.address || 'Buyer Warehouse / Processing Hub'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Haulage Metrics</span>
          <div className="font-bold text-slate-800 text-xs">
            {logistics.distanceKm} km · {logistics.vehicleType}
          </div>
          <p className="text-[11px] text-slate-500">
            Payload: {logistics.capacityQuintals} quintal capacity
          </p>
        </div>
      </div>

      {/* Dates row */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 gap-2">
        <div>
          <span className="text-slate-400">Scheduled Pickup: </span>
          <strong>{logistics.pickupDate ? new Date(logistics.pickupDate).toLocaleDateString('en-IN') : 'TBD'}</strong>
        </div>
        <div>
          <span className="text-slate-400">Target Delivery: </span>
          <strong>{logistics.expectedDeliveryDate ? new Date(logistics.expectedDeliveryDate).toLocaleDateString('en-IN') : 'TBD'}</strong>
        </div>
        {logistics.actualDeliveryDate && (
          <div>
            <span className="text-slate-400">Actual Delivered: </span>
            <strong className="text-emerald-700">{new Date(logistics.actualDeliveryDate).toLocaleDateString('en-IN')}</strong>
          </div>
        )}
      </div>

      {/* Prototype Advisory Banner */}
      <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-3 text-[11px] text-blue-800 flex items-start gap-2">
        <span className="text-sm">ℹ️</span>
        <p className="leading-relaxed">
          <strong>Logistics Estimation Model:</strong> All transport costs and distances are calculated deterministically
          based on Maharashtra inter-district road routing and standardized mandi loading rates. Live telematics and transport provider booking will activate in Phase 2.
        </p>
      </div>

      {/* Advance Status Controls for Authorized Participants */}
      {isParticipant && currentTransition && logistics.status !== 'delivered' && logistics.status !== 'cancelled' && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Add optional carrier/dispatch update note..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl p-2.5 flex-1 outline-none focus:border-blue-500 w-full"
            />
            <button
              type="button"
              disabled={updating}
              onClick={() => handleAdvanceStatus(currentTransition.next)}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {updating ? 'Updating...' : `${currentTransition.label} →`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsEstimate;
