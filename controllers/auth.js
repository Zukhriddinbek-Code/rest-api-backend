const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        name: name,
        password: hashPassword,
      });
      return user.save();
    })
    .then((response) => {
      res
        .status(201)
        .json({ message: "User created successfully", userId: response._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error(
          "Failed to find a user with this email address!"
        );
        error.statusCode = 401;
        throw error;
      }
      loadedUser = userDoc;
      return bcrypt.compare(password, userDoc.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};
