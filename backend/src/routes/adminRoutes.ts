import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { adminSchema } from '../schemas/adminSchema';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN']));

router.get('/organizers', AdminController.listOrganizers);
router.post('/organizers', validate(adminSchema.createOrganizer), AdminController.createOrganizer);
router.put('/organizers/:id/password', validate(adminSchema.updatePassword), AdminController.updatePassword);
router.put('/organizers/:id/status', validate(adminSchema.updateStatus), AdminController.updateStatus);
router.put('/organizers/:id/limits', validate(adminSchema.updateLimits), AdminController.updateLimits);

export default router;
