const express = require("express");
const passport = require("passport");
require("./google-auth/google-auth");
const app = express();
const session = require("express-session");
require("dotenv").config();

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

function isLoggedIn(req, res, next) {
  req.user ? next() : res.status(401);
}
app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
    passReqToCallback: true,
  })
);

app.get("/auth/google/success", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      const details = {
        firstName: user.name.givenName,
        lastName: user.name.familyName,
        email: user.email,
      };
      console.log(details);
      res.status(200).json({ user: { ...details } });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "An error occured for success" });
  }
});
app.get("/auth/google/failure", async (req, res) => {
  res.status(400).send({ message: "An error occured for failure" });
});

app.get("/error", (req, res) => res.send("Error logging in via Google.."));

app.get("/auth/google/signout", (req, res) => {
  try {
    res.status(200).send({ message: "user signed out" });
  } catch (err) {
    res.status(400).send({ message: "Failed to sign out user" });
  }
});

app.listen(3000, () => {
  console.log("listening");
});
