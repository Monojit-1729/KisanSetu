import React from 'react';

const STAGES = [
  { id: 'confirmed', label: 'Order Confirmed', description: 'Offer accepted & contract initiated' },
  { id: 'processing', label: 'Processing & Packaging', description: 'Farm-gate grading & packing' },
  { id: 'ready_for_dispatch', label: 'Ready for Dispatch', description: 'Produce assembled for transport' },
  { id: 'in_transit', label: 'In Transit', description: 'Vehicular haulage on the road' },
  { id: 'delivered', label: 'Delivered', description: 'Arrived at delivery location' },
  { id: 'completed', label: 'Completed', description: 'Quality accepted & transaction closed' },
];

export const OrderTimeline = ({ currentStatus = 'confirmed', timeline = [] }) => {
  const isCancelled = currentStatus === 'cancelled';

  const currentIdx = STAGES.findIndex((s) => s.id === currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
            Transaction Lifecycle
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">Order Fulfillment Stage</h3>
        </div>

        {isCancelled ? (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            Order Cancelled
          </span>
        ) : (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
            {currentStatus.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {!isCancelled && (
        <div className="relative">
          {/* Progress Bar Line */}
          <div className="hidden sm:block absolute top-4 left-0 right-0 h-1 bg-slate-100 -z-0">
            <div
              className="h-1 bg-emerald-500 transition-all duration-500"
              style={{
                width: `${(Math.max(0, currentIdx) / (STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={stage.id} className="text-center sm:text-center flex flex-col items-center space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all z-1 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>

                  <span
                    className={`text-xs font-semibold leading-tight block ${
                      isCurrent
                        ? 'text-emerald-800 font-bold'
                        : isPast
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:block leading-tight">
                    {stage.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Timeline Log */}
      {timeline.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Activity Log
          </h4>
          <div className="space-y-2">
            {timeline.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between text-xs bg-slate-50 border border-slate-100 rounded-xl p-3"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 capitalize block">
                    {entry.status.replace(/_/g, ' ')}
                  </span>
                  <p className="text-slate-600 text-[11px]">{entry.note}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-3">
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
