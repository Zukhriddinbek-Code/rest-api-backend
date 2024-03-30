const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const feedRoutes = require("./routes/feed");

const app = express();

app.use(bodyParser.json()); //application/json
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
