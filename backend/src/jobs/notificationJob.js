const cron = require("node-cron");
const webpush = require("web-push");
const User = require("../models/User");
const Schedule = require("../models/Schedule");

const TIMEZONE = process.env.APP_TIMEZONE || "Asia/Ho_Chi_Minh";
const DAY_KEYS = {
  Sunday: "sunday",
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday"
};

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const getTodayKey = () => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: TIMEZONE
  }).format(new Date());

  return DAY_KEYS[weekday];
};

const clearExpiredSubscription = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    pushSubscription: null
  });
};

const sendToUser = async (user, payload) => {
  try {
    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      await clearExpiredSubscription(user._id);
      return;
    }

    console.error(`Push notification failed for user ${user._id}:`, error.message);
  }
};

const sendOutfitNotifications = async () => {
  const users = await User.find({
    pushSubscription: { $ne: null }
  }).select("pushSubscription");

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: TIMEZONE
  }).format(new Date());

  const isAoDaiDay = ["Monday", "Wednesday", "Friday"].includes(weekday);
  const isRegularUniformDay = ["Tuesday", "Thursday", "Saturday"].includes(weekday);

  if (!isAoDaiDay && !isRegularUniformDay) {
    return;
  }

  const body = isAoDaiDay
    ? "Mặc áo dài em nhé"
    : "Mặc đồng phục thường nhé";

  await Promise.all(
    users.map((user) => sendToUser(user, {
      title: "Nhắc mặc đồng phục",
      body
    }))
  );

  console.log(`Sent outfit notifications to ${users.length} user(s)`);
};

const sendScheduleNotifications = async () => {
  const users = await User.find({
    pushSubscription: { $ne: null }
  }).select("pushSubscription");
  const schedules = await Schedule.find({
    userId: { $in: users.map((user) => user._id) }
  }).lean();
  const schedulesByUserId = new Map(
    schedules.map((schedule) => [String(schedule.userId), schedule])
  );
  const dayKey = getTodayKey();

  await Promise.all(
    users.map((user) => {
      const subjects = (schedulesByUserId.get(String(user._id))?.[dayKey]?.subjects || [])
        .map((subject) => subject.trim())
        .filter(Boolean);
      const body = subjects.length > 0
        ? `Hôm nay bạn học: ${subjects.join(", ")}`
        : "Hôm nay bạn không có môn học nào.";

      return sendToUser(user, {
        title: "Thời khóa biểu hôm nay",
        body
      });
    })
  );

  console.log(`Sent schedule notifications to ${users.length} user(s)`);
};

const sendDinnerReminder = async () => {
  const users = await User.find({
    pushSubscription: { $ne: null }
  }).select("pushSubscription");

  await Promise.all(
    users.map((user) => sendToUser(user, {
      title: "Nhắc nhở ăn cơm",
      body: "ăn cơm chưa thiết phiến công chúa"
    }))
  );

  console.log(`Sent dinner reminders to ${users.length} user(s)`);
};

const startNotificationJobs = () => {
  cron.schedule("30 5 * * 1-6", () => {
    sendOutfitNotifications().catch((error) => {
      console.error("Outfit notification job failed:", error);
    });
  }, { timezone: TIMEZONE });

  cron.schedule("0 6 * * *", () => {
    sendScheduleNotifications().catch((error) => {
      console.error("Schedule notification job failed:", error);
    });
  }, { timezone: TIMEZONE });

  cron.schedule("0 19 * * *", () => {
    sendDinnerReminder().catch((error) => {
      console.error("Dinner reminder job failed:", error);
    });
  }, { timezone: TIMEZONE });

  console.log(`Notification jobs started with timezone ${TIMEZONE}`);
};

module.exports = {
  getTodayKey,
  sendOutfitNotifications,
  sendScheduleNotifications,
  sendDinnerReminder,
  startNotificationJobs
};
