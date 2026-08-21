import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/my-tickets', UserController.getMyTickets);
router.delete('/reservations/:id', UserController.deleteReservation);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

export default router;
