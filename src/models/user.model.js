import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", UserSchema)
