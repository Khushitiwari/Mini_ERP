const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const customerRoutes = require('./customerRoutes');
const vendorRoutes = require('./vendorRoutes');
const bomRoutes = require('./bomRoutes');
const salesOrderRoutes = require('./salesOrderRoutes');
const purchaseOrderRoutes = require('./purchaseOrderRoutes');
const manufacturingOrderRoutes = require('./manufacturingOrderRoutes');
const stockRoutes = require('./stockRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const auditLogRoutes = require('./auditLogRoutes');

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

module.exports = router;
