import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../schemas/checkoutSchema';

const router = Router();

router.use(authMiddleware);

router.post('/reserve', roleMiddleware(['CLIENT', 'ORGANIZER', 'SUPER_ADMIN']), validate(checkoutSchema.reserve), CheckoutController.reserve);
router.post('/confirm', roleMiddleware(['CLIENT', 'ORGANIZER', 'SUPER_ADMIN']), validate(checkoutSchema.confirm), CheckoutController.confirm);
router.post('/validate', roleMiddleware(['ORGANIZER', 'SUPER_ADMIN', 'PORTARIA']), validate(checkoutSchema.validateTicket), CheckoutController.validateTicket);

export default router;
