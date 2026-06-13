const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    success: false,
    data,
    message,
  });
};

module.exports = { successResponse, errorResponse };
