const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');
const { logAudit } = require('../middleware/auditLogger');

const getVendors = async (req, res, next) => {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { name: 'asc' } });
    return successResponse(res, vendors, 'Vendors retrieved');
  } catch (err) {
    next(err);
  }
};

const getVendorById = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { purchaseOrders: true },
    });

    if (!vendor) {
      return next(Object.assign(new Error('Vendor not found'), { statusCode: 404 }));
    }

    return successResponse(res, vendor, 'Vendor retrieved');
  } catch (err) {
    next(err);
  }
};

const createVendor = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.create({ data: req.body });

    await logAudit(req.user.id, 'CREATE', 'Vendor', vendor.id, null, vendor);

    return successResponse(res, vendor, 'Vendor created', 201);
  } catch (err) {
    next(err);
  }
};

const updateVendor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldVendor = await prisma.vendor.findUnique({ where: { id } });
    if (!oldVendor) {
      return next(Object.assign(new Error('Vendor not found'), { statusCode: 404 }));
    }

    const vendor = await prisma.vendor.update({ where: { id }, data: req.body });

    await logAudit(req.user.id, 'UPDATE', 'Vendor', vendor.id, oldVendor, vendor);

    return successResponse(res, vendor, 'Vendor updated');
  } catch (err) {
    next(err);
  }
};

const deleteVendor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldVendor = await prisma.vendor.findUnique({ where: { id } });
    if (!oldVendor) {
      return next(Object.assign(new Error('Vendor not found'), { statusCode: 404 }));
    }

    await prisma.vendor.delete({ where: { id } });

    await logAudit(req.user.id, 'DELETE', 'Vendor', id, oldVendor, null);

    return successResponse(res, null, 'Vendor deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};
