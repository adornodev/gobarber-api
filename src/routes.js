import { Router } from 'express';
import multer from 'multer';
import AppointmentController from './app/controllers/AppointmentController';
import AvailableController from './app/controllers/AvailableController';
import FileController from './app/controllers/FileController';
import NotificationController from './app/controllers/NotificationController';
import ProviderController from './app/controllers/ProviderController';
import ScheduleController from './app/controllers/ScheduleController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.put('/users', authMiddleware, UserController.update);

routes.post('/sessions', SessionController.store);

routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.store
);

routes.get('/providers', authMiddleware, ProviderController.index);

routes.post('/appointments', authMiddleware, AppointmentController.store);
routes.get('/appointments', authMiddleware, AppointmentController.index);
routes.delete(
  '/appointments/:id',
  authMiddleware,
  AppointmentController.delete
);

routes.get('/schedules', authMiddleware, ScheduleController.index);

routes.get('/notifications', authMiddleware, NotificationController.index);
routes.put('/notifications/:id', authMiddleware, NotificationController.update);

routes.get('/providers/:provider_id/available', AvailableController.index);

export default routes;
