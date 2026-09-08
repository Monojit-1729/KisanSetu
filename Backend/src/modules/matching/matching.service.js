import { Demand } from '../demand/index.js';
import { Lot } from '../lots/index.js';

// Unit conversion to quintals for uniform comparison
const toQuintals = (qty, unit) => {
  const q = Number(qty) || 0;
  switch (unit) {
    case 'kg':
      return q / 100;
    case 'tonne':
      return q * 10;
    case 'quintal':
    default:
      return q;
  }
};

const evaluateGradeFit = (lotGrade, demandGrade) => {
  if (!demandGrade || demandGrade === 'Any') return { score: 100, label: 'Acceptable (Any Grade)' };
  if (demandGrade === 'C') return { score: 100, label: `Acceptable (Grade ${lotGrade})` };
  if (demandGrade === 'B') {
    if (lotGrade === 'A') return { score: 100, label: 'Exceeds Grade (Grade A)' };
    if (lotGrade === 'B') return { score: 100, label: 'Exact Grade (Grade B)' };
    return { score: 40, label: 'Below Desired Grade (Grade C)' };
  }
  if (demandGrade === 'A') {
    if (lotGrade === 'A') return { score: 100, label: 'Exact Grade (Grade A)' };
    if (lotGrade === 'B') return { score: 65, label: 'Alternative Grade (Grade B)' };
    return { score: 30, label: 'Substandard Grade (Grade C)' };
  }
  return { score: 70, label: `Grade ${lotGrade}` };
};

const evaluateQuantityFit = (lotQtyQ, demandQtyQ) => {
  if (lotQtyQ >= demandQtyQ) {
    return {
      type: 'full',
      score: 100,
      coveragePercent: 100,
      label: 'Full Quantity Coverage',
    };
  }
  const pct = Math.round((lotQtyQ / demandQtyQ) * 100);
  return {
    type: 'partial',
    score: Math.max(30, Math.min(95, pct)),
    coveragePercent: pct,
    label: `Partial Coverage (${pct}%)`,
  };
};

const evaluateLocationFit = (lotLoc, demandLoc) => {
  const lotDist = (lotLoc?.district || '').trim().toLowerCase();
  const demandDist = (demandLoc?.district || '').trim().toLowerCase();

  if (lotDist && demandDist && lotDist === demandDist) {
    return { score: 100, label: `Same District (${lotLoc.district})`, sameDistrict: true };
  }

  const lotState = (lotLoc?.state || '').trim().toLowerCase();
  const demandState = (demandLoc?.state || '').trim().toLowerCase();

  if (lotState && demandState && lotState === demandState) {
    return { score: 75, label: `Intra-State (${lotLoc.district} to ${demandLoc?.district})`, sameDistrict: false };
  }

  return { score: 50, label: 'Inter-State Distance', sameDistrict: false };
};

const evaluateTimingFit = (lotAvailableFrom, deliveryEndDate) => {
  const availDate = lotAvailableFrom ? new Date(lotAvailableFrom).getTime() : Date.now();
  const deadline = deliveryEndDate ? new Date(deliveryEndDate).getTime() : Date.now() + 7 * 86400000;

  if (availDate <= deadline) {
    return { score: 100, label: 'Available within delivery window', onTime: true };
  }
  return { score: 25, label: 'Available after delivery window', onTime: false };
};

