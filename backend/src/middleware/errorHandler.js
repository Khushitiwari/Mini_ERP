import { errorResponse } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return errorResponse(res, message, statusCode);
};

export default errorHandler;
