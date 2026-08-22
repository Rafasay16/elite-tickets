import { Router } from 'express';
import authRoutes from './authRoutes';
import eventRoutes from './eventRoutes';
import adminRoutes from './adminRoutes';
import checkoutRoutes from './checkoutRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/super-admin', adminRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/users', userRoutes);

export default router;
