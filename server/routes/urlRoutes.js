const express = require("express");
const router = express.Router();

const {
  shortenUrl,
  redirectUrl,
  getUrlStats
} = require("../controllers/urlController");

router.post("/shorten", shortenUrl);
router.get("/:shortCode", redirectUrl);
router.get("/:shortCode/stats", getUrlStats);

module.exports = router;

