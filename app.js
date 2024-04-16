const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
//file uploads handler
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

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
app.use("/auth", authRoutes);

//error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  //by default error constructor object will have
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    const server = app.listen(8080, () => {
      console.log("Server is running on 8080");
    });
    const io = require("socket.io")(server);

    //fn triggers on every client connects to the server
    io.on("connection", (socket) => {
      console.log("Client connected!");
    });
  })
  .catch((err) => console.log(err));