const matchingService = {
  /**
   * Find all active farmer/FPO lots that match a buyer's procurement demand.
   */
  async findMatchesForDemand(demandId) {
    const demand = await Demand.findById(demandId).populate('buyer', 'name email role').lean();
    if (!demand) return null;

    // Search active lots matching cropName (case-insensitive)
    const cropRegex = new RegExp(`^${demand.cropName.trim()}$`, 'i');
    const activeLots = await Lot.find({
      status: 'active',
      cropName: cropRegex,
    })
      .populate('owner', 'name email role')
      .lean();

    const demandQtyQ = toQuintals(demand.quantity, demand.unit);

    const matches = [];

    for (const lot of activeLots) {
      const lotQtyQ = toQuintals(lot.quantity, lot.unit);

      // Evaluate individual deterministic criteria
      const gradeFit = evaluateGradeFit(lot.quality, demand.quality);
      const qtyFit = evaluateQuantityFit(lotQtyQ, demandQtyQ);
      const locFit = evaluateLocationFit(lot.location, demand.deliveryLocation);
      const timingFit = evaluateTimingFit(lot.availableFrom, demand.deliveryWindow?.endDate);

      // Weighted score: Grade (25%), Quantity (30%), Location (25%), Timing (20%)
      const overallScore = Math.round(
        gradeFit.score * 0.25 +
        qtyFit.score * 0.30 +
        locFit.score * 0.25 +
        timingFit.score * 0.20
      );

      // Only include viable matches (score >= 45)
      if (overallScore >= 45) {
        const reasons = [
          `Exact crop match: ${demand.cropName}`,
          gradeFit.label,
          qtyFit.label,
          locFit.label,
          timingFit.label,
        ];

        matches.push({
          lot: {
            ...lot,
            id: lot._id.toString(),
            _id: undefined,
            __v: undefined,
            owner: lot.owner
              ? {
                  id: lot.owner._id.toString(),
                  name: lot.owner.name,
                  email: lot.owner.email,
                  role: lot.owner.role,
                }
              : null,
          },
          fitScore: overallScore,
          criteria: {
            cropMatch: true,
            gradeFit,
            quantityFit: qtyFit,
            locationFit: locFit,
            timingFit,
          },
          reasons,
        });
      }
    }

    // Sort by best fit score descending
    matches.sort((a, b) => b.fitScore - a.fitScore);

    return {
      demand: {
        ...demand,
        id: demand._id.toString(),
        _id: undefined,
        __v: undefined,
        buyer: demand.buyer
          ? {
              id: demand.buyer._id.toString(),
              name: demand.buyer.name,
              email: demand.buyer.email,
            }
          : null,
      },
      matchCount: matches.length,
      matches,
    };
  },

  /**
   * Find all active buyer demands that match a farmer/FPO's active lot (Read-Only Visibility).
   */
  async findMatchesForLot(lotId) {
    const lot = await Lot.findById(lotId).populate('owner', 'name email role').lean();
    if (!lot) return null;

    const cropRegex = new RegExp(`^${lot.cropName.trim()}$`, 'i');
    const activeDemands = await Demand.find({
      status: 'active',
      cropName: cropRegex,
    })
      .populate('buyer', 'name email role')
      .lean();

    const lotQtyQ = toQuintals(lot.quantity, lot.unit);
    const matches = [];

    for (const demand of activeDemands) {
      const demandQtyQ = toQuintals(demand.quantity, demand.unit);

      const gradeFit = evaluateGradeFit(lot.quality, demand.quality);
      const qtyFit = evaluateQuantityFit(lotQtyQ, demandQtyQ);
      const locFit = evaluateLocationFit(lot.location, demand.deliveryLocation);
      const timingFit = evaluateTimingFit(lot.availableFrom, demand.deliveryWindow?.endDate);

      const overallScore = Math.round(
        gradeFit.score * 0.25 +
        qtyFit.score * 0.30 +
        locFit.score * 0.25 +
        timingFit.score * 0.20
      );

      if (overallScore >= 45) {
        matches.push({
          demand: {
            ...demand,
            id: demand._id.toString(),
            _id: undefined,
            __v: undefined,
            buyer: demand.buyer
              ? {
                  id: demand.buyer._id.toString(),
                  name: demand.buyer.name,
                  email: demand.buyer.email,
                }
              : null,
          },
          fitScore: overallScore,
          criteria: {
            cropMatch: true,
            gradeFit,
            quantityFit: qtyFit,
            locationFit: locFit,
            timingFit,
          },
          reasons: [
            `Crop: ${lot.cropName}`,
            gradeFit.label,
            qtyFit.label,
            locFit.label,
            timingFit.label,
          ],
        });
      }
    }

    matches.sort((a, b) => b.fitScore - a.fitScore);

    return {
      lot: {
        ...lot,
        id: lot._id.toString(),
        _id: undefined,
        __v: undefined,
      },
      matchCount: matches.length,
      matches,
    };
  },

  /**
   * Get match counts for all active lots owned by a specific farmer/FPO.
   */
  async getMyLotsMatchSummary(ownerId) {
    const activeLots = await Lot.find({ owner: ownerId, status: 'active' }).lean();
    if (!activeLots.length) return { lots: [], totalMatches: 0 };

    const activeDemands = await Demand.find({ status: 'active' }).lean();

    let totalMatches = 0;
    const lotSummaries = activeLots.map((lot) => {
      const cropRegex = new RegExp(`^${lot.cropName.trim()}$`, 'i');
      const lotQtyQ = toQuintals(lot.quantity, lot.unit);

      const matchingDemands = activeDemands.filter((demand) => {
        if (!cropRegex.test(demand.cropName)) return false;
        const demandQtyQ = toQuintals(demand.quantity, demand.unit);
        const gradeFit = evaluateGradeFit(lot.quality, demand.quality);
        const qtyFit = evaluateQuantityFit(lotQtyQ, demandQtyQ);
        const locFit = evaluateLocationFit(lot.location, demand.deliveryLocation);
        const timingFit = evaluateTimingFit(lot.availableFrom, demand.deliveryWindow?.endDate);

        const score = Math.round(
          gradeFit.score * 0.25 +
          qtyFit.score * 0.30 +
          locFit.score * 0.25 +
          timingFit.score * 0.20
        );
        return score >= 45;
      });

      totalMatches += matchingDemands.length;

      return {
        lotId: lot._id.toString(),
        cropName: lot.cropName,
        variety: lot.variety,
        quantity: lot.quantity,
        unit: lot.unit,
        matchingBuyersCount: matchingDemands.length,
      };
    });

    return {
      lots: lotSummaries,
      totalMatches,
    };
  },
};

export default matchingService;
