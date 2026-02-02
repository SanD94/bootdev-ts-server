

// 400
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 401
export class UserNotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 403
export class UserForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 404
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ChirpTooLongError extends BadRequestError {
  constructor(message: string) {
    super(message);
  }
}
