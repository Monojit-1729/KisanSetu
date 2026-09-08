const scoringService = {
  /**
   * Transparent opportunity scoring combining:
   * 1. Net Realization (35%)
   * 2. Quality & Grade Fit (20%)
   * 3. Demand Strength & Quantity Coverage (15%)
   * 4. Logistics & Distance (15%)
   * 5. Trust & Reliability (10%)
   * 6. Delivery Timing (5%)
   */
  scoreOpportunity({
    lot,
    channelType = 'buyer',
    realization,
    buyerProfile = null,
    demand = null,
    marketBenchmark = null,
  }) {
    const reasons = [];

    // --- 1. Net Realization Score (35%) ---
    const benchmarkPrice = marketBenchmark?.modalPrice || lot.pricePerQuintal || 1500;
    const netPerQ = realization?.netPerQuintal || 0;
    const priceRatio = benchmarkPrice > 0 ? netPerQ / benchmarkPrice : 1;

    let netScore = 75;
    if (priceRatio >= 1.15) {
      netScore = 100;
      reasons.push(`Superior net return: ₹${netPerQ}/q is +${Math.round((priceRatio - 1) * 100)}% above mandi modal price.`);
    } else if (priceRatio >= 1.05) {
      netScore = 90;
      reasons.push(`Strong net return: ₹${netPerQ}/q is +${Math.round((priceRatio - 1) * 100)}% above mandi benchmark.`);
    } else if (priceRatio >= 0.98) {
      netScore = 80;
      reasons.push(`Competitive net return: ₹${netPerQ}/q on par with prevailing mandi modal rates.`);
    } else if (priceRatio >= 0.90) {
      netScore = 65;
      reasons.push(`Moderate net return: ₹${netPerQ}/q is slightly discounted (-${Math.round((1 - priceRatio) * 100)}%) against mandi.`);
    } else {
      netScore = Math.max(25, Math.round(priceRatio * 60));
      reasons.push(`Lower net realization: ₹${netPerQ}/q after freight and logistics.`);
    }

    // --- 2. Quality & Grade Fit (20%) ---
    let qualityScore = 80;
    if (channelType === 'mandi') {
      qualityScore = lot.quality === 'A' ? 95 : lot.quality === 'B' ? 85 : 70;
      reasons.push(`Mandi provides general market absorption for Grade ${lot.quality} produce.`);
    } else if (demand) {
      const dQuality = demand.quality || 'Any';
      const lQuality = lot.quality || 'B';

      if (dQuality === 'Any') {
        qualityScore = 100;
        reasons.push('Buyer accepts any quality grade.');
      } else if (lQuality === 'A' && dQuality === 'B') {
        qualityScore = 100;
        reasons.push('Produce Grade A exceeds buyer Grade B standard.');
      } else if (lQuality === dQuality) {
        qualityScore = 100;
        reasons.push(`Exact quality match: Grade ${lQuality}.`);
      } else if (lQuality === 'B' && dQuality === 'A') {
        qualityScore = 60;
        reasons.push('Produce Grade B is lower than requested Grade A.');
      } else if (lQuality === 'C' && dQuality === 'A') {
        qualityScore = 30;
        reasons.push('Substantial quality gap: Grade C produce vs Grade A requested.');
      } else {
        qualityScore = 70;
      }
    }

    // --- 3. Demand Strength & Quantity Fit (15%) ---
    let demandScore = 75;
    if (channelType === 'mandi') {
      demandScore = 80; // APMC mandis offer steady absorption
      reasons.push('Continuous open auction liquidity at APMC yard.');
    } else if (demand) {
      const lotQty = lot.quantity || 1;
      const demQty = demand.quantity || 1;
      const coverage = (lotQty / demQty) * 100;

      if (coverage >= 100) {
        demandScore = 100;
        reasons.push(`Full volume placement: lot (${lotQty} ${lot.unit}) satisfies buyer requirement (${demQty} ${demand.unit}).`);
      } else if (coverage >= 70) {
        demandScore = 85;
        reasons.push(`High volume placement: covers ${Math.round(coverage)}% of buyer requirement.`);
      } else if (coverage >= 40) {
        demandScore = 65;
        reasons.push(`Partial volume placement: covers ${Math.round(coverage)}% of buyer requirement.`);
      } else {
        demandScore = 45;
        reasons.push(`Fractional volume: covers only ${Math.round(coverage)}% of buyer demand.`);
      }
    }

    // --- 4. Logistics & Distance (15%) ---
    const distanceKm = realization?.distanceKm || 30;
    let logisticsScore = 80;
    if (distanceKm <= 35) {
      logisticsScore = 100;
      reasons.push(`Local proximity: ${distanceKm} km transit minimizes freight loss and handling.`);
    } else if (distanceKm <= 180) {
      logisticsScore = 80;
      reasons.push(`Regional haulage: ${distanceKm} km moderate transit route.`);
    } else if (distanceKm <= 260) {
      logisticsScore = 65;
      reasons.push(`Extended haulage: ${distanceKm} km transit requires dedicated logistics coordination.`);
    } else {
      logisticsScore = 40;
      reasons.push(`Long-distance haulage: ${distanceKm} km transit incurs higher transport cost.`);
    }

    // --- 5. Trust & Reliability (10%) ---
    let trustScore = 70;
    if (channelType === 'mandi') {
      trustScore = 85; // Regulated statutory market
      reasons.push('Statutory APMC regulatory framework and weighing oversight.');
    } else if (buyerProfile) {
      if (buyerProfile.isVerified) {
        trustScore = 100;
        reasons.push('Verified enterprise buyer with verified business credentials.');
      } else {
        trustScore = 55;
        reasons.push('Buyer profile pending enterprise verification.');
      }
    }

    // --- 6. Delivery Timing (5%) ---
    let timingScore = 85;
    if (demand?.deliveryWindow?.endDate) {
      const deadline = new Date(demand.deliveryWindow.endDate).getTime();
      const available = lot.availableFrom ? new Date(lot.availableFrom).getTime() : Date.now();
      if (available <= deadline) {
        timingScore = 100;
        reasons.push('Lot availability aligns smoothly with buyer delivery schedule.');
      } else {
        timingScore = 35;
        reasons.push('Lot availability date is after stated delivery deadline.');
      }
    }

    // Weighted Overall Score
    const overallScore = Math.round(
      netScore * 0.35 +
      qualityScore * 0.20 +
      demandScore * 0.15 +
      logisticsScore * 0.15 +
      trustScore * 0.10 +
      timingScore * 0.05
    );

    return {
      overallScore: Math.max(1, Math.min(100, overallScore)),
      breakdown: {
        netRealization: { score: netScore, weight: '35%' },
        qualityFit: { score: qualityScore, weight: '20%' },
        demandStrength: { score: demandScore, weight: '15%' },
        logistics: { score: logisticsScore, weight: '15%' },
        trust: { score: trustScore, weight: '10%' },
        timing: { score: timingScore, weight: '5%' },
        netScore,
        gradeScore: qualityScore,
        coverageScore: demandScore,
        distanceScore: logisticsScore,
        trustScore,
        timingScore,
        reasons,
      },
      reasons,
    };
  },
};

export default scoringService;
