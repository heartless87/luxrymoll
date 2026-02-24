import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(new GoogleStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: "https://luxrymoll.vercel.app/api/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    const user = {
      name: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos[0]?.value
    };

    console.log("User Name:", user.name);
    console.log("User Email:", user.email);
    console.log("User Photo:", user.photo);

    return done(null, user);
  }
));
