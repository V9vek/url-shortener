import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../../models/user.model.js";

const callbackURL =
  process.env.NODE_ENV === "production"
    ? "https://url-shortener-mtoc.onrender.com/auth/google/callback"
    : "http://localhost:8000/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret",
      callbackURL: callbackURL, // Redirect URI
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // if user already exists
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // If not, create a new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }
        done(null, user); // Pass the user to Passport
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize user ID into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
