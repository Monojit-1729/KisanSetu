import { Offer } from './offer.model.js';
import offerService from './offer.service.js';
import offerController from './offer.controller.js';
import offerRoutes from './offer.routes.js';

export {
  Offer,
  offerService,
  offerController,
  offerRoutes,
};

export default {
  model: Offer,
  service: offerService,
  controller: offerController,
  routes: offerRoutes,
};
