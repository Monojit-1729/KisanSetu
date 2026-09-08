import React from 'react';

/**
 * ScoreExplanation
 * Exposes the multi-factor decision factors behind an opportunity's 1-100 score.
 */
export const ScoreExplanation = ({ scoreBreakdown = {}, overallScore = 0, reasons = [] }) => {
  const factors = [
    {
      key: 'netRealization',
      label: 'Net Realization',
      weight: '35%',
      score: scoreBreakdown?.netRealization?.score ?? scoreBreakdown?.netScore ?? 0,
      description: 'Comparative net profit return vs APMC benchmark',
    },
    {
      key: 'qualityFit',
      label: 'Quality & Grade Fit',
      weight: '20%',
      score: scoreBreakdown?.qualityFit?.score ?? scoreBreakdown?.gradeScore ?? 0,
      description: 'Compatibility with buyer produce grade criteria',
    },
    {
      key: 'demandStrength',
      label: 'Demand & Volume Match',
      weight: '15%',
      score: scoreBreakdown?.demandStrength?.score ?? scoreBreakdown?.coverageScore ?? 0,
      description: 'Placement capacity for the entire lot quantity',
    },
    {
      key: 'logistics',
      label: 'Logistics & Distance',
      weight: '15%',
      score: scoreBreakdown?.logistics?.score ?? scoreBreakdown?.distanceScore ?? 0,
      description: 'Proximity impact on transit time and freight risk',
    },
    {
      key: 'trust',
      label: 'Trust & Verification',
      weight: '10%',
      score: scoreBreakdown?.trust?.score ?? scoreBreakdown?.trustScore ?? 0,
      description: 'Buyer verification tier or statutory APMC regulation',
    },
    {
      key: 'timing',
      label: 'Timing & Delivery Window',
      weight: '5%',
      score: scoreBreakdown?.timing?.score ?? scoreBreakdown?.timingScore ?? 0,
      description: 'Readiness alignment with procurement delivery schedule',
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-500 text-emerald-700';
    if (score >= 60) return 'bg-blue-500 text-blue-700';
    if (score >= 45) return 'bg-amber-500 text-amber-700';
    return 'bg-rose-500 text-rose-700';
  };

  const getBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (score >= 60) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (score >= 45) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const finalReasons = reasons?.length > 0 ? reasons : scoreBreakdown?.reasons || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header with Overall Score Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
            Algorithmic Decision Support
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Why This Option Is Ranked High
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic weighted evaluation across 6 commercial and operational dimensions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Opportunity Fit</span>
            <span className="text-xs font-bold text-slate-700">Combined Score</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
            {overallScore}
          </div>
        </div>
      </div>

      {/* Plain-Language Key Reasons */}
      {finalReasons.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <span>✨</span> Key Value Factors
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {finalReasons.map((reason, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-slate-800"
              >
                <span className="text-emerald-700 font-black mt-0.5">✓</span>
                <span className="leading-snug">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factor Progress Bars */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Detailed Dimension Breakdown
        </h4>
        <div className="space-y-3.5">
          {factors.map((factor) => (
            <div key={factor.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{factor.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({factor.weight} weight)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeColor(factor.score)}`}>
                  {factor.score}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(factor.score).split(' ')[0]}`}
                  style={{ width: `${Math.max(4, Math.min(100, factor.score))}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreExplanation;
