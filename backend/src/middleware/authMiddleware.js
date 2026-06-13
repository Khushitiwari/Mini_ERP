const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { errorResponse } = require('../utils/apiResponse');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return errorResponse(res, 'User not found', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

module.exports = authMiddleware;
