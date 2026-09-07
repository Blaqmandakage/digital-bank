
const express = require("express");
const router = express.Router();

const staffController = require("../Controllers/StaffController");
const {
    protectStaff,
    authorizeRoles
} = require("../Middleware/staffAuth");

// ======================================================
// STAFF AUTHENTICATION
// ======================================================

// Staff login
router.post(
    "/login",
    staffController.loginStaff
);


// ======================================================
// STAFF CREATION
// ======================================================

// Create normal staff
// Admin and Super Admin only
router.post(
    "/register",
    protectStaff,
    authorizeRoles("admin", "super_admin"),
    staffController.registerStaff
);


// Create admin
// Super Admin only
router.post(
    "/admins",
    protectStaff,
    authorizeRoles("super_admin"),
    staffController.createAdmin
);


// ======================================================
// CUSTOMER INFORMATION
// ======================================================

// Get all customers
router.get(
    "/customers",
    protectStaff,
    authorizeRoles(
        "staff",
        "admin",
        "super_admin"
    ),
    staffController.getCustomers
);


// Get customer's accounts
router.get(
    "/customers/:customerId/accounts",
    protectStaff,
    authorizeRoles(
        "staff",
        "admin",
        "super_admin"
    ),
    staffController.getCustomerAccounts
);


// Get customer's transactions
router.get(
    "/customers/:customerId/transactions",
    protectStaff,
    authorizeRoles(
        "staff",
        "admin",
        "super_admin"
    ),
    staffController.getCustomerTransactions
);


// Get customer's balance
// NIBSS token is handled internally by the backend
router.get(
    "/customers/:customerId/balance",
    protectStaff,
    authorizeRoles(
        "staff",
        "admin",
        "super_admin"
    ),
    staffController.getCustomerAccountBalance
);


// Get individual transaction
router.get(
    "/transactions/:transactionId",
    protectStaff,
    authorizeRoles(
        "staff",
        "admin",
        "super_admin"
    ),
    staffController.getTransactionById
);


// ======================================================
// STAFF MANAGEMENT
// ======================================================

// Get all staff
router.get(
    "/",
    protectStaff,
    authorizeRoles(
        "admin",
        "super_admin"
    ),
    staffController.getStaff
);


// Get staff by ID
router.get(
    "/:staffId",
    protectStaff,
    authorizeRoles(
        "admin",
        "super_admin"
    ),
    staffController.getStaffById
);


// Update staff information
// Admin can manage normal staff.
// Super Admin can manage staff and admins.
router.patch(
    "/:staffId",
    protectStaff,
    authorizeRoles(
        "admin",
        "super_admin"
    ),
    staffController.updateStaff
);


// Activate / deactivate staff
router.patch(
    "/:staffId/status",
    protectStaff,
    authorizeRoles(
        "admin",
        "super_admin"
    ),
    staffController.updateStaffStatus
);


// Change staff role
router.patch(
    "/:staffId/role",
    protectStaff,
    authorizeRoles(
        "admin",
        "super_admin"
    ),
    staffController.updateStaffRole
);


// Delete staff
router.delete(
    "/:staffId",
    protectStaff,
    authorizeRoles(
        "admin",
        "super_admin"
    ),
    staffController.deleteStaff
);


module.exports = router;