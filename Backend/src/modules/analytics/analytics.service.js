import MarketPrice from '../markets/marketPrice.model.js';
import { escapeRegex } from '../../utils/regex.js';

const DAYS_WINDOW = 30;

/**
 * Helper: compute linear slope over points array [{ x, y }]
 */
function computeLinearSlope(points) {
  const n = points.length;
  if (n < 2) return 0;

  const meanX = points.reduce((acc, p) => acc + p.x, 0) / n;
  const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    numerator += dx * (p.y - meanY);
    denominator += dx * dx;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Helper: compute sample standard deviation of an array of numbers
 */
function computeStdDev(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export const analyticsService = {
  /**
   * Get historical price trends with statistical summary and transparent short-horizon forecast.
   * @param {Object} params
   * @param {string} params.cropName
   * @param {string} params.district
   * @param {string} [params.mandiName]
   * @param {number} [params.days=30]
   */
  async getPriceTrends({ cropName, district, mandiName, days = DAYS_WINDOW } = {}) {
    if (!cropName) {
      throw Object.assign(new Error('cropName is required'), { statusCode: 400 });
    }

    const windowDays = Math.min(Math.max(parseInt(days, 10) || DAYS_WINDOW, 3), 90);
    const since = new Date();
    since.setDate(since.getDate() - windowDays);
    since.setHours(0, 0, 0, 0);

    const query = {
      cropName: { $regex: `^${escapeRegex(cropName.trim())}$`, $options: 'i' },
      arrivalDate: { $gte: since },
    };

    if (district) {
      query.district = { $regex: `^${escapeRegex(district.trim())}$`, $options: 'i' };
    }

    if (mandiName) {
      query.mandiName = { $regex: `^${escapeRegex(mandiName.trim())}$`, $options: 'i' };
    }

    // Sort chronologically ascending for analytical time-series
    const rawRecords = await MarketPrice.find(query)
      .sort({ arrivalDate: 1 })
      .lean();

    const historicalSeries = rawRecords.map((r) => ({
      id: r._id.toString(),
      date: r.arrivalDate.toISOString().split('T')[0],
      arrivalDate: r.arrivalDate,
      cropName: r.cropName,
      district: r.district,
      mandiName: r.mandiName,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      modalPrice: r.modalPrice,
      unit: r.unit || 'quintal',
      arrivalQuantity: r.arrivalQuantity || 0,
      isEstimate: false,
    }));

    // If no records found, return empty payload
    if (historicalSeries.length === 0) {
      return {
        crop: cropName,
        district: district || 'All',
        mandiName: mandiName || 'All',
        days: windowDays,
        historicalSeries: [],
        summary: null,
        forecast: null,
        forecastError: 'No historical market records found for the given criteria.',
        dataSource: 'Maharashtra APMC Mandi Observations (Demo/Simulated)',
        generatedAt: new Date().toISOString(),
      };
    }

    // 1. Calculate Summary Metrics
    const modalPrices = historicalSeries.map((h) => h.modalPrice);
    const minPrices = historicalSeries.map((h) => h.minPrice);
    const maxPrices = historicalSeries.map((h) => h.maxPrice);
    const arrivals = historicalSeries.map((h) => h.arrivalQuantity);

    const currentModalPrice = modalPrices[modalPrices.length - 1];
    const initialModalPrice = modalPrices[0];
    const minModalPrice = Math.min(...modalPrices);
    const maxModalPrice = Math.max(...modalPrices);
    const overallMinPrice = Math.min(...minPrices);
    const overallMaxPrice = Math.max(...maxPrices);
    const avgModalPrice = Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length);

    const priceChange = currentModalPrice - initialModalPrice;
    const priceChangePercent = initialModalPrice > 0
      ? parseFloat(((priceChange / initialModalPrice) * 100).toFixed(1))
      : 0;

    // Daily deltas for volatility calculation
    const dailyDeltas = [];
    for (let i = 1; i < modalPrices.length; i++) {
      dailyDeltas.push(modalPrices[i] - modalPrices[i - 1]);
    }
    const deltaStdDev = computeStdDev(dailyDeltas);
    const volatilityPercent = currentModalPrice > 0
      ? parseFloat(((deltaStdDev / currentModalPrice) * 100).toFixed(1))
      : 0;

    const totalArrivals = arrivals.reduce((a, b) => a + b, 0);
    const avgDailyArrivals = Math.round(totalArrivals / arrivals.length);
    const hasArrivals = totalArrivals > 0;

    const summary = {
      currentModalPrice,
      minModalPrice,
      maxModalPrice,
      overallMinPrice,
      overallMaxPrice,
      avgModalPrice,
      priceChange,
      priceChangePercent,
      trendDirection: priceChange > 15 ? 'UP' : priceChange < -15 ? 'DOWN' : 'STABLE',
      volatilityPercent,
      volatilityLevel: volatilityPercent > 6 ? 'HIGH' : volatilityPercent > 3 ? 'MODERATE' : 'LOW',
      totalArrivals,
      avgDailyArrivals,
      hasArrivals,
      unit: historicalSeries[0]?.unit || 'quintal',
      dataPointsCount: historicalSeries.length,
      latestDate: historicalSeries[historicalSeries.length - 1].date,
      earliestDate: historicalSeries[0].date,
    };

    // 2. Short-Horizon Forecast Calculation
    let forecast = null;
    let forecastError = null;

    if (historicalSeries.length < 3) {
      forecastError = 'Insufficient historical data for a reliable forecast.';
    } else {
      forecast = this.computeShortHorizonForecast({
        historicalSeries,
        summary,
        deltaStdDev,
      });
    }

    return {
      crop: cropName,
      district: district || historicalSeries[0]?.district || 'All',
      mandiName: mandiName || historicalSeries[0]?.mandiName || 'All',
      days: windowDays,
      historicalSeries,
      summary,
      forecast,
      forecastError,
      dataSource: 'Maharashtra APMC Mandi Observations (Demo/Simulated)',
      disclaimer: 'Forecast based on available historical market data. Estimates for decision support only; not guaranteed prices.',
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Internal pure statistical short-horizon forecasting algorithm (T+1 and T+2).
   */
  computeShortHorizonForecast({ historicalSeries, summary, deltaStdDev }) {
    const n = historicalSeries.length;
    const recentK = Math.min(n, 7); // Use up to 7 recent days for momentum
    const recentSlice = historicalSeries.slice(n - recentK);

    // Linear regression slope on recent observations
    const points = recentSlice.map((rec, idx) => ({ x: idx, y: rec.modalPrice }));
    const momentumSlope = computeLinearSlope(points);

    // Arrival volume pressure factor
    let pressureAdjustment = 0;
    let arrivalContextNote = 'Arrivals volume is within normal historical ranges.';

    if (summary.hasArrivals) {
      const recentArrivals = recentSlice.map((r) => r.arrivalQuantity);
      const recent3Arrivals = recentArrivals.slice(-3);
      const avgRecent3 = recent3Arrivals.reduce((a, b) => a + b, 0) / recent3Arrivals.length;
      const baselineArrivals = summary.avgDailyArrivals || 1;

      const arrivalRatio = avgRecent3 / baselineArrivals;
      if (arrivalRatio > 1.25) {
        // High supply arrival surge dampens prices
        pressureAdjustment = -Math.round(summary.currentModalPrice * 0.012);
        arrivalContextNote = 'High arrival surge observed (+25% vs average); exerts downward market pressure.';
      } else if (arrivalRatio < 0.75) {
        // Tight arrivals provide upward price support
        pressureAdjustment = Math.round(summary.currentModalPrice * 0.012);
        arrivalContextNote = 'Arrivals lower than average (-25%); tight market arrivals provide price support.';
      }
    }

    const lastPrice = summary.currentModalPrice;
    const lastDateObj = new Date(historicalSeries[n - 1].arrivalDate);

    // Baseline uncertainty standard error (at least 2.5% of current price)
    const effectiveSigma = Math.max(deltaStdDev || 0, lastPrice * 0.025);

    // Project Tomorrow (T+1)
    const t1Date = new Date(lastDateObj);
    t1Date.setDate(t1Date.getDate() + 1);

    // Project Day After Tomorrow (T+2)
    const t2Date = new Date(lastDateObj);
    t2Date.setDate(t2Date.getDate() + 2);

    // Projected modal prices with safety bounds (cap variance at ±12% to prevent divergence)
    const rawProj1 = lastPrice + momentumSlope + pressureAdjustment;
    const rawProj2 = lastPrice + 2 * momentumSlope + 1.8 * pressureAdjustment;

    const maxAllowed = Math.round(lastPrice * 1.15);
    const minAllowed = Math.round(lastPrice * 0.85);

    const estModal1 = Math.max(minAllowed, Math.min(maxAllowed, Math.round(rawProj1)));
    const estModal2 = Math.max(minAllowed, Math.min(maxAllowed, Math.round(rawProj2)));

    // Prediction uncertainty bounds (approx. 90% confidence interval)
    const margin1 = Math.round(1.645 * effectiveSigma);
    const margin2 = Math.round(1.645 * effectiveSigma * 1.414); // sqrt(2) for 2 steps

    const estMin1 = Math.max(0, estModal1 - margin1);
    const estMax1 = estModal1 + margin1;

    const estMin2 = Math.max(0, estModal2 - margin2);
    const estMax2 = estModal2 + margin2;

    // Confidence classification
    let confidence = 'MEDIUM';
    let confidenceScore = 70;

    if (n >= 14 && (effectiveSigma / lastPrice) < 0.05) {
      confidence = 'HIGH';
      confidenceScore = 88;
    } else if (n < 6 || (effectiveSigma / lastPrice) > 0.08) {
      confidence = 'LOW';
      confidenceScore = 48;
    }

    const dir1 = estModal1 > lastPrice + 10 ? 'UP' : estModal1 < lastPrice - 10 ? 'DOWN' : 'STABLE';
    const dir2 = estModal2 > estModal1 + 10 ? 'UP' : estModal2 < estModal1 - 10 ? 'DOWN' : 'STABLE';

    const forecastSeries = [
      {
        day: 'Tomorrow',
        step: 1,
        date: t1Date.toISOString().split('T')[0],
        arrivalDate: t1Date,
        estimatedModalPrice: estModal1,
        estimatedMinPrice: estMin1,
        estimatedMaxPrice: estMax1,
        uncertaintyRange: `±₹${margin1}`,
        uncertaintyValue: margin1,
        expectedDirection: dir1,
        isEstimate: true,
        unit: summary.unit,
      },
      {
        day: 'Day After Tomorrow',
        step: 2,
        date: t2Date.toISOString().split('T')[0],
        arrivalDate: t2Date,
        estimatedModalPrice: estModal2,
        estimatedMinPrice: estMin2,
        estimatedMaxPrice: estMax2,
        uncertaintyRange: `±₹${margin2}`,
        uncertaintyValue: margin2,
        expectedDirection: dir2,
        isEstimate: true,
        unit: summary.unit,
      },
    ];

    return {
      hasForecast: true,
      crop: historicalSeries[0]?.cropName,
      district: historicalSeries[0]?.district,
      market: historicalSeries[0]?.mandiName,
      forecastSeries,
      confidence,
      confidenceScore,
      methodology: '7-day weighted linear momentum with arrival volume pressure dampening and 90% error intervals',
      arrivalContextNote,
      dataSource: 'Maharashtra APMC Mandi Observations (Demo/Simulated)',
      disclaimer: 'Forecast based on available historical market data. Estimates for decision support only; not guaranteed prices.',
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Compare a selected crop across all available markets and districts in Maharashtra.
   * @param {Object} params
   * @param {string} params.cropName
   * @param {string} [params.primaryDistrict]
   */
  async getMarketComparison({ cropName, primaryDistrict } = {}) {
    if (!cropName) {
      throw Object.assign(new Error('cropName is required'), { statusCode: 400 });
    }

    // 1. Find all distinct districts where this crop is traded
    const districts = await MarketPrice.distinct('district', {
      cropName: { $regex: `^${escapeRegex(cropName.trim())}$`, $options: 'i' },
    });

    if (!districts || districts.length === 0) {
      return {
        crop: cropName,
        primaryDistrict: primaryDistrict || null,
        comparisons: [],
        highestMarket: null,
        lowestMarket: null,
        totalMarkets: 0,
      };
    }

    // 2. For each district, get the latest record and 7-day prior record to compute trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const comparisons = [];
    for (const dist of districts) {
      const latest = await MarketPrice.findOne({
        cropName: { $regex: `^${escapeRegex(cropName.trim())}$`, $options: 'i' },
        district: dist,
      })
        .sort({ arrivalDate: -1 })
        .lean();

      if (!latest) continue;

      // Prior record ~7 days ago for trend
      const prior = await MarketPrice.findOne({
        cropName: { $regex: `^${escapeRegex(cropName.trim())}$`, $options: 'i' },
        district: dist,
        arrivalDate: { $lte: sevenDaysAgo },
      })
        .sort({ arrivalDate: -1 })
        .lean();

      let recentTrend = 'STABLE';
      let trendPct = 0;
      if (prior && prior.modalPrice > 0) {
        trendPct = parseFloat((((latest.modalPrice - prior.modalPrice) / prior.modalPrice) * 100).toFixed(1));
        if (trendPct > 1.5) recentTrend = 'UP';
        else if (trendPct < -1.5) recentTrend = 'DOWN';
      }

      // Arrival pressure indicator
      let supplyPressure = 'NORMAL';
      if (latest.arrivalQuantity > 300) {
        supplyPressure = 'HIGH_SUPPLY';
      } else if (latest.arrivalQuantity > 0 && latest.arrivalQuantity < 100) {
        supplyPressure = 'SCARCE';
      }

      comparisons.push({
        district: latest.district,
        mandiName: latest.mandiName,
        state: latest.state || 'Maharashtra',
        modalPrice: latest.modalPrice,
        minPrice: latest.minPrice,
        maxPrice: latest.maxPrice,
        arrivalQuantity: latest.arrivalQuantity || 0,
        unit: latest.unit || 'quintal',
        arrivalDate: latest.arrivalDate,
        dateFormatted: latest.arrivalDate ? latest.arrivalDate.toISOString().split('T')[0] : '—',
        recentTrend,
        trendPct,
        supplyPressure,
        isPrimary: primaryDistrict ? latest.district.toLowerCase() === primaryDistrict.toLowerCase() : false,
      });
    }

    // Sort by modalPrice descending (highest paying mandi first)
    comparisons.sort((a, b) => b.modalPrice - a.modalPrice);

    // Primary district price reference
    const primaryRec = primaryDistrict
      ? comparisons.find((c) => c.district.toLowerCase() === primaryDistrict.toLowerCase())
      : null;
    const baseModal = primaryRec ? primaryRec.modalPrice : (comparisons[0]?.modalPrice || 0);

    // Add relative difference
    const enrichedComparisons = comparisons.map((c) => ({
      ...c,
      priceDiffVsPrimary: c.modalPrice - baseModal,
      priceDiffPct: baseModal > 0 ? parseFloat((((c.modalPrice - baseModal) / baseModal) * 100).toFixed(1)) : 0,
    }));

    return {
      crop: cropName,
      primaryDistrict: primaryDistrict || null,
      primaryMarketModal: baseModal,
      comparisons: enrichedComparisons,
      highestMarket: enrichedComparisons[0] || null,
      lowestMarket: enrichedComparisons[enrichedComparisons.length - 1] || null,
      totalMarkets: enrichedComparisons.length,
      dataSource: 'Maharashtra APMC Mandi Observations (Demo/Simulated)',
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Dedicated standalone forecast retrieval endpoint.
   */
  async getForecast({ cropName, district, mandiName } = {}) {
    const trendData = await this.getPriceTrends({
      cropName,
      district,
      mandiName,
      days: 30,
    });

    return {
      crop: cropName,
      market: trendData.mandiName,
      district: trendData.district,
      historicalSeries: trendData.historicalSeries,
      forecastSeries: trendData.forecast?.forecastSeries || [],
      hasForecast: !!trendData.forecast?.hasForecast,
      confidence: trendData.forecast?.confidence || 'INSUFFICIENT_DATA',
      confidenceScore: trendData.forecast?.confidenceScore || 0,
      methodology: trendData.forecast?.methodology || 'N/A',
      arrivalContextNote: trendData.forecast?.arrivalContextNote || null,
      forecastError: trendData.forecastError,
      dataSource: trendData.dataSource,
      disclaimer: trendData.disclaimer,
      generatedAt: trendData.generatedAt,
    };
  },
};

export default analyticsService;
