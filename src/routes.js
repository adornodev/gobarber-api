import { Router } from 'express';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';

const routes = Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.put('/users', authMiddleware, UserController.update);

export default routes;
