

// 400
export class BadRequestError extends Error { }

// 401
export class UserNotAuthenticatedError extends Error { }

// 403
export class UserForbiddenError extends Error { }

// 404
export class NotFoundError extends Error { }

export class ChirpTooLongError extends BadRequestError { }
