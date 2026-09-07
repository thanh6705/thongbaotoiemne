require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const scheduleRoutes = require("./src/routes/scheduleRoutes");
const pushRoutes = require("./src/routes/pushRoutes");
const { startNotificationJobs } = require("./src/jobs/notificationJob");

const app = express();

connectDB().then(() => {
  startNotificationJobs();
});

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Daily Reminder API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/push", pushRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});