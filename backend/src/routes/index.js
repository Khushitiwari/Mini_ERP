import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import customerRoutes from './customerRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import bomRoutes from './bomRoutes.js';
import salesOrderRoutes from './salesOrderRoutes.js';
import purchaseOrderRoutes from './purchaseOrderRoutes.js';
import manufacturingOrderRoutes from './manufacturingOrderRoutes.js';
import stockRoutes from './stockRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/vendors', vendorRoutes);
router.use('/bom', bomRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/manufacturing-orders', manufacturingOrderRoutes);
router.use('/stock', stockRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditLogRoutes);

export default router;
