const User = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const bcrypt = require("bcrypt");

// Create user
exports.createUser = (req, res) => {
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
      .catch(() => {
        res.status(500).json({
          message: "Email is already taken",
        });
      });
  });
};

// Email login
exports.emailLogin = (req, res) => {
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
        config.jwt_secret,
        { expiresIn: "3m" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 180,
        userId: fetchedUser._id,
        name: fetchedUser.name,
        email: fetchedUser.email,
        type: "email",
      });
    })
    .catch(() => {
      return res.status(401).json({
        message: "Authentication failed",
      });
    });
};

// Facebook login
exports.facebookLogin = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const token = jwt.sign(
    {
      email: req["user"].email,
      userId: req["user"]._id,
    },
    config.jwt_secret,
    { expiresIn: "3m" }
  );
  res.status(200).json({
    token: token,
    expiresIn: 180,
    userId: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};

// Google login
exports.googleLogin = (req, res) => {
  User.findOne({ "google.id": req.body.id }).then((user) => {
    let userToReturn;
    if (!user) {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        google: {
          id: req.body.id,
          email: req.body.email,
          token: req.body.idToken,
        },
      });
      newUser.save().then((userData) => {
        userToReturn = userData;

        const token = jwt.sign(
          {
            email: userToReturn.email,
            userId: userToReturn._id,
          },
          config.jwt_secret,
          { expiresIn: "3m" }
        );
        res.status(200).json({
          token: token,
          expiresIn: 180,
          userId: userToReturn._id,
          name: userToReturn.name,
          email: userToReturn.email,
        });
      });
    } else {
      userToReturn = user;

      const token = jwt.sign(
        {
          email: userToReturn.email,
          userId: userToReturn._id,
        },
        config.jwt_secret,
        { expiresIn: "3m" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 180,
        userId: userToReturn._id,
        name: userToReturn.name,
        email: userToReturn.email,
      });
    }
  });
};

// Update user
exports.updateUser = (req, res) => {
  const user = new User({
    _id: req.userData.userId,
    name: req.body.name,
  });

  User.updateOne({ _id: req.userData.userId }, user)
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: "Updated account successfully",
        });
      } else {
        res.status(401).json({
          message: "Not authorized",
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: "Failed to update account",
      });
    });
};

// Change password
exports.changePassword = (req, res) => {
  // if(req.newPassword !== req.confirmPassword){
  //   res.status(400).json({
  //     message: "Password not match"
  //   })
  // }
  console.log(req.body);

  User.findOne({ _id: req.userData.userId })
    .then((user) => {
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(400).json({
          message: "Wrong password",
        });
      }

      bcrypt.hash(req.body.newPassword, 10).then((hash) => {
        const user = new User({
          _id: req.userData.userId,
          password: hash,
        });
        User.updateOne({ _id: req.userData.userId }, user)
          .then((result) => {
            if (result.n > 0) {
              res.status(200).json({
                message: "Password changed successfully",
              });
            } else {
              res.status(401).json({
                message: "Not authorized",
              });
            }
          })
          .catch(() => {
            res.status(500).json({
              message: "Failed to change password",
            });
          });
      });
    });
};
