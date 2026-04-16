export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
     

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please login.",
        });
      }

      const userRole = req.user.role?.toLowerCase();


      const roles = allowedRoles.map(role => role.toLowerCase());


      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(", ")}`,
        });
      }

      next();
      
    } catch (error) {
      console.log("checkRole middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Role verification failed",
      });
    }
  };
};