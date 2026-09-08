import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import marketsApi from '../../api/marketsApi.js';

// Simple inline SVG sparkline — no library dependencies
const Sparkline = ({ data, width = 120, height = 40 }) => {
  if (!data || data.length < 2) {
    return <span className="text-[10px] text-slate-400">No trend data</span>;
  }
  const prices = data.map((d) => d.modalPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const pts = prices
    .slice(-14) // last 14 points
    .map((p, i, arr) => {
      const x = (i / (arr.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const isUp = lastPrice >= firstPrice;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={isUp ? '#10b981' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
};

const DISTRICTS = ['Nashik', 'Pune', 'Solapur', 'Aurangabad', 'Kolhapur'];

export const MarketIntelligence = () => {
  const { user, logout } = useAuth();

  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [availableCrops, setAvailableCrops] = useState([]);

  const [latestPrices, setLatestPrices] = useState([]); // Latest per crop in district
  const [timeSeries, setTimeSeries] = useState([]); // Time-series for selected crop
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [loadingTs, setLoadingTs] = useState(false);
  const [error, setError] = useState('');

  // Fetch metadata crops list
  useEffect(() => {
    marketsApi.getDistinctCrops().then((d) => setAvailableCrops(d.crops || [])).catch(() => {});
  }, []);

  // Fetch latest prices per crop for selected district
  const fetchLatest = useCallback(async () => {
    if (!selectedDistrict) return;
    setLoadingLatest(true);
    setError('');
    try {
      const data = await marketsApi.getLatestByDistrict(selectedDistrict);
      setLatestPrices(data.prices || []);
    } catch (err) {
      setError(err.message || 'Failed to load market prices');
    } finally {
      setLoadingLatest(false);
    }
  }, [selectedDistrict]);

  useEffect(() => { fetchLatest(); }, [fetchLatest]);

  // Fetch time-series when crop selected
  const fetchTimeSeries = useCallback(async () => {
    if (!selectedCrop || !selectedDistrict) { setTimeSeries([]); return; }
    setLoadingTs(true);
    try {
      const data = await marketsApi.getPrices({ cropName: selectedCrop, district: selectedDistrict, days: 30 });
      setTimeSeries(data.prices || []);
    } catch {
      setTimeSeries([]);
    } finally {
      setLoadingTs(false);
    }
  }, [selectedCrop, selectedDistrict]);

  useEffect(() => { fetchTimeSeries(); }, [fetchTimeSeries]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
  const formatPrice = (p) => p != null ? `₹${Number(p).toLocaleString('en-IN')}` : '—';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">KS</div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Market Intelligence</span>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 shrink-0">
            <Link to={`/${user?.role}/dashboard`} className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              Dashboard
            </Link>
            <Link to="/marketplace" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              Browse
            </Link>
            <Link to="/marketplace/intelligence" className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
              Price Intel
            </Link>
            <Link to="/marketplace/analytics" className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              Analytics & Forecast
            </Link>
            <div className="h-4 w-px bg-slate-200 shrink-0" />
            <button onClick={logout} className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0">
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">APMC Mandi Price Intelligence</h1>
            <p className="text-sm text-slate-500 mt-0.5">Live arrival prices sourced from Maharashtra APMC mandis — updated daily.</p>
          </div>
          <Link
            to={`/marketplace/analytics?district=${selectedDistrict}${selectedCrop ? `&crop=${selectedCrop}` : ''}`}
            className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-4 py-2.5 rounded-xl border border-emerald-300 transition-colors shadow-xs"
          >
            <span>📈 View Price Trends, Arrivals & Forecast →</span>
          </Link>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedCrop(''); }}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[160px]"
            >
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">Drill-down Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[160px]"
            >
              <option value="">— Select crop for trend —</option>
              {availableCrops.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">{error}</div>
        )}

        {/* Latest price table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">
              Latest Prices — {selectedDistrict}
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">₹ per Quintal</span>
          </div>

          {loadingLatest ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : latestPrices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No price data for {selectedDistrict} yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  <tr>
                    <th className="text-left px-6 py-3">Crop</th>
                    <th className="text-right px-4 py-3">Min</th>
                    <th className="text-right px-4 py-3">Modal</th>
                    <th className="text-right px-4 py-3">Max</th>
                    <th className="text-left px-4 py-3">Mandi</th>
                    <th className="text-right px-4 py-3">Date</th>
                    <th className="text-right px-6 py-3">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestPrices.map((p) => {
                    const isSelected = selectedCrop === p.cropName;
                    return (
                      <tr
                        key={p.cropName}
                        onClick={() => setSelectedCrop(isSelected ? '' : p.cropName)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-6 py-3.5 font-semibold text-slate-800">
                          {p.cropName}
                          {isSelected && <span className="ml-2 text-[10px] text-emerald-600 font-bold">▸ selected</span>}
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-500">{formatPrice(p.minPrice)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">{formatPrice(p.modalPrice)}</td>
                        <td className="px-4 py-3.5 text-right text-slate-500">{formatPrice(p.maxPrice)}</td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">{p.mandiName}</td>
                        <td className="px-4 py-3.5 text-right text-slate-400 text-xs">{formatDate(p.arrivalDate)}</td>
                        <td className="px-6 py-3.5 text-right">
                          {/* Static indicator for latest table */}
                          <span className={`text-xs font-bold ${p.modalPrice >= p.minPrice ? 'text-emerald-600' : 'text-red-500'}`}>
                            {p.modalPrice >= p.minPrice ? '▲' : '▼'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Time-series trend panel */}
        {selectedCrop && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">
                30-Day Trend — <span className="text-emerald-700">{selectedCrop}</span> in {selectedDistrict}
              </h2>
            </div>

            {loadingTs ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : timeSeries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No trend data available for {selectedCrop} in {selectedDistrict}.</div>
            ) : (
              <>
                {/* Summary stats row */}
                <div className="grid grid-cols-4 border-b border-slate-100">
                  {[
                    { label: 'Latest Modal', value: formatPrice(timeSeries[0]?.modalPrice) },
                    { label: '30-Day High', value: formatPrice(Math.max(...timeSeries.map((t) => t.modalPrice))) },
                    { label: '30-Day Low', value: formatPrice(Math.min(...timeSeries.map((t) => t.modalPrice))) },
                    {
                      label: '30-Day Change',
                      value: (() => {
                        const latest = timeSeries[0]?.modalPrice;
                        const oldest = timeSeries[timeSeries.length - 1]?.modalPrice;
                        if (!latest || !oldest) return '—';
                        const pct = (((latest - oldest) / oldest) * 100).toFixed(1);
                        return `${pct > 0 ? '+' : ''}${pct}%`;
                      })(),
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="px-6 py-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">{stat.label}</span>
                      <span className="font-bold text-slate-900 text-lg">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Sparkline chart row */}
                <div className="px-6 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Modal Price Trend (Most Recent 14 Days)</p>
                  <div className="w-full overflow-x-auto">
                    {(() => {
                      const points = [...timeSeries].reverse().slice(-14);
                      const prices = points.map((p) => p.modalPrice);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const range = max - min || 1;
                      const W = 700;
                      const H = 80;

                      const pts = prices
                        .map((p, i, arr) => {
                          const x = (i / Math.max(arr.length - 1, 1)) * W;
                          const y = H - ((p - min) / range) * H;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ');

                      const lastPrice = prices[prices.length - 1];
                      const firstPrice = prices[0];
                      const isUp = lastPrice >= firstPrice;

                      return (
                        <div className="relative">
                          <svg width="100%" viewBox={`0 0 ${W} ${H + 10}`} className="overflow-visible" preserveAspectRatio="none">
                            {/* Area fill */}
                            <polyline
                              fill="none"
                              stroke={isUp ? '#10b981' : '#ef4444'}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={pts}
                            />
                            {/* Data points */}
                            {prices.map((p, i, arr) => {
                              const x = (i / Math.max(arr.length - 1, 1)) * W;
                              const y = H - ((p - min) / range) * H;
                              return (
                                <circle
                                  key={i}
                                  cx={x}
                                  cy={y}
                                  r="3"
                                  fill={isUp ? '#10b981' : '#ef4444'}
                                  className="opacity-70"
                                />
                              );
                            })}
                          </svg>
                          {/* X-axis labels */}
                          <div className="flex justify-between mt-1">
                            {points.map((p, i) => (
                              (i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1) ? (
                                <span key={i} className="text-[9px] text-slate-400">{formatDate(p.arrivalDate)}</span>
                              ) : null
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Detail table */}
                <div className="overflow-x-auto border-t border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                      <tr>
                        <th className="text-left px-6 py-3">Date</th>
                        <th className="text-right px-4 py-3">Min</th>
                        <th className="text-right px-4 py-3">Modal</th>
                        <th className="text-right px-4 py-3">Max</th>
                        <th className="text-right px-6 py-3">Arrivals</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timeSeries.slice(0, 14).map((p) => (
                        <tr key={p.id || p.arrivalDate} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 text-slate-700 font-medium">{formatDate(p.arrivalDate)}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{formatPrice(p.minPrice)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">{formatPrice(p.modalPrice)}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{formatPrice(p.maxPrice)}</td>
                          <td className="px-6 py-3 text-right text-slate-400">{p.arrivalQuantity ? `${p.arrivalQuantity} q` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {!selectedCrop && latestPrices.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Click any row in the price table to view the 30-day trend chart.
          </p>
        )}
      </main>
    </div>
  );
};

export default MarketIntelligence;
