const passport = require("passport");
const AppleStrategy = require("passport-apple");
const connectDB = require("./db");

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: process.env.APPLE_PRIVATE_KEY,
      callbackURL: process.env.APPLE_CALLBACK,
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      const users = await connectDB();

      const userData = {
        name: profile?.name?.firstName || "Apple User",
        email: profile.email,
        provider: "apple",
      };

      await users.insertOne(userData);
      return done(null, userData);
    }
  )
);

module.exports = passport;
