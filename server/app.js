const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const urlRoutes = require("./routes/urlRoutes");

const app = express();

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/url", urlRoutes);

module.exports = app;
