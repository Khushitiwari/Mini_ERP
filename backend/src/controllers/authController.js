import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import env from '../config/env.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(Object.assign(new Error('Invalid email or password'), { statusCode: 401 }));
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return next(Object.assign(new Error('Invalid email or password'), { statusCode: 401 }));
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      env.jwtSecret,
      { expiresIn: '8h' }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return successResponse(res, { token, user: userData }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        mobile: true,
        photo: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(Object.assign(new Error('Unauthorized'), { statusCode: 401 }));
    }

    return successResponse(res, user, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(Object.assign(new Error('Email already registered'), { statusCode: 400 }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: userSelect,
    });

    await logAudit(req.user.id, 'CREATE', 'User', user.id, null, user);

    return successResponse(res, user, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(res, users, 'Users retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return next(Object.assign(new Error('User not found'), { statusCode: 404 }));
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: userSelect,
    });

    await logAudit(req.user.id, 'UPDATE_ROLE', 'User', user.id, { role: existing.role }, { role: user.role });

    return successResponse(res, user, 'User role updated');
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.userId) {
      return next(Object.assign(new Error('Cannot delete your own account'), { statusCode: 400 }));
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return next(Object.assign(new Error('User not found'), { statusCode: 404 }));
    }

    await prisma.user.delete({ where: { id: userId } });

    await logAudit(req.user.id, 'DELETE', 'User', userId, existing, null);

    return successResponse(res, null, 'User deleted');
  } catch (err) {
    next(err);
  }
};
