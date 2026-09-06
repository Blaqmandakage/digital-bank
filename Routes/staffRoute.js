const express = require("express");
const staffController = require("../Controllers/StaffController");
const { protectStaff, authorizeRoles } = require("../Middleware/staffAuth");

const router = express.Router();

router.post(
  "/register",
  protectStaff,
  authorizeRoles("admin", "super_admin"),
  staffController.registerStaff
);

// router.post("/register", staffController.registerStaff);
router.post("/login", staffController.loginStaff);
router.post(
  "/admins",
  protectStaff,
  authorizeRoles("super_admin"),
  staffController.createAdmin,
);
// router.get(
//   "/test-auth",
//   protectStaff,
//   authorizeRoles("staff", "admin"),
//   (req, res) => {
//     res.status(200).json({
//       message: "Staff authorization successful",
//       staff: {
//         id: req.staff._id,
//         name: `${req.staff.firstName} ${req.staff.lastName}`,
//         role: req.staff.role,
//         department: req.staff.department,
//       },
//     });
//   }
// );
router.get(
  "/customers",
  protectStaff,
  authorizeRoles("staff", "admin"),
  staffController.getCustomers,
);
//get all accounts for a specific customer
router.get(
  "/customers/:customerId/accounts",
  protectStaff,
  authorizeRoles("staff", "admin"),
  staffController.getCustomerAccounts,
);
// get all transactions for a specific customer
router.get(
  "/customers/:customerId/transactions",
  protectStaff,
  authorizeRoles("staff", "admin"),
  staffController.getCustomerTransactions,
);
// get all transactions for a specific account of a specific customer
router.post(
  "/customers/:customerId/accounts/:accountNumber/balance",
  protectStaff,
  authorizeRoles("staff", "admin"),
  staffController.getCustomerAccountBalance,
);

router.get(
  "/transactions/:transactionId",
  protectStaff,
  authorizeRoles("staff", "admin"),
  staffController.getTransactionById,
);

router.patch(
  "/:staffId/status",
  protectStaff,
  authorizeRoles("admin", "super_admin"),
  staffController.updateStaffStatus
);

// router.patch(
//   "/:staffId/status",
//   protectStaff,
//   authorizeRoles("admin"),
//   staffController.updateStaffStatus,
// );
router.get(
  "/",
  protectStaff,
  authorizeRoles("admin", "super_admin"),
  staffController.getStaff
);
// router.get(
//   "/",
//   protectStaff,
//   authorizeRoles("staff", "admin"),
//   staffController.getStaff,
// );


router.get(
  "/:staffId",
  protectStaff,
  authorizeRoles("admin", "super_admin"),
  staffController.getStaffById
);

// router.get(
//   "/:staffId",
//   protectStaff,
//   authorizeRoles("staff", "admin"),
//   staffController.getStaffById,
// );

router.patch(
  "/:staffId",
  protectStaff,
  authorizeRoles("admin"),
  staffController.updateStaff,
);

// router.patch(
//   "/:staffId/role",
//   protectStaff,
//   authorizeRoles("admin"),
//   staffController.updateStaffRole
// );
router.patch(
  "/:staffId/role",
  protectStaff,
  authorizeRoles("admin", "super_admin"),
  staffController.updateStaffRole,
);

router.delete(
  "/:staffId",
  protectStaff,
  authorizeRoles("admin", "super_admin"),
  staffController.deleteStaff
);

// router.delete(
//   "/:staffId",
//   protectStaff,
//   authorizeRoles("admin"),
//   staffController.deleteStaff,
// );

module.exports = router;
