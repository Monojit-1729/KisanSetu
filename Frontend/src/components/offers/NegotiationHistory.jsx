import React from 'react';

const ACTION_CONFIG = {
  created: { label: 'Initial Offer Submitted', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📝' },
  countered: { label: 'Counter-Offer Proposed', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🔄' },
  accepted: { label: 'Offer Accepted — Order Created', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '✅' },
  rejected: { label: 'Offer Declined', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: '❌' },
  withdrawn: { label: 'Offer Withdrawn by Sender', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '⏸️' },
};

export const NegotiationHistory = ({ history = [], unit = 'quintal' }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>📜</span> Negotiation Audit Trail
        </h4>
        <span className="text-[10px] font-semibold text-slate-400">
          {history.length} event{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:z-0">
        {history.map((step, idx) => {
          const config = ACTION_CONFIG[step.action] || ACTION_CONFIG.countered;
          const isLatest = idx === history.length - 1;

          return (
            <div key={idx} className="relative z-1 flex items-start gap-3 text-xs">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border shadow-2xs ${
                  isLatest ? 'bg-white ring-2 ring-emerald-500' : 'bg-slate-100'
                }`}
              >
                <span className="text-xs">{config.icon}</span>
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{step.byName || 'Participant'}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                      {step.byRole}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {step.timestamp ? new Date(step.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : ''}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-700 font-medium pt-1">
                  <span>
                    Price: <strong className="text-emerald-700">₹{step.price}/{unit || 'q'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Quantity: <strong>{step.quantity} {unit || 'q'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Total: <strong>₹{step.totalValue?.toLocaleString('en-IN')}</strong>
                  </span>
                </div>

                {step.message && (
                  <p className="text-[11px] text-slate-500 italic pt-0.5 bg-slate-50/80 rounded-md p-2 border border-slate-100">
                    "{step.message}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NegotiationHistory;
