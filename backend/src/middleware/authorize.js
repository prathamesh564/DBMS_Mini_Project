/**
 * Middleware factory for Role-Based Access Control (RBAC)
 * @param  {...string} roles - Allowed roles (e.g., 'woman', 'training_provider', 'employer', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    // Administrator always has access to all protected resources
    if (req.user.role === 'admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of [${roles.join(', ')}] role. Current role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};
