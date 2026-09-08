import React, { useState } from 'react';
import NetRealizationBreakdown from './NetRealizationBreakdown.jsx';

/**
 * OpportunityCard
 * Renders a single sales opportunity with net realization, fit score, and optional detailed drawer.
 */
export const OpportunityCard = ({
  opportunity,
  isTopRecommended = false,
  rank = 1,
  onSelect,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!opportunity) return null;

  const {
    channelType = 'buyer',
    partnerName = 'Market Partner',
    destinationLocation = 'Local Area',
    unitPrice = 0,
    estimatedNetRealization = 0,
    netPerQuintal = 0,
    overallScore = 0,
    reasons = [],
    realization = null,
    buyerMetadata = null,
    marketMetadata = null,
  } = opportunity;

  const isMandi = channelType === 'mandi';

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isTopRecommended
          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
      }`}
    >
      {/* Top Highlight Banner if #1 Recommended */}
      {isTopRecommended && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-t-xl flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>⭐</span> TOP RECOMMENDED SALES OPPORTUNITY
          </span>
          <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
            Rank #{rank}
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Partner & Channel Info */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {!isTopRecommended && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  #{rank}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {partnerName}
              </h3>

              {isMandi ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  APMC Mandi Auction
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                  Direct Buyer Sale
                </span>
              )}

              {buyerMetadata?.isVerified && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span>✓</span> Verified Buyer
                </span>
              )}

              {isMandi && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Regulated Market
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>📍 Destination: <strong>{destinationLocation}</strong></span>
              {realization?.distanceKm > 0 && (
                <span>🛣️ Distance: <strong>~{realization.distanceKm} km</strong></span>
              )}
              {marketMetadata?.freshnessNotice && (
                <span className="text-slate-400">📅 {marketMetadata.freshnessNotice}</span>
              )}
            </div>

            {reasons?.length > 0 && (
              <p className="text-xs text-slate-600 italic line-clamp-1 pt-1">
                "{reasons[0]}"
              </p>
            )}
          </div>

          {/* Economics & Score Grid */}
          <div className="flex items-center gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
            {/* Net Realization Highlight */}
            <div className="text-left lg:text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Estimated Net Return
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                ₹{netPerQuintal?.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500">/q</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Total: ₹{estimatedNetRealization?.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Score Badge */}
            <div className="text-center pl-2 border-l border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Fit Score</span>
              <div
                className={`w-11 h-11 rounded-xl text-white font-black text-lg flex items-center justify-center shadow-xs mx-auto ${
                  overallScore >= 80
                    ? 'bg-emerald-600'
                    : overallScore >= 60
                    ? 'bg-blue-600'
                    : 'bg-amber-600'
                }`}
              >
                {overallScore}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {showDetails ? 'Hide Details ▲' : 'View Costs ▼'}
              </button>
              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(opportunity)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  Choose
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Cost Structure Drawer */}
        {showDetails && realization && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <NetRealizationBreakdown
              realization={realization}
              channelType={channelType}
              partnerName={partnerName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
