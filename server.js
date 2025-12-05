require("dotenv").config();
const express = require("express");
const passportGoogle = require("./google");
const passportApple = require("./apple");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(passportGoogle.initialize());
app.use(passportApple.initialize());

// GOOGLE ROUTES
app.get("/auth/google", passportGoogle.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passportGoogle.authenticate("google", { session: false }),
  (req, res) => {
    res.send(`Welcome ${req.user.name}, Email: ${req.user.email}`);
  }
);

// APPLE ROUTES
app.get("/auth/apple", passportApple.authenticate("apple"));

app.post(
  "/auth/apple/callback",
  passportApple.authenticate("apple", { session: false }),
  (req, res) => {
    res.send(`Welcome ${req.user.name}, Email: ${req.user.email}`);
  }
);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
