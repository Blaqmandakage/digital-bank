// const jwt = require("jsonwebtoken");
// const Staff = require("../Models/Staff");

// exports.authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.staff.role)) {
//       return res.status(403).json({
//         message: "You are not authorized to access this resource",
//       });
//     }

//     next();
//   };
// };

// exports.protectStaff = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         message: "Not authorized, no token",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const staff = await Staff.findById(decoded.id);

//     if (!staff) {
//       return res.status(401).json({
//         message: "Staff not found",
//       });
//     }

//     if (!staff.isActive) {
//       return res.status(403).json({
//         message: "Staff account is inactive",
//       });
//     }

//     req.staff = staff;

//     next();
//   } catch (error) {
//     console.error("Staff authentication error:", error);

//     return res.status(401).json({
//       message: "Not authorized, invalid token",
//     });
//   }
// };

const jwt = require("jsonwebtoken");
const Staff = require("../Models/Staff");

exports.protectStaff = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const staff = await Staff.findById(decoded.id);

    if (!staff) {
      return res.status(401).json({
        message: "Staff not found",
      });
    }

    if (!staff.isActive) {
      return res.status(403).json({
        message: "Staff account is inactive",
      });
    }

    req.staff = staff;

    next();
  } catch (error) {
    console.error("Staff authentication error:", error);

    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.staff || !roles.includes(req.staff.role)) {
      return res.status(403).json({
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
};