const { nanoid } = require("nanoid");
const axios = require("axios");
const Url = require("../models/Url");
const Click = require("../models/Click");

// Simple utility to validate if a string is a valid URL format
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

exports.shortenUrl = async (req, res) => {
  try {
    const { longUrl } = req.body;

    // Validate request body
    if (!longUrl) {
      return res.status(400).json({
        success: false,
        message: "Please provide a longUrl"
      });
    }

    // Validate URL format
    if (!isValidUrl(longUrl)) {
      return res.status(400).json({
        success: false,
        message: "Invalid longUrl format. Make sure to include http:// or https://"
      });
    }

    // Check if URL is already shortened and exists in database
    let urlEntry = await Url.findOne({ longUrl });
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    if (urlEntry) {
      return res.status(200).json({
        success: true,
        shortUrl: `${baseUrl}/api/url/${urlEntry.shortCode}`
      });
    }

    // Generate a unique short code using nanoid (6 characters)
    let shortCode = nanoid(6);
    let alreadyExists = await Url.findOne({ shortCode });
    
    // In the rare event of a collision, regenerate the code
    while (alreadyExists) {
      shortCode = nanoid(6);
      alreadyExists = await Url.findOne({ shortCode });
    }

    // Create and save new URL entry
    urlEntry = new Url({
      longUrl,
      shortCode
    });

    await urlEntry.save();

    res.status(201).json({
      success: true,
      shortUrl: `${baseUrl}/api/url/${urlEntry.shortCode}`
    });
  } catch (error) {
    console.error("Shorten URL error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while shortening URL"
    });
  }
};

const isLocalIp = (ip) => {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.20.") ||
    ip.startsWith("172.21.") ||
    ip.startsWith("172.22.") ||
    ip.startsWith("172.23.") ||
    ip.startsWith("172.24.") ||
    ip.startsWith("172.25.") ||
    ip.startsWith("172.26.") ||
    ip.startsWith("172.27.") ||
    ip.startsWith("172.28.") ||
    ip.startsWith("172.29.") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  );
};

const trackClick = async (urlId, req) => {
  try {
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const ip = rawIp.split(",")[0].trim();

    const ua = req.get("user-agent") || "";

    // Parse Device
    let device = "Desktop";
    if (/ipad|tablet/i.test(ua)) {
      device = "Tablet";
    } else if (/mobile|iphone|ipod|android/i.test(ua)) {
      device = "Mobile";
    }

    // Parse Browser
    let browser = "Unknown";
    if (/edg/i.test(ua)) {
      browser = "Edge";
    } else if (/opr/i.test(ua)) {
      browser = "Opera";
    } else if (/chrome|crios/i.test(ua)) {
      browser = "Chrome";
    } else if (/firefox|fxios/i.test(ua)) {
      browser = "Firefox";
    } else if (/safari/i.test(ua)) {
      browser = "Safari";
    }

    // Parse Referrer
    const referrerUrl = req.get("referer") || req.get("referrer") || "";
    let referrer = "Direct";
    if (referrerUrl) {
      try {
        referrer = new URL(referrerUrl).hostname;
      } catch (e) {
        referrer = referrerUrl;
      }
    }

    // Geolocation country lookup
    let country = "Unknown";
    if (ip && !isLocalIp(ip)) {
      try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 2000 });
        if (response.data && response.data.status === "success") {
          country = response.data.country || "Unknown";
        }
      } catch (err) {
        console.error("IP Geolocator Error:", err.message);
      }
    } else if (isLocalIp(ip)) {
      country = "Localhost";
    }

    const clickLog = new Click({
      urlId,
      ip,
      country,
      device,
      browser,
      referrer
    });

    await clickLog.save();
  } catch (err) {
    console.error("Failed to log click details:", err);
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Atomically increment clicks and retrieve url entry
    const url = await Url.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { returnDocument: "after" }
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL Not Found"
      });
    }

    // Track click asynchronously in the background
    trackClick(url._id, req);

    res.redirect(url.longUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred during redirect"
    });
  }
};

exports.getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL Not Found"
      });
    }

    const clicks = await Click.find({ urlId: url._id }).sort({ createdAt: -1 });

    // Aggregate statistics
    const stats = {
      countries: {},
      devices: {},
      browsers: {},
      referrers: {}
    };

    clicks.forEach((click) => {
      const country = click.country || "Unknown";
      const device = click.device || "Desktop";
      const browser = click.browser || "Unknown";
      const referrer = click.referrer || "Direct";

      stats.countries[country] = (stats.countries[country] || 0) + 1;
      stats.devices[device] = (stats.devices[device] || 0) + 1;
      stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;
      stats.referrers[referrer] = (stats.referrers[referrer] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      urlDetails: {
        longUrl: url.longUrl,
        shortCode: url.shortCode,
        totalClicks: url.clicks,
        createdAt: url.createdAt
      },
      stats,
      recentClicks: clicks.slice(0, 10).map((c) => ({
        ip: c.ip,
        country: c.country,
        device: c.device,
        browser: c.browser,
        referrer: c.referrer,
        timestamp: c.createdAt
      }))
    });
  } catch (error) {
    console.error("Get URL stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while retrieving URL statistics"
    });
  }
};

