import { useState } from 'react';

/**
 * Responsive Pure-SVG Interactive Price Trend & Forecast Chart
 * Visualizes:
 * - Historical Modal Price line (solid emerald)
 * - Shaded historical min-max price corridor
 * - Short-horizon Forecast line (dashed amber)
 * - Shaded prediction uncertainty interval (amber tint)
 * - Arrival Volume bars (quintals)
 * - Interactive hover tooltips
 */
export const PriceTrendChart = ({
  historicalSeries = [],
  forecastSeries = [],
  unit = 'quintal',
  height = 320,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!historicalSeries || historicalSeries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-sm">
        No price trend data available for this selection.
      </div>
    );
  }

  // Combine chronological historical points with future forecast points
  const points = [];
  historicalSeries.forEach((h) => {
    points.push({
      date: h.date,
      displayDate: new Date(h.arrivalDate || h.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      modalPrice: h.modalPrice,
      minPrice: h.minPrice,
      maxPrice: h.maxPrice,
      arrivalQuantity: h.arrivalQuantity || 0,
      isEstimate: false,
      label: 'Historical',
    });
  });

  const lastHistorical = points[points.length - 1];

  // Append forecast points
  if (forecastSeries && forecastSeries.length > 0) {
    forecastSeries.forEach((f) => {
      points.push({
        date: f.date,
        displayDate: `${f.day} (${new Date(f.arrivalDate || f.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })})`,
        modalPrice: f.estimatedModalPrice,
        minPrice: f.estimatedMinPrice,
        maxPrice: f.estimatedMaxPrice,
        arrivalQuantity: 0,
        isEstimate: true,
        uncertaintyRange: f.uncertaintyRange,
        expectedDirection: f.expectedDirection,
        label: `Estimated ${f.day}`,
      });
    });
  }

  // Chart dimensions & margins
  const W = 780;
  const H = height;
  const margin = { top: 25, right: 30, bottom: 65, left: 55 };
  const priceChartHeight = H - margin.top - margin.bottom - 45; // upper area
  const arrivalChartHeight = 40; // lower area
  const arrivalChartTop = H - margin.bottom + 5;

  // Calculate Price domain (with 5% buffer)
  const allPrices = points.flatMap((p) => [p.modalPrice, p.minPrice, p.maxPrice]).filter((v) => v != null);
  const minPrice = Math.floor(Math.min(...allPrices) * 0.95);
  const maxPrice = Math.ceil(Math.max(...allPrices) * 1.05);
  const priceRange = maxPrice - minPrice || 1;

  // Calculate Arrival domain
  const maxArrival = Math.max(...points.map((p) => p.arrivalQuantity), 10);

  // Coordinate mappers
  const getX = (idx) => {
    const usableWidth = W - margin.left - margin.right;
    return margin.left + (idx / Math.max(points.length - 1, 1)) * usableWidth;
  };

  const getYPrice = (val) => {
    const clamped = Math.max(minPrice, Math.min(maxPrice, val));
    const normalized = (clamped - minPrice) / priceRange;
    return margin.top + (1 - normalized) * priceChartHeight;
  };

  const getYArrival = (val) => {
    const normalized = Math.min(1, Math.max(0, val / maxArrival));
    return arrivalChartTop + (1 - normalized) * arrivalChartHeight;
  };

  // Historical segment indices vs Forecast segment
  const histCount = historicalSeries.length;

  // Historical line points
  const histPoints = points.slice(0, histCount);
  const histPolylinePts = histPoints.map((p, i) => `${getX(i).toFixed(1)},${getYPrice(p.modalPrice).toFixed(1)}`).join(' ');

  // Forecast line points (bridges from last historical point)
  const forecastPointsWithBridge = points.slice(histCount - 1);
  const forecastPolylinePts = forecastPointsWithBridge
    .map((p, i) => `${getX(histCount - 1 + i).toFixed(1)},${getYPrice(p.modalPrice).toFixed(1)}`)
    .join(' ');

  // Historical Min-Max corridor polygon
  const histTopPts = histPoints.map((p, i) => `${getX(i).toFixed(1)},${getYPrice(p.maxPrice).toFixed(1)}`);
  const histBottomPts = histPoints
    .map((p, i) => `${getX(i).toFixed(1)},${getYPrice(p.minPrice).toFixed(1)}`)
    .reverse();
  const histCorridorPolygon = [...histTopPts, ...histBottomPts].join(' ');

  // Forecast Uncertainty Polygon
  const fTopPts = forecastPointsWithBridge.map((p, i) => `${getX(histCount - 1 + i).toFixed(1)},${getYPrice(p.maxPrice).toFixed(1)}`);
  const fBottomPts = forecastPointsWithBridge
    .map((p, i) => `${getX(histCount - 1 + i).toFixed(1)},${getYPrice(p.minPrice).toFixed(1)}`)
    .reverse();
  const forecastUncertaintyPolygon = [...fTopPts, ...fBottomPts].join(' ');

  // Y-axis grid tick values (4 steps)
  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => Math.round(minPrice + ratio * priceRange));

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: `${height}px` }}
      >
        <defs>
          {/* Historical corridor gradient */}
          <linearGradient id="histCorridorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
          </linearGradient>

          {/* Forecast uncertainty gradient */}
          <linearGradient id="forecastUncertaintyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
          </linearGradient>

          {/* Forecast divider pattern */}
          <pattern id="diagonalHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
          </pattern>
        </defs>

        {/* Y-axis price grid lines */}
        {yTicks.map((tick, i) => {
          const y = getYPrice(tick);
          return (
            <g key={i}>
              <line
                x1={margin.left}
                y1={y}
                x2={W - margin.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={margin.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono font-medium"
              >
                ₹{tick.toLocaleString('en-IN')}
              </text>
            </g>
          );
        })}

        {/* Forecast dividing vertical line */}
        {forecastSeries.length > 0 && histCount > 0 && (
          <g>
            <line
              x1={getX(histCount - 1)}
              y1={margin.top}
              x2={getX(histCount - 1)}
              y2={H - margin.bottom}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <rect
              x={getX(histCount - 1) + 4}
              y={margin.top + 2}
              width="74"
              height="18"
              rx="4"
              fill="#fef3c7"
              stroke="#fde68a"
            />
            <text
              x={getX(histCount - 1) + 41}
              y={margin.top + 14}
              textAnchor="middle"
              className="fill-amber-800 text-[9px] font-bold uppercase tracking-wider"
            >
              Estimated →
            </text>
          </g>
        )}

        {/* Historical Price Corridor */}
        {histCorridorPolygon && (
          <polygon points={histCorridorPolygon} fill="url(#histCorridorGrad)" />
        )}

        {/* Forecast Uncertainty Polygon */}
        {forecastSeries.length > 0 && forecastUncertaintyPolygon && (
          <polygon points={forecastUncertaintyPolygon} fill="url(#forecastUncertaintyGrad)" />
        )}

        {/* Historical Modal Price Polyline */}
        <polyline
          fill="none"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={histPolylinePts}
        />

        {/* Forecast Modal Price Polyline (Dashed Amber) */}
        {forecastSeries.length > 0 && (
          <polyline
            fill="none"
            stroke="#d97706"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={forecastPolylinePts}
          />
        )}

        {/* Arrival Volume Bars (Sub-chart) */}
        <line
          x1={margin.left}
          y1={arrivalChartTop + arrivalChartHeight}
          x2={W - margin.right}
          y2={arrivalChartTop + arrivalChartHeight}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <text
          x={margin.left - 8}
          y={arrivalChartTop + arrivalChartHeight / 2 + 4}
          textAnchor="end"
          className="fill-slate-400 text-[9px] font-mono"
        >
          Arrivals
        </text>

        {points.map((p, i) => {
          const x = getX(i);
          if (p.isEstimate || !p.arrivalQuantity) return null;
          const barHeight = Math.max(3, (p.arrivalQuantity / maxArrival) * arrivalChartHeight);
          const barY = arrivalChartTop + arrivalChartHeight - barHeight;
          const barWidth = Math.max(4, Math.min(16, (W / points.length) * 0.55));

          return (
            <rect
              key={`arr-${i}`}
              x={x - barWidth / 2}
              y={barY}
              width={barWidth}
              height={barHeight}
              rx="2"
              fill="#93c5fd"
              className="hover:fill-blue-500 transition-colors cursor-pointer opacity-80"
              onMouseEnter={() => setHoveredPoint({ ...p, x, y: barY })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}

        {/* Interactive Data Point Dots */}
        {points.map((p, i) => {
          const x = getX(i);
          const y = getYPrice(p.modalPrice);
          const isHovered = hoveredPoint?.date === p.date;

          return (
            <g
              key={`dot-${i}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint({ ...p, x, y })}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Invisible larger hover hit area */}
              <circle cx={x} cy={y} r="14" fill="transparent" />

              {/* Point graphic */}
              {p.isEstimate ? (
                // Forecast Point: Amber ring with diamond/pulsing visual
                <g>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? '7' : '5'}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? '11' : '8'}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    className="animate-pulse"
                  />
                </g>
              ) : (
                // Historical Point: Solid emerald circle
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '6' : '3.5'}
                  fill={isHovered ? '#047857' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? '2.5' : '1.5'}
                  className="transition-all"
                />
              )}
            </g>
          );
        })}

        {/* X-axis date labels */}
        {points.map((p, i) => {
          // Display selective date labels to avoid crowding
          const step = Math.max(1, Math.floor(points.length / 7));
          const isFirst = i === 0;
          const isLast = i === points.length - 1;
          const isSelected = i % step === 0 || p.isEstimate || isFirst || isLast;

          if (!isSelected) return null;
          const x = getX(i);

          return (
            <text
              key={`label-${i}`}
              x={x}
              y={H - 12}
              textAnchor="middle"
              className={`text-[9px] font-medium ${
                p.isEstimate ? 'fill-amber-700 font-bold' : 'fill-slate-500'
              }`}
            >
              {p.isEstimate ? (p.label.includes('Tomorrow') ? 'T+1' : 'T+2') : p.displayDate}
            </text>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-900/95 backdrop-blur-xs text-white text-xs rounded-xl px-3.5 py-2.5 shadow-xl border border-slate-700/60 min-w-[160px]"
          style={{
            left: `${(hoveredPoint.x / W) * 100}%`,
            top: `${Math.max(20, (hoveredPoint.y / H) * 100)}%`,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-1.5">
            <span className="font-semibold text-slate-200">{hoveredPoint.displayDate}</span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                hoveredPoint.isEstimate
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {hoveredPoint.isEstimate ? 'ESTIMATED' : 'HISTORICAL'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400">Modal Price:</span>
              <span className="font-bold text-white text-sm">
                ₹{hoveredPoint.modalPrice?.toLocaleString('en-IN')}/{unit}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4 text-[11px]">
              <span className="text-slate-400">Range:</span>
              <span className="text-slate-300">
                ₹{hoveredPoint.minPrice?.toLocaleString('en-IN')} – ₹{hoveredPoint.maxPrice?.toLocaleString('en-IN')}
              </span>
            </div>

            {hoveredPoint.isEstimate && hoveredPoint.uncertaintyRange && (
              <div className="flex justify-between items-center gap-4 text-[11px] pt-1 border-t border-slate-800 text-amber-300">
                <span>Uncertainty:</span>
                <span className="font-semibold">{hoveredPoint.uncertaintyRange}</span>
              </div>
            )}

            {!hoveredPoint.isEstimate && hoveredPoint.arrivalQuantity > 0 && (
              <div className="flex justify-between items-center gap-4 text-[11px] pt-1 border-t border-slate-800 text-blue-300">
                <span>Arrival Volume:</span>
                <span className="font-semibold">{hoveredPoint.arrivalQuantity} q</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 bg-emerald-600 rounded-full" />
          <span>Historical Modal Price</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2 bg-emerald-100 border border-emerald-300 rounded" />
          <span className="text-slate-500 text-[11px]">Min–Max Corridor</span>
        </div>
        {forecastSeries.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 border-b-2 border-dashed border-amber-500" />
              <span className="font-semibold text-amber-700">Estimated Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2 bg-amber-100 border border-amber-300 rounded" />
              <span className="text-amber-700 text-[11px]">90% Uncertainty Interval</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-300 rounded-xs" />
          <span className="text-slate-500 text-[11px]">Arrival Volume</span>
        </div>
      </div>
    </div>
  );
};

export default PriceTrendChart;
