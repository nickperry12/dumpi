import { router as endpoints } from './endpoints.js';

export const mountRoutes = (app) => {
  app.use('/api', endpoints);
};