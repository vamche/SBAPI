import express from 'express';
import userRoutes from './user.route';
import teamRoutes from './team.route';
import pilotRoutes from './pilot.route';
import orderRoutes from './order.route';
import authRoutes from './auth.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /teams
router.use('/teams', teamRoutes);

// mount auth routes at /teams
router.use('/pilots', pilotRoutes);

// mount auth routes at /teams
router.use('/orders', orderRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
