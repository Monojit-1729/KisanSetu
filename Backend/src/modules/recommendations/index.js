import recommendationService from './recommendation.service.js';
import scoringService from './scoring.service.js';
import recommendationController from './recommendation.controller.js';
import recommendationRoutes from './recommendation.routes.js';

export {
  recommendationService,
  scoringService,
  recommendationController,
  recommendationRoutes
};

export default {
  service: recommendationService,
  scoring: scoringService,
  controller: recommendationController,
  routes: recommendationRoutes
};
