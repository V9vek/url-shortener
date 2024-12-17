import { Router } from "express";
import passport from "passport";

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: "Authenticate with Google"
 *     description: "Redirects the user to Google OAuth2 authentication page."
 *     tags:
 *       - Google Oauth
 *     security:
 *       - sessionCookie: []  # Requires session authentication to be set (connect.sid cookie)
 *     responses:
 *       302:
 *         description: "Redirecting to Google authentication"
 *       500:
 *         description: "Internal server error"
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: "Google OAuth2 callback"
 *     description: "Handles the callback from Google after successful authentication."
 *     tags:
 *       - Google Oauth
 *     security:
 *       - sessionCookie: []  # Requires session authentication to be set (connect.sid cookie)
 *     responses:
 *       200:
 *         description: "Successfully authenticated with Google"
 *       401:
 *         description: "Unauthorized, failed authentication with Google"
 *       500:
 *         description: "Internal server error"
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: "Log out the user"
 *     description: "Logs the user out, destroys the session, and clears the session cookie."
 *     tags:
 *       - Google Oauth
 *     security:
 *       - sessionCookie: []  # Requires session authentication to be set (connect.sid cookie)
 *     responses:
 *       200:
 *         description: "Successfully logged out"
 *       500:
 *         description: "Internal server error while logging out"
 */
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err)
      return res.status(500).json({ success: false, message: "Logout failed" });

    // destroy session in redis
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

export default router;
