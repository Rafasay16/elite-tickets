import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['CLIENT', 'ORGANIZER', 'SUPER_ADMIN']));

router.post('/', CheckoutController.reserve);
router.post('/confirm', CheckoutController.confirm);

export default router;
