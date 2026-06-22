const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true
    },
    ip: {
      type: String,
      default: ""
    },
    country: {
      type: String,
      default: "Unknown"
    },
    device: {
      type: String,
      default: "Desktop"
    },
    browser: {
      type: String,
      default: "Unknown"
    },
    referrer: {
      type: String,
      default: "Direct"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Click", clickSchema);
