const express = require("express");
const customerController = require("../Controllers/customerController");
const { protect } = require("../Middleware/customerAuth");

const router = express.Router();

router.post("/register", customerController.register);
router.post("/login", customerController.login);
router.get("/profile", protect, customerController.getProfile);


module.exports = router;