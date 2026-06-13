import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import env from '../config/env.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, address, mobile, photo } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(Object.assign(new Error('Email already registered'), { statusCode: 400 }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, address, mobile, photo },
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

    await logAudit(req.user.id, 'CREATE', 'User', user.id, null, user);

    return successResponse(res, user, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
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

    const token = jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, { expiresIn: '24h' });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      mobile: user.mobile,
      photo: user.photo,
      createdAt: user.createdAt,
    };

    return successResponse(res, { user: userData, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};
