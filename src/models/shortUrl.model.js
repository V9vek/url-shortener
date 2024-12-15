import mongoose, { Schema } from "mongoose";

const ShortUrlSchema = new Schema(
  {
    longUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      unique: true,
      required: true,
    },
    alias: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to the user who created the URL
    topic: {
      type: String,
      enum: ["acquisition", "activation", "retention"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ShortUrl = mongoose.model("ShortUrl", ShortUrlSchema);
