import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import request from "supertest";
import app from "../../app.js";
import passport from "passport";

jest.mock("passport", () => {
  const originalPassport = jest.requireActual("passport");
  return {
    ...originalPassport,
    authenticate: jest.fn((strategy, options, callback) => {
      return (req, res, next) => {
        if (strategy === "google" && options.scope) {
          return next(); // Simulate successful Google authentication
        }
        if (callback) return callback(req, res, next); // Simulate callback
        next();
      };
    }),
  };
});

describe("Auth Routes", () => {
  describe("GET /auth/google", () => {
    test("should initiate Google OAuth flow", async () => {
      const response = await request(app).get("/auth/google");

      expect(response.statusCode).toBe(302); // 302 Redirect to Google
      expect(passport.authenticate).toHaveBeenCalledWith("google", {
        scope: ["profile", "email"],
      });
    });
  });

  describe("GET /auth/google/callback", () => {
    test("should handle Google OAuth callback success", async () => {
      passport.authenticate.mockImplementationOnce((strategy, options) => {
        return (req, res, next) => {
          req.user = { id: "123", email: "test@example.com" }; // Simulate a user object
          next();
        };
      });

      const response = await request(app).get("/auth/google/callback");

      expect(response.statusCode).toBe(302); // 302 Redirect
      expect(response.headers.location).toBe("/dashboard"); // Redirects to /dashboard
    });

    test("should handle Google OAuth callback failure", async () => {
      passport.authenticate.mockImplementationOnce((strategy, options) => {
        return (req, res, next) => {
          res.redirect("/");
        };
      });

      const response = await request(app).get("/auth/google/callback");

      expect(response.statusCode).toBe(302); // 302 Redirect
      expect(response.headers.location).toBe("/"); // Redirects to failureRedirect
    });
  });

  describe("GET /auth/logout", () => {
    test("should logout the user and destroy session", async () => {
      const mockDestroy = jest.fn((callback) => callback(null));

      const req = {
        logout: jest.fn((callback) => callback(null)),
        session: { destroy: mockDestroy },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      };

      const next = jest.fn();

      // Simulate calling the /auth/logout endpoint
      await request(app).get("/auth/logout");

      expect(req.logout).toHaveBeenCalled();
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith("connect.sid");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });

    test("should handle logout failure", async () => {
      const mockDestroy = jest.fn((callback) => callback(new Error("Error")));

      const req = {
        logout: jest.fn((callback) => callback(new Error("Logout failed"))),
        session: { destroy: mockDestroy },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await request(app).get("/auth/logout");

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Logout failed",
      });
    });
  });
});
