import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import * as analyticsService from "../../services/analytics.service.js"

export const getAnalyticsByAlias = asyncHandler(async (req, res) => {
  const { alias } = req.params;

  try {
    const analytics = await analyticsService.getAnalyticsByAlias(alias);
    res.json(
      new ApiResponse(200, analytics, "Analytics fetched successfully.")
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

export const getAnalyticsByTopic = asyncHandler(async (req, res) => {
  const { topic } = req.params;

  try {
    const analytics = await analyticsService.getAnalyticsByTopic(topic);
    res.json(
      new ApiResponse(200, analytics, "Analytics fetched successfully.")
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

export const getOverallAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const analytics = await analyticsService.getOverallAnalytics(userId);
    res.json(
      new ApiResponse(200, analytics, "Analytics fetched successfully.")
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});
