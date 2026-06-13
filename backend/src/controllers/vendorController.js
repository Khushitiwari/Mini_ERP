import prisma from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getVendors = async (req, res, next) => {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { name: 'asc' } });
    return successResponse(res, vendors, 'Vendors retrieved');
  } catch (err) {
    next(err);
  }
};

export const getVendorById = async (req, res, next) => {
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

export const createVendor = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.create({ data: req.body });

    await logAudit(req.user.id, 'CREATE', 'Vendor', vendor.id, null, vendor);

    return successResponse(res, vendor, 'Vendor created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateVendor = async (req, res, next) => {
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

export const deleteVendor = async (req, res, next) => {
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
