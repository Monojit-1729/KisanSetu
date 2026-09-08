import offerService from './offer.service.js';

export const offerController = {
  // POST /api/offers (buyer only)
  async createOffer(req, res, next) {
    try {
      const offer = await offerService.createOffer(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Commercial offer submitted successfully',
        offer,
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/offers/:id/respond (buyer, seller, or admin)
  async respondToOffer(req, res, next) {
    try {
      const result = await offerService.respondToOffer(req.user.id, req.user.role, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: `Offer ${req.body.action || 'updated'} successfully`,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/offers/my
  async getMyOffers(req, res, next) {
    try {
      const offers = await offerService.getMyOffers(req.user.id, req.user.role, req.query);
      res.status(200).json({
        success: true,
        offers,
        data: offers,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/offers/lot/:lotId (lot owner only)
  async getOffersForLot(req, res, next) {
    try {
      const offers = await offerService.getOffersForLot(req.params.lotId, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        offers,
        data: offers,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/offers/:id
  async getOfferById(req, res, next) {
    try {
      const offer = await offerService.getOfferById(req.params.id, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        offer,
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default offerController;
