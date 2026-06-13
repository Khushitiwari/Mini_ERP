const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
