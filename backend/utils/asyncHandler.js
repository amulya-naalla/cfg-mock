// Wraps an async route handler so a rejected promise reaches Express's error
// middleware via next(err) instead of crashing the process (Express 4 does not
// catch async errors on its own).
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
