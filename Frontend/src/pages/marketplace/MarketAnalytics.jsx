import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import marketsApi from '../../api/marketsApi.js';
import analyticsApi from '../../api/analyticsApi.js';
import PriceTrendChart from '../../components/charts/PriceTrendChart.jsx';
import { SUPPORTED_APMC_DISTRICTS, CANONICAL_CROPS } from '../../data/masterData.js';

const DEFAULT_DISTRICTS = SUPPORTED_APMC_DISTRICTS;
const HORIZONS = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
];

export const MarketAnalytics = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryCrop = searchParams.get('crop') || '';
  const queryDistrict = searchParams.get('district') || '';

  const [availableCrops, setAvailableCrops] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState(DEFAULT_DISTRICTS);

  const [selectedCrop, setSelectedCrop] = useState(queryCrop || 'Tomato');
  const [selectedDistrict, setSelectedDistrict] = useState(queryDistrict || 'Nashik');
  const [selectedDays, setSelectedDays] = useState(30);

  // Analytics state
  const [trendData, setTrendData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Fetch metadata crops and districts
  useEffect(() => {
    let mounted = true;
    marketsApi
      .getDistinctCrops()
      .then((data) => {
        if (mounted && data.crops?.length > 0) {
          setAvailableCrops(data.crops);
          if (!queryCrop) {
            setSelectedCrop(data.crops[0]);
          }
        }
      })
      .catch(() => {
        if (mounted) setAvailableCrops(CANONICAL_CROPS);
      });

    marketsApi
      .getDistinctDistricts()
      .then((data) => {
        if (mounted && data.districts?.length > 0) {
          setAvailableDistricts(data.districts);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [queryCrop]);

  // 2. Fetch price trends & forecast for selected crop + district
  const fetchTrends = useCallback(async () => {
    if (!selectedCrop) return;
    setLoadingTrends(true);
    setError('');

    try {
      const res = await analyticsApi.getPriceTrends({
        cropName: selectedCrop,
        district: selectedDistrict,
        days: selectedDays,
      });
      setTrendData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load price trends');
      setTrendData(null);
    } finally {
      setLoadingTrends(false);
    }
  }, [selectedCrop, selectedDistrict, selectedDays]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // 3. Fetch cross-market comparison for the crop
  const fetchComparison = useCallback(async () => {
    if (!selectedCrop) return;
    setLoadingCompare(true);

    try {
      const res = await analyticsApi.getMarketComparison({
        cropName: selectedCrop,
        primaryDistrict: selectedDistrict,
      });
      setComparisonData(res.data);
    } catch {
      setComparisonData(null);
    } finally {
      setLoadingCompare(false);
    }
  }, [selectedCrop, selectedDistrict]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  const handleCropChange = (e) => {
    const crop = e.target.value;
    setSelectedCrop(crop);
    setSearchParams({ crop, district: selectedDistrict });
  };

  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    setSearchParams({ crop: selectedCrop, district: dist });
  };

  const formatPrice = (p) => (p != null ? `₹${Number(p).toLocaleString('en-IN')}` : '—');
  const formatPerKg = (p) => (p != null ? `₹${(Number(p) / 100).toFixed(1)}/kg` : '—');

  const summary = trendData?.summary;
  const forecast = trendData?.forecast;
  const forecastSeries = forecast?.forecastSeries || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
              KS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                Market Analytics & Forecasting
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 sm:gap-3">
            <Link
              to={user?.role ? `/${user.role}/dashboard` : '/'}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Marketplace
            </Link>
            <Link
              to="/marketplace/intelligence"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Price Intel
            </Link>
            <Link
              to="/marketplace/analytics"
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
            >
              Analytics
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <Link
              to={user?.role ? `/${user.role}/dashboard` : '/'}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Marketplace
            </Link>
            <Link
              to="/marketplace/intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Price Intel
            </Link>
            <Link
              to="/marketplace/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-emerald-700 bg-emerald-50"
            >
              Analytics
            </Link>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Title & Scope Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Decision Analytics & Short-Horizon Forecast
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Market Price Analytics & Decision Support
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Historical price trends, arrival supply pressure, cross-market comparisons, and transparent 2-day forecasting.
            </p>
          </div>

          <Link
            to="/marketplace/intelligence"
            className="self-start sm:self-auto text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            ← View All Mandi Tables
          </Link>
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
            {/* Crop Selector */}
            <div className="w-full sm:w-auto">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Crop
              </label>
              <select
                value={selectedCrop}
                onChange={handleCropChange}
                className="w-full sm:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-0 sm:min-w-[170px]"
              >
                {availableCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div className="w-full sm:w-auto">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                APMC District
              </label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="w-full sm:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-0 sm:min-w-[170px]"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Horizon Toggle */}
          <div className="w-full md:w-auto">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 sm:text-right">
              Historical Window
            </label>
            <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
              {HORIZONS.map((h) => (
                <button
                  key={h.value}
                  onClick={() => setSelectedDays(h.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    selectedDays === h.value
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loadingTrends ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Analyzing market price data...</span>
          </div>
        ) : summary ? (
          <>
            {/* Summary KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Latest Modal Price */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Latest Modal Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatPrice(summary.currentModalPrice)}
                    </span>
                    <span className="text-xs text-slate-400">/{summary.unit}</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold block mt-0.5">
                    {formatPerKg(summary.currentModalPrice)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3 flex justify-between">
                  <span>As of {summary.latestDate}</span>
                  <span className="font-mono text-slate-500">{trendData.mandiName}</span>
                </div>
              </div>

              {/* Price Trajectory / Net Change */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {selectedDays}-Day Trajectory
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-3xl font-black tracking-tight ${
                        summary.priceChange > 0
                          ? 'text-emerald-600'
                          : summary.priceChange < 0
                          ? 'text-red-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {summary.priceChange > 0 ? '+' : ''}
                      {formatPrice(summary.priceChange)}
                    </span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        summary.priceChange > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : summary.priceChange < 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {summary.priceChangePercent > 0 ? '+' : ''}
                      {summary.priceChangePercent}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Direction:{' '}
                    <strong className="text-slate-800">
                      {summary.trendDirection === 'UP'
                        ? '▲ Upward Momentum'
                        : summary.trendDirection === 'DOWN'
                        ? '▼ Downward Pressure'
                        : '◆ Range Bound'}
                    </strong>
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3 flex justify-between">
                  <span>From {summary.earliestDate}</span>
                  <span>{summary.dataPointsCount} data points</span>
                </div>
              </div>

              {/* Price Corridor (High / Low) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {selectedDays}-Day Price Corridor
                  </span>
                  <div className="space-y-1.5 mt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Period Peak:</span>
                      <span className="font-bold text-slate-900">{formatPrice(summary.maxModalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Period Floor:</span>
                      <span className="font-bold text-slate-900">{formatPrice(summary.minModalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Period Average:</span>
                      <span className="font-semibold text-slate-700">{formatPrice(summary.avgModalPrice)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3 flex justify-between">
                  <span>Volatility:</span>
                  <span
                    className={`font-semibold ${
                      summary.volatilityLevel === 'HIGH'
                        ? 'text-amber-600'
                        : summary.volatilityLevel === 'MODERATE'
                        ? 'text-blue-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {summary.volatilityLevel} (±{summary.volatilityPercent}%)
                  </span>
                </div>
              </div>

              {/* Arrival Volume Context */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Mandi Arrival Supply
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Supply Context
                    </span>
                  </div>
                  {summary.hasArrivals ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">
                          {summary.avgDailyArrivals?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400">q / day avg</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Total {summary.totalArrivals?.toLocaleString('en-IN')} quintals recorded in window.
                      </p>
                    </>
                  ) : (
                    <div className="py-2 text-xs text-slate-400">
                      No arrival volume reported for this period.
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  <span>{forecast?.arrivalContextNote || 'Standard market flow observed.'}</span>
                </div>
              </div>
            </div>

            {/* Price Trend & Forecast Interactive Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Price Movement & Short-Horizon Outlook — {selectedCrop}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modal prices with min-max corridor (solid), 2-day statistical forecast (dashed), and daily arrival bars.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 self-start sm:self-auto">
                  APMC Mandi: {trendData.mandiName}
                </span>
              </div>

              {/* Pure-SVG Component */}
              <PriceTrendChart
                historicalSeries={trendData.historicalSeries}
                forecastSeries={forecastSeries}
                unit={summary.unit}
                height={340}
              />
            </div>

            {/* Short-Horizon Forecast Section */}
            <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-2xl border border-amber-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔮</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Short-Horizon Price Forecast (T+1 & T+2)
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      ESTIMATED ONLY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Transparent statistical forecast based on available historical market data. Strictly for decision support.
                  </p>
                </div>

                {forecast?.hasForecast && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">Model Confidence:</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        forecast.confidence === 'HIGH'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : forecast.confidence === 'MEDIUM'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {forecast.confidence} ({forecast.confidenceScore}/100)
                    </span>
                  </div>
                )}
              </div>

              {/* Forecast Cards */}
              {forecast?.hasForecast ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forecastSeries.map((item) => (
                    <div
                      key={item.step}
                      className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <h4 className="text-sm font-bold text-slate-900">
                            Estimated {item.day}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono">({item.date})</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          ESTIMATED
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-black text-amber-700 tracking-tight">
                          {formatPrice(item.estimatedModalPrice)}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/{item.unit}</span>
                        <span className="text-xs font-bold text-emerald-700 ml-2">
                          ({formatPerKg(item.estimatedModalPrice)})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-3 mt-3 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Expected Range
                          </span>
                          <span className="font-semibold text-slate-700">
                            {formatPrice(item.estimatedMinPrice)} – {formatPrice(item.estimatedMaxPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Uncertainty Margin
                          </span>
                          <span className="font-semibold text-amber-700">{item.uncertaintyRange}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-50">
                        <span>Expected Trajectory:</span>
                        <strong
                          className={
                            item.expectedDirection === 'UP'
                              ? 'text-emerald-700'
                              : item.expectedDirection === 'DOWN'
                              ? 'text-red-600'
                              : 'text-slate-700'
                          }
                        >
                          {item.expectedDirection === 'UP'
                            ? '▲ Modest Upward Bias'
                            : item.expectedDirection === 'DOWN'
                            ? '▼ Modest Softening'
                            : '◆ Stable / Neutral'}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-amber-300 p-6 text-center">
                  <div className="text-2xl mb-2">⚠️</div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {trendData.forecastError || 'Insufficient historical data for a reliable forecast.'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    At least 3 consistent daily market observations are required to compute statistical short-horizon forecasts without fabricating values.
                  </p>
                </div>
              )}

              {/* Methodology & Strict Disclaimer */}
              <div className="bg-amber-100/40 rounded-xl border border-amber-200 p-4 text-xs text-amber-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span>ℹ️</span> Data Transparency & Methodology
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Methodology:</strong> {forecast?.methodology || '7-day weighted linear momentum with arrival volume pressure dampening.'}
                </p>
                <p className="text-[11px] font-semibold text-amber-900">
                  {trendData.disclaimer ||
                    'Forecast based on available historical market data. Estimates are strictly decision support and NOT guaranteed prices.'}
                </p>
              </div>
            </div>

            {/* Cross-Market Comparison Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cross-Market Comparison — {selectedCrop}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How has {selectedCrop} been moving across other mandis in Maharashtra?
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {comparisonData?.totalMarkets || 0} Mandis Trading {selectedCrop}
                </span>
              </div>

              {loadingCompare ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comparisonData?.comparisons?.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="text-left px-5 py-3">Mandi / District</th>
                        <th className="text-right px-4 py-3">Latest Modal</th>
                        <th className="text-right px-4 py-3">Min – Max</th>
                        <th className="text-center px-4 py-3">7-Day Trend</th>
                        <th className="text-right px-4 py-3">Vs {selectedDistrict}</th>
                        <th className="text-right px-4 py-3">Arrivals</th>
                        <th className="text-right px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comparisonData.comparisons.map((c) => {
                        const isCurrent = c.district.toLowerCase() === selectedDistrict.toLowerCase();
                        const isHighest = comparisonData.highestMarket?.district === c.district;

                        return (
                          <tr
                            key={c.district}
                            className={`transition-colors ${
                              isCurrent
                                ? 'bg-emerald-50/70 font-semibold'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                {c.mandiName}
                                {isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800">
                                    Current
                                  </span>
                                )}
                                {isHighest && !isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                    Top Price
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">{c.district} District</span>
                            </td>

                            <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                              {formatPrice(c.modalPrice)}
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {formatPerKg(c.modalPrice)}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-right text-xs text-slate-500">
                              {formatPrice(c.minPrice)} – {formatPrice(c.maxPrice)}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  c.recentTrend === 'UP'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : c.recentTrend === 'DOWN'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {c.recentTrend === 'UP'
                                  ? '▲ Rising'
                                  : c.recentTrend === 'DOWN'
                                  ? '▼ Falling'
                                  : '◆ Flat'}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-right text-xs font-semibold">
                              {isCurrent ? (
                                <span className="text-slate-400">—</span>
                              ) : c.priceDiffVsPrimary > 0 ? (
                                <span className="text-emerald-700">
                                  +{formatPrice(c.priceDiffVsPrimary)} (+{c.priceDiffPct}%)
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  {formatPrice(c.priceDiffVsPrimary)} ({c.priceDiffPct}%)
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-right text-xs text-slate-500">
                              {c.arrivalQuantity ? (
                                <span>
                                  {c.arrivalQuantity} q
                                  {c.supplyPressure === 'HIGH_SUPPLY' && (
                                    <span className="block text-[9px] text-amber-600 font-bold">Heavy</span>
                                  )}
                                  {c.supplyPressure === 'SCARCE' && (
                                    <span className="block text-[9px] text-emerald-600 font-bold">Tight</span>
                                  )}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              {isCurrent ? (
                                <span className="text-xs text-slate-400">Selected</span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedDistrict(c.district);
                                    setSearchParams({ crop: selectedCrop, district: c.district });
                                  }}
                                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  View Trend →
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No cross-market comparison available for {selectedCrop}.
                </div>
              )}
            </div>

            {/* Transparency & Disclaimer Footer */}
            <div className="bg-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong>Data Source:</strong> {trendData.dataSource} · Updated daily at midnight APMC sync.
              </div>
              <div className="font-mono text-slate-400">
                Generated: {new Date(trendData.generatedAt).toLocaleString('en-IN')}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            No price records found for {selectedCrop} in {selectedDistrict}.
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketAnalytics;
