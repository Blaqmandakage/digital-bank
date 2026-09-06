const jwt = require("jsonwebtoken");
const Customer = require("../Models/Customer");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(401).json({
        message: "Customer not found",
      });
    }

    req.customer = customer;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};
