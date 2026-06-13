import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch {
    return errorResponse(res, 'Unauthorized', 401);
  }
};

export default authMiddleware;
