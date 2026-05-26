import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authMiddleware, adminGuard } from '../middleware/auth';

const router = Router();

// All user routes require authentication and admin privileges
router.use(authMiddleware, adminGuard);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
