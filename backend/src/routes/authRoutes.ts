import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validate';
import { authSchema } from '../schemas/authSchema';

const router = Router();

router.post('/login', validate(authSchema.login), AuthController.login);
router.post('/register', validate(authSchema.register), AuthController.register);

export default router;
