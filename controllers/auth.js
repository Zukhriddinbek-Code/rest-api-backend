const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
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

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      name: name,
      password: hashedPassword,
    });

    const saveResult = await user.save();

    res
      .status(201)
      .json({ message: "User created successfully", userId: saveResult._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userDoc = await User.findOne({ email: email });
    if (!userDoc) {
      const error = new Error("Failed to find a user with this email address!");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, userDoc.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: userDoc.email,
        userId: userDoc._id.toString(),
      },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: token, userId: userDoc._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.userId);
    if (!userDoc) {
      const error = new Error("Could not find user status!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: userDoc.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};

exports.updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const updatedStatus = req.body.status;

  try {
    const userDoc = await User.findById(req.userId);
    if (!userDoc) {
      const error = new Error("Could not update user status!");
      error.statusCode = 404;
      throw error;
    }
    userDoc.status = updatedStatus;

    const saveResult = await userDoc.save();

    res.status(200).json({
      message: "User status updated successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};
