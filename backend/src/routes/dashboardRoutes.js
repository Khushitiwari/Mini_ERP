import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/summary', dashboardController.getDashboardSummary);

export default router;
