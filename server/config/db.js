const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing. Please define it in your .env file or environment settings.");
    }
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message || err);
  }
};

module.exports = connectDB;
