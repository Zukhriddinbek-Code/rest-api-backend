const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
//file uploads handler
const multer = require("multer");

const feedRoutes = require("./routes/feed");

const app = express();

//control where the image uploads are stored
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    //null = errors no errors
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

//file filtering to receive particular types of file e.g. .png, .jpeg
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json()); //application/json
//register multer
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
//serve images statically
app.use("/images", express.static(path.join(__dirname, "images")));

const MONGODB_URL =
  "mongodb+srv://zuhriddin_ganiev:8aEZ5BqVm5OVUA4U@cluster-zuhriddin.65mbqpl.mongodb.net/messages?retryWrites=true&w=majority";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, PUT"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

//error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  //by default error constructor object will have
  const message = error.message;

  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    app.listen(8080, () => {
      console.log("Server is running on 8080");
    });
  })
  .catch((err) => console.log(err));
