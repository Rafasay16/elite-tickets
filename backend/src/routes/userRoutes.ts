import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { userSchema } from '../schemas/userSchema';

const router = Router();

router.use(authMiddleware);

router.get('/my-tickets', UserController.getMyTickets);
router.delete('/reservations/:id', UserController.deleteReservation);

router.get('/profile', UserController.getProfile);
router.put('/profile', validate(userSchema.updateProfile), UserController.updateProfile);

router.post('/porteiros', roleMiddleware(['ORGANIZER', 'SUPER_ADMIN']), validate(userSchema.createPorteiro), UserController.createPorteiro);
router.get('/porteiros', roleMiddleware(['ORGANIZER', 'SUPER_ADMIN']), UserController.getPorteiros);
router.delete('/porteiros/:id', roleMiddleware(['ORGANIZER', 'SUPER_ADMIN']), UserController.deletePorteiro);

export default router;
