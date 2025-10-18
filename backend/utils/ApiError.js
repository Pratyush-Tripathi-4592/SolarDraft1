class ApiError extends Error {
  constructor(statusCode, message, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
    return new ApiError(400, message, errorCode);
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message = 'Conflict', errorCode = 'CONFLICT') {
    return new ApiError(409, message, errorCode);
  }

  static validationError(message = 'Validation failed', errorCode = 'VALIDATION_ERROR') {
    return new ApiError(422, message, errorCode);
  }

  static internalServerError(message = 'Internal Server Error', errorCode = 'INTERNAL_SERVER_ERROR') {
    return new ApiError(500, message, errorCode);
  }
}

module.exports = ApiError;
