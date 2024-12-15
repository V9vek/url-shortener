import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./controllers/auth/google.js"; // Passport Google Strategy

const app = express();

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//routes
import authRouter from "./routes/auth.router.js";

app.use("/auth", authRouter);

export { app };
