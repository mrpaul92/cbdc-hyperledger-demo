const authMiddleware = async (req, res, next) => {
  req.user = {
    userId: "9046980048",
  };
  next();
};
module.exports = authMiddleware;
