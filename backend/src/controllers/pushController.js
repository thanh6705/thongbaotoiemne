const webpush = require("web-push");
const User = require("../models/User");

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const saveSubscription = async (req, res) => {
  try {
    const subscription = req.body;

    if (
      !subscription ||
      !subscription.endpoint ||
      !subscription.keys
    ) {
      return res.status(400).json({
        message: "Push subscription không hợp lệ"
      });
    }

    const user = await User.findByIdAndUpdate(req.userId, {
      pushSubscription: subscription
    });

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản"
      });
    }

    res.json({
      message: "Đăng ký nhận thông báo thành công"
    });
  } catch (error) {
    console.error(
      "Save push subscription error:",
      error
    );

    res.status(500).json({
      message: "Lỗi server"
    });
  }
};

const sendTestNotification = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.pushSubscription) {
      return res.status(400).json({
        message:
          "Bạn chưa đăng ký nhận thông báo"
      });
    }

    const payload = JSON.stringify({
      title: "Daily Reminder 🔔",
      body: "Đây là thông báo thử nghiệm. Thành công rồi bro!"
    });

    await webpush.sendNotification(
      user.pushSubscription,
      payload
    );

    res.json({
      message: "Đã gửi notification thành công"
    });
  } catch (error) {
    console.error(
      "Send notification error:",
      error
    );

    // Subscription đã hết hạn / không còn hợp lệ
    if (
      error.statusCode === 404 ||
      error.statusCode === 410
    ) {
      await User.findByIdAndUpdate(req.userId, {
        pushSubscription: null
      });
    }

    res.status(500).json({
      message: "Không thể gửi notification"
    });
  }
};

module.exports = {
  saveSubscription,
  sendTestNotification
};