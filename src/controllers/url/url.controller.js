import { asyncHandler } from "../../utils/asyncHandler.js";
import { shortenUrlValidation } from "../../utils/url/shortenUrlValidation.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { createShortUrl } from "../../services/url.service.js";

export const shortenUrl = asyncHandler(async (req, res) => {
  const { longUrl, customAlias, topic } = req.body;

  // validate req body
  const { error } = shortenUrlValidation.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, error.details[0].message));
  }

  try {
    const url = await createShortUrl(longUrl, customAlias, topic, req.user.id);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          shortUrl: url.shortUrl,
          createdAt: url.createdAt,
        },
        "Short URL created successfully."
      )
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});
