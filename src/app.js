import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./controllers/auth/google.js"; // Passport Google Strategy
import { RedisStore } from "connect-redis";
import redisClient from "./db/redisClient.js";

const app = express();

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// store session in redis
const sessionStore = new RedisStore({ client: redisClient });

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//routes
import authRouter from "./routes/auth.router.js";
import urlRouter from "./routes/url.router.js";
import analyticsRouter from "./routes/analytics.router.js";
import { isUserAuthenticated } from "./middleware/auth.middleware.js";

app.use("/auth", authRouter);

app.get("/dashboard", isUserAuthenticated, (req, res) => {
  res.send("Welcome to the URL Shortener, Check out the docs at /docs endpoint");
});

app.use("/api", urlRouter);
app.use("/api/analytics", analyticsRouter);

export { app };
