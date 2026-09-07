const express = require("express");

const {
  saveSubscription,
  sendTestNotification
} = require("../controllers/pushController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/subscribe",
  authMiddleware,
  saveSubscription
);

router.post(
  "/test",
  authMiddleware,
  sendTestNotification
);

module.exports = router;