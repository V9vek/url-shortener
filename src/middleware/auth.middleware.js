import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const isUserAuthenticated = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
});
