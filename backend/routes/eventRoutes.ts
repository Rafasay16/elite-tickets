import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Públicas
router.get('/', EventController.listAll);
router.get('/:id', EventController.getOne);

// Protegidas (Organizador)
router.use(authMiddleware);
router.use(roleMiddleware(['ORGANIZER']));

router.get('/organizer/my-events', EventController.listMyEvents);
router.post('/', EventController.create);
router.put('/', EventController.updateStatus);

router.get('/cortesia/seats', EventController.getCortesiaSeats);
router.post('/cortesia', EventController.issueCortesia);

export default router;
