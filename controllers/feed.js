const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  //getting query params
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find();
    })
    .then((posts) => {
      if (!posts) {
        const error = new Error("No posts found!");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: "Posts fetched successfully", posts: posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided!");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  //create post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
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

exports.getPost = (req, res, next) => {
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

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked!");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post!");
        error.statusCode = 404;
        throw error;
      }

      //if new image uploaded, then we delete old image from computer storage
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      return res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      //checking whether post exists in db
      if (!post) {
        const error = new Error("Could not find post!");
        error.statusCode = 404;
        throw error;
      }

      //check logged in user

      //deleting an image
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then((response) => {
      console.log(response);
      res.status(200).json({ message: "Post deleted successfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

//helper fn to delete an image
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);

  //Asynchronously removes/deletes a file or symbolic link.
  //No arguments other than a possible exception are given to the completion callback.
  fs.unlink(filePath, (err) => console.log(err));
};
