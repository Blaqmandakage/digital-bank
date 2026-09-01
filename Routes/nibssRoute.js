const express = require("express");
const NibssController = require("../Controllers/NibssController");

const router = express.Router();

router.post("/onboard", NibssController.onboardFintech);
router.post("/token", NibssController.getToken);
router.post("/account", NibssController.createAccount);
router.post("/accounts", NibssController.getAllAccounts);
router.post("/validate-bvn", NibssController.validateBvn);
router.post("/name-enquiry", NibssController.nameEnquiry);
router.post("/transfer", NibssController.transfer);
router.post("/transfer-status", NibssController.getTransferStatus);
router.post("/insert-bvn", NibssController.insertBvn);
router.post("/account-balance", NibssController.getAccountBalance);
router.post("/insert-nin", NibssController.insertNin);
router.post("/validate-nin", NibssController.validateNin);

module.exports = router;