import { Order } from './order.model.js';
import orderService from './order.service.js';
import orderController from './order.controller.js';
import orderRoutes from './order.routes.js';

export {
  Order,
  orderService,
  orderController,
  orderRoutes,
};

export default {
  model: Order,
  service: orderService,
  controller: orderController,
  routes: orderRoutes,
};
