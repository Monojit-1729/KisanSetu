/**
 * Middleware to enforce role-based access control.
 * Supports usage: requireRole('farmer'), requireRole('farmer', 'fpo'), requireRole(['buyer', 'admin'])
 */
export const requireRole = (...allowedRoles) => {
  const flattenedRoles = allowedRoles.flat().map((r) => (r || '').toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required prior to role verification.',
      });
    }

    const userRole = (req.user.role || '').toLowerCase();

    if (!flattenedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted. Requires role [${flattenedRoles.join(', ')}], but current user role is '${userRole}'.`,
      });
    }

    next();
  };
};

export default requireRole;
