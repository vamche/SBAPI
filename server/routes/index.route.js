import express from 'express';
import userRoutes from './user.route';
import teamRoutes from './team.route';
import pilotRoutes from './pilot.route';
import orderRoutes from './order.route';
import authRoutes from './auth.route';
import customerRoutes from './customer.route';
import timesheetRoutes from './timesheet.route';
import targetRoutes from './target.route';
import managerRoutes from './manager.route';


const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);

// mount team routes at /teams
router.use('/teams', teamRoutes);

// mount pilot routes at /pilots
router.use('/pilots', pilotRoutes);

// mount order routes at /orders
router.use('/orders', orderRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount util routes at /util
router.use('/util', authRoutes);

// mount customer routes at /customers
router.use('/customers', customerRoutes);

// mount customer routes at /auth
router.use('/timesheets', timesheetRoutes);

// mount customer routes at /auth
router.use('/targets', targetRoutes);

// mount customer routes at /auth
router.use('/managers', managerRoutes);

export default router;
