import mongoose, { Schema } from "mongoose";

const UrlSchema = new Schema(
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
    customAlias: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to the user who created the URL
    topic: {
      type: String,
      enum: ["acquisition", "activation", "retention", null],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Url = mongoose.model("Url", UrlSchema);
