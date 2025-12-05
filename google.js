const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const connectDB = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      const users = await connectDB();

      const userData = {
        name: profile.displayName,
        email: profile.emails[0].value,
        provider: "google",
      };

      await users.insertOne(userData);
      return done(null, userData);
    }
  )
);

module.exports = passport;
