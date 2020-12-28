const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const config = require("../config/config");
const checkAuth = require("../middleware/check-auth");
const facebookTokenStrategy = require("passport-facebook-token");
const UserController = require("../controllers/user");

passport.use(
  "facebookToken",
  new facebookTokenStrategy(
    {
      clientID: config.facebook_client_id,
      clientSecret: config.facebook_client_secret,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ "facebook.id": profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = new User({
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0]?.value,
          facebook: {
            id: profile.id,
            email: profile.emails[0]?.value,
            token: accessToken,
          },
        });
        newUser.save().then((result) => {
          done(null, result);
        });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// POST: Sign up
router.post("/signup", UserController.createUser);

// POST: Email login
router.post("/login", UserController.emailLogin);

// POST: Login with facebook
router.post(
  "/auth/facebook",
  passport.authenticate("facebookToken", { session: false }, null),
  UserController.facebookLogin
);

// POST: Login with Google
router.post("/auth/google", UserController.googleLogin);

// PUT: Update name
router.put("/update", checkAuth, UserController.updateUser);

// PUT: Change password
router.put("/change-password");

module.exports = router;
