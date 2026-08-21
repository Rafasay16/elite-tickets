import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN']));

router.get('/organizers', AdminController.listOrganizers);
router.post('/organizers', AdminController.createOrganizer);
router.put('/organizers/:id/password', AdminController.updatePassword);
router.put('/organizers/:id/status', AdminController.updateStatus);
router.put('/organizers/:id/limits', AdminController.updateLimits);

export default router;
