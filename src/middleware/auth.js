import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js";

export const isUserAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      return next();
    }
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }
});
