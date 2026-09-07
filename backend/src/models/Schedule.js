const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
  {
    subjects: {
      type: [String],
      default: ["", "", "", "", ""]
    }
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    monday: {
      type: daySchema,
      default: () => ({})
    },

    tuesday: {
      type: daySchema,
      default: () => ({})
    },

    wednesday: {
      type: daySchema,
      default: () => ({})
    },

    thursday: {
      type: daySchema,
      default: () => ({})
    },

    friday: {
      type: daySchema,
      default: () => ({})
    },

    saturday: {
      type: daySchema,
      default: () => ({})
    },

    sunday: {
      type: daySchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);