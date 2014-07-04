/**
 * `HandlerError` error.
 *
 * @api private
 */
function HandlerError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'HandlerError';
  this.message = message;
}

/**
 * Inherit from `Error`.
 */
HandlerError.prototype.__proto__ = Error.prototype;


/**
 * Expose `HandlerError`.
 */
module.exports = HandlerError;
