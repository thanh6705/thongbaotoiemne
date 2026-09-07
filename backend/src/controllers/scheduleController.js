const Schedule = require("../models/Schedule");

// Lấy thời khóa biểu của user
const getSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findOne({
      userId: req.userId
    });

    // Nếu user chưa có thời khóa biểu
    if (!schedule) {
      schedule = await Schedule.create({
        userId: req.userId
      });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Get schedule error:", error);

    res.status(500).json({
      message: "Lỗi server"
    });
  }
};

// Tạo hoặc cập nhật thời khóa biểu
const updateSchedule = async (req, res) => {
  try {
    const {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
    } = req.body;

    const schedule = await Schedule.findOneAndUpdate(
      { userId: req.userId },
      {
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      message: "Cập nhật thời khóa biểu thành công",
      schedule
    });
  } catch (error) {
    console.error("Update schedule error:", error);

    res.status(500).json({
      message: "Lỗi server"
    });
  }
};

module.exports = {
  getSchedule,
  updateSchedule
};