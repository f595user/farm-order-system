module.exports = {
  // Ensure user is authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Please log in to access this resource' });
  },
  
  // Ensure user is an admin
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Access denied. Admin privileges required' });
  },
  
  // Ensure user is the owner of the resource or an admin
  ensureOwnerOrAdmin: function(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.role === 'admin' || req.user._id.toString() === req.params.userId) {
        return next();
      }
    }
    res.status(403).json({ message: 'Access denied. You do not have permission to access this resource' });
  }
};
