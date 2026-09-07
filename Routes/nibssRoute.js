// const express = require("express");
// const NibssController = require("../Controllers/NibssController");
// const { protect } = require("../Middleware/customerAuth");

// const router = express.Router();

// router.post("/onboard", NibssController.onboardFintech);
// router.post("/token", NibssController.getToken);
// router.post("/account", protect, NibssController.createAccount);
// router.post("/accounts",  NibssController.getAllAccounts);
// router.get("/my-accounts", protect, NibssController.getMyAccounts);
// router.post("/validate-bvn", protect, NibssController.validateBvn);
// router.post("/name-enquiry", NibssController.nameEnquiry);
// router.post("/transfer",protect, NibssController.transfer);
// router.post("/transfer-status", NibssController.getTransferStatus);
// router.post("/insert-bvn", NibssController.insertBvn);
// router.post("/account-balance", protect, NibssController.getAccountBalance);
// router.post("/insert-nin", NibssController.insertNin);
// router.post("/validate-nin",protect, NibssController.validateNin);

// module.exports = router;

const express = require("express");
const router = express.Router();

const NibssController = require("../Controllers/NibssController");
const { protect } = require("../Middleware/authMiddleware");


// ======================================================
// INTERNAL / SETUP ROUTES
// ======================================================

// Fintech onboarding
router.post(
    "/onboard",
    NibssController.onboardFintech
);

// NIBSS token generation
// Backend/setup use only
router.post(
    "/token",
    NibssController.getToken
);


// ======================================================
// CUSTOMER ACCOUNT ROUTES
// ======================================================

// Create bank account
router.post(
    "/account",
    protect,
    NibssController.createAccount
);


// Get authenticated customer's accounts
router.get(
    "/my-accounts",
    protect,
    NibssController.getMyAccounts
);


// Get account balance
router.get(
    "/accounts/:accountNumber/balance",
    protect,
    NibssController.getAccountBalance
);


// ======================================================
// CUSTOMER BVN ROUTES
// ======================================================

// Register BVN
router.post(
    "/insert-bvn",
    protect,
    NibssController.insertBvn
);


// Validate BVN
router.post(
    "/validate-bvn",
    protect,
    NibssController.validateBvn
);


// ======================================================
// CUSTOMER NIN ROUTES
// ======================================================

// Register NIN
router.post(
    "/insert-nin",
    protect,
    NibssController.insertNin
);


// Validate NIN
router.post(
    "/validate-nin",
    protect,
    NibssController.validateNin
);


// ======================================================
// CUSTOMER TRANSFER ROUTES
// ======================================================

// Account name enquiry
router.post(
    "/name-enquiry",
    protect,
    NibssController.nameEnquiry
);


// Transfer money
router.post(
    "/transfer",
    protect,
    NibssController.transfer
);


// Check transfer status
router.post(
    "/transfer-status",
    protect,
    NibssController.getTransferStatus
);


// ======================================================
// INTERNAL ACCOUNT ROUTES
// ======================================================

// Get all NIBSS accounts
// Not intended for normal customer dashboard use
router.post(
    "/accounts",
    protect,
    NibssController.getAllAccounts
);


module.exports = router;