const express = require("express");

const {
  getSchedule,
  updateSchedule
} = require("../controllers/scheduleController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getSchedule);

router.put("/", authMiddleware, updateSchedule);

module.exports = router;