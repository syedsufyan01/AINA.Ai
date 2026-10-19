export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`
    }
  });
}

export function errorHandler(err, req, res, next) {
  console.error('Unhandled API Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An internal server error occurred.';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
}
