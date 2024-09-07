class CustomError extends Error {
  constructor(message?: string, cause?: string) {
    super(message);
    this.name = 'CustomError';

    this.cause = cause; // Assign cause to the error object
  }
}
