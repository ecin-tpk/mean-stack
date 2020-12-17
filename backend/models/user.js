const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  },
  password: { type: String },
  facebook: {
    id: {
      type: String,
    },
    email: {
      type: String,
    },
    token: {
      type: String,
    },
    select: false,
  },
});

// Add unique validator to check user email
userSchema.plugin(uniqueValidator);

// Create new user if user doesn't exist
userSchema.statics.upsertFacebookUser = (
  accessToken,
  refreshToken,
  profile,
  cb
) => {
  const that = this;
  return this.findOne({
    "facebook.id": profile.id,
  }).then((err, user) => {
    // No user was found, create new one
    if (!user) {
      const newUser = new that({
        // email: profile.email[0].value,
        facebook: {
          id: profile.id,
          email: profile.email[0].value,
          token: accessToken,
        },
      });

      newUser.save().then((err, savedUser) => {
        if (err) {
          console.log(err);
        }
        return cb(err, savedUser);
      });
    } else {
      return cb(err, user);
    }
  });
};

module.exports = mongoose.model("User", userSchema);
