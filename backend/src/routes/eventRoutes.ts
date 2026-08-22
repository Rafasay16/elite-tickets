import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { eventSchema } from '../schemas/eventSchema';

const router = Router();

// Públicas
router.get('/', EventController.listAll);
router.get('/:id', EventController.getOne);

// Protegidas (Organizador)
router.use(authMiddleware);
router.use(roleMiddleware(['ORGANIZER']));

router.get('/organizer/my-events', EventController.listMyEvents);
router.post('/', validate(eventSchema.create), EventController.create);
router.put('/status', validate(eventSchema.updateStatus), EventController.updateStatus);
router.get('/cortesias', validate(eventSchema.getCortesiaSeats), EventController.getCortesiaSeats);
router.post('/cortesias', validate(eventSchema.issueCortesia), EventController.issueCortesia);

export default router;
