const express = require("express");
const NibssController = require("../Controllers/NibssController");
const { protect } = require("../Middleware/customerAuth");

const router = express.Router();

router.post("/onboard", NibssController.onboardFintech);
router.post("/token", NibssController.getToken);
router.post("/account", protect, NibssController.createAccount);
router.post("/accounts",  NibssController.getAllAccounts);
router.get("/my-accounts", protect, NibssController.getMyAccounts);
router.post("/validate-bvn", protect, NibssController.validateBvn);
router.post("/name-enquiry", NibssController.nameEnquiry);
router.post("/transfer",protect, NibssController.transfer);
router.post("/transfer-status", NibssController.getTransferStatus);
router.post("/insert-bvn", NibssController.insertBvn);
router.post("/account-balance", protect, NibssController.getAccountBalance);
router.post("/insert-nin", NibssController.insertNin);
router.post("/validate-nin",protect, NibssController.validateNin);

module.exports = router;