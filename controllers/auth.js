const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "secretkey",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error("Could not find user status!");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ status: userDoc.status });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.updateStatus = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const updatedStatus = req.body.status;

  User.findById(req.userId)
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error("Could not update user status!");
        error.statusCode = 404;
        throw error;
      }
      userDoc.status = updatedStatus;

      return userDoc.save();
    })
    .then((result) => {
      return res.status(200).json({
        message: "User status updated successfully!",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};
