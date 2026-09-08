import React from 'react';

/**
 * NetRealizationBreakdown
 * Visualizes the cost deductions between gross produce value and true net farmer realization.
 */
export const NetRealizationBreakdown = ({ realization, channelType = 'buyer', partnerName = '' }) => {
  if (!realization) return null;

  const {
    grossValue = 0,
    transportCost = 0,
    mandiCess = 0,
    handlingCost = 0,
    storageCost = 0,
    otherDeductions = 0,
    totalDeductions = 0,
    estimatedNetRealization = 0,
    netPerQuintal = 0,
    unitPrice = 0,
    effectiveMarginPercent = 0,
    distanceKm = 0,
    assumptions = [],
    disclaimer = '',
  } = realization;

  const isMandi = channelType === 'mandi';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Net Realization Model
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {partnerName ? `Cost Breakdown: ${partnerName}` : 'Estimated Produce Net Realization'}
            </h3>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Estimated Net Per Quintal</span>
            <span className="text-2xl font-black text-emerald-400">
              ₹{netPerQuintal?.toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal"> /q</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Visual Math Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Gross Value</span>
            <span className="text-base sm:text-lg font-bold text-slate-800">
              ₹{grossValue?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block">@ ₹{unitPrice}/q</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
            <span className="text-[10px] uppercase font-semibold text-rose-600 block">− Total Deductions</span>
            <span className="text-base sm:text-lg font-bold text-rose-700">
              ₹{totalDeductions?.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-rose-600/80 block">Freight, fees & handling</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
              = Estimated Net Realisation
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              ₹{estimatedNetRealization?.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 block">
              {effectiveMarginPercent}% effective retention
            </span>
          </div>
        </div>

        {/* Itemized Deductions List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Itemized Cost Structure
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {/* Transport */}
            <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50">
              <div>
                <span className="font-semibold text-slate-800">Transport & Haulage</span>
                <span className="text-slate-400 text-[11px] block">
                  {distanceKm > 0 ? `Estimated distance: ~${distanceKm} km` : 'Local farm-gate handover'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800">
                  {transportCost > 0 ? `₹${transportCost.toLocaleString('en-IN')}` : '₹0 (Buyer pickup)'}
                </span>
              </div>
            </div>

            {/* APMC Cess */}
            <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50">
              <div>
                <span className="font-semibold text-slate-800">Statutory Mandi Cess</span>
                <span className="text-slate-400 text-[11px] block">
                  {isMandi ? '1.5% statutory APMC market regulation cess' : 'Direct farm-gate buyer sale (0% APMC cess)'}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-bold ${mandiCess > 0 ? 'text-slate-800' : 'text-emerald-700 font-semibold'}`}>
                  {mandiCess > 0 ? `₹${mandiCess.toLocaleString('en-IN')}` : '₹0 Exempted'}
                </span>
              </div>
            </div>

            {/* Handling & Bagging */}
            <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50">
              <div>
                <span className="font-semibold text-slate-800">Handling, Weighing & Bagging</span>
                <span className="text-slate-400 text-[11px] block">
                  {isMandi ? 'APMC registered weighbridge & unloading fee' : 'Basic farm-gate packaging & dispatch'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800">
                  ₹{handlingCost?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Storage */}
            {storageCost > 0 && (
              <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-800">Temporary Warehousing / Holding</span>
                  <span className="text-slate-400 text-[11px] block">Cold storage or depot holding charge</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">₹{storageCost?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Custom/Other */}
            {otherDeductions > 0 && (
              <div className="flex items-center justify-between p-3 bg-white hover:bg-slate-50">
                <div>
                  <span className="font-semibold text-slate-800">Other Deductions</span>
                  <span className="text-slate-400 text-[11px] block">Declared toll/commission adjustments</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">₹{otherDeductions?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assumptions List */}
        {assumptions.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h5 className="text-[11px] uppercase font-bold text-slate-600 tracking-wider mb-2">
              Calculation Assumptions
            </h5>
            <ul className="space-y-1 text-xs text-slate-600">
              {assumptions.map((asm, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{asm}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Non-Guaranteed Advisory Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
          <span className="text-lg">ℹ️</span>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            <strong>Advisory Notice:</strong> {disclaimer || 'All figures are non-binding estimates based on prevailing market tariffs and stated target prices. Actual returns depend on final physical produce inspection, road conditions, and mutual agreement. Never treated as guaranteed profit.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetRealizationBreakdown;
