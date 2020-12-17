const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const passport = require("passport");
const facebookTokenStrategy = require("passport-facebook-token");

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: "1768528436659010",
//       clientSecret: "8758fad77e6e3eec5aa9c5aa9369681b",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       User.upsertFacebookUser(accessToken, refreshToken, profile).then(
//         (err, user) => {
//           return done(err, user);
//         }
//       );
//     }
//   )
// );

passport.use(
  "facebookToken",
  new facebookTokenStrategy(
    {
      clientID: "1768528436659010",
      clientSecret: "8758fad77e6e3eec5aa9c5aa9369681b",
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
        //
        // await newUser.save();
        // done(null, newUser);
      } catch (error) {
        // done(error, false);
        done(error, null);
      }
    }
  )
);

// POST: Sign up
router.post("/signup", (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
});

// POST: Login
router.post("/login", (req, res) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }
      const token = jwt.sign(
        {
          email: fetchedUser.email,
          userId: fetchedUser._id,
        },
        "jhwhahohio2na2hj23jksadasd",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        name: fetchedUser.name,
      });
    })
    .catch(() => {
      return res.status(401).json({
        message: "Authentication failed",
      });
    });
});

// POST: Login with facebook
router.post(
  "/auth/facebook",
  passport.authenticate("facebookToken", { session: false }),
  (req, res) => {
    if (!req["user"]) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const token = jwt.sign(
      {
        email: req["user"].email,
        userId: req["user"]._id,
      },
      "jhwhahohio2na2hj23jksadasd",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: req["user"]._id,
      name: req["user"].name,
    });

    // req.token = createToken(req.user);
    // res.setHeader("x-auth-token", req.token);
    // res.status(200).json(req.token);
  }
);

// PUT: Update account
router.put("/update", (req, res, next)=>{

})

module.exports = router;
