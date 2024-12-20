import request from "supertest";
import express from "express";
import urlRouter from "../../routes/url.router.js";
import passport from "passport";
import { Url } from "../../models/url.model.js";
import { getFromCache } from "../../utils/cache/cache.utils.js";

jest.mock("../../db/redisClient.js");
jest.mock("../../models/url.model.js");
jest.mock("../../utils/cache/cache.utils.js");

const app = express();
app.use(express.json());
app.use("/api", urlRouter);

// Mock Passport authentication middleware
jest
  .spyOn(passport, "authenticate")
  .mockImplementation((strategy, options, callback) => (req, res, next) => {
    req.isAuthenticated = jest.fn(() => true); // Simulate user is authenticated
    req.user = { id: "user123" }; // Mock user
    next();
  });

describe("POST /api/shorten", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    passport.authenticate.mockImplementationOnce(
      (strategy, options, callback) => (req, res, next) => {
        req.isAuthenticated = jest.fn(() => false); // Simulate unauthenticated user
        next();
      }
    );

    const response = await request(app).post("/api/shorten").send({
      longUrl: "https://example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Unauthorized");
  });

  it("should return 400 if request body validation fails", async () => {
    const response = await request(app).post("/api/shorten").send({
      longUrl: "", // Invalid URL
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("should create a short URL successfully", async () => {
    Url.findOne.mockResolvedValueOnce(null); // Simulate no custom alias exists
    Url.create.mockResolvedValueOnce({
      longUrl: "https://example.com",
      shortUrl: "short_url/abc123",
      createdAt: new Date(),
    });

    const response = await request(app).post("/api/shorten").send({
      longUrl: "https://example.com",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("data.shortUrl", "short_url/abc123");
  });

  it("should return 500 if custom alias already exists", async () => {
    Url.findOne.mockResolvedValueOnce({ customAlias: "abc123" });

    const response = await request(app).post("/api/shorten").send({
      longUrl: "https://example.com",
      customAlias: "abc123",
    });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty(
      "message",
      "Custom alias is already in use."
    );
  });
});

describe("GET /api/shorten/:alias", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log analytics and redirect to the original URL", async () => {
    getFromCache.mockResolvedValueOnce(null); // Simulate no cache
    Url.findOne.mockResolvedValueOnce({
      customAlias: "abc123",
      longUrl: "https://example.com",
    });

    const response = await request(app).get("/api/shorten/abc123");

    expect(response.status).toBe(301);
    expect(response.header.location).toBe("https://example.com");
  });

  it("should return 404 if alias is not found", async () => {
    getFromCache.mockResolvedValueOnce(null); // Simulate no cache
    Url.findOne.mockResolvedValueOnce(null); // Simulate no database record

    const response = await request(app).get("/api/shorten/nonexistent");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      "Short URL alias not found"
    );
  });

  it("should return 500 if an error occurs", async () => {
    getFromCache.mockRejectedValueOnce(new Error("Redis error"));

    const response = await request(app).get("/api/shorten/abc123");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Redis error");
  });
});
