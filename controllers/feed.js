const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res) => {
  res.status(200).json({
    posts: [
      {
        _id: "erewrw2131231erqrersdgfs",
        title: "First post",
        content: "This the first post",
        images: "images/duck.png",
        creator: {
          name: "Bek",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;

  //create post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/duck.png",
    creator: {
      name: "Zuhriddin",
    },
  });

  //save it database
  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post was created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.getPost = (req, res) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post!");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: "Post fetched successfully", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};
