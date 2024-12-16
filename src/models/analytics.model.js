import mongoose, { Schema } from "mongoose";

const AnalyticsSchema = new Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShortUrl",
    required: true,
  }, // Reference to the short URL
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
    required: true,
  }, // User's IP address
  userAgent: {
    type: String,
    required: true,
  }, // User's browser/user-agent string
  osType: {
    type: String,
    required: true,
  }, // OS (e.g., Windows, macOS, Linux, Android)
  deviceType: {
    type: String,
    required: true,
  }, // Device type (e.g., mobile, desktop)
  geolocation: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
  },
});

// Faster access
AnalyticsSchema.index({ urlId: 1, ip: 1, osType: 1, deviceType: 1 }); 

export const Analytics = mongoose.model("Analytics", AnalyticsSchema);
