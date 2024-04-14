const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  //getting query params
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();

    //skip the given amount from db and return the other posts
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // if (!posts) {
    //   const error = new Error("No posts found!");
    //   error.statusCode = 404;
    //   throw error;
    // }
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};

exports.createPost = async (req, res, next) => {
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
  // let creator;

  //create post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  //save it database
  try {
    const result = await post.save();

    const creator = await User.findById(req.userId);
    creator.posts.push(post);

    const createResult = await creator.save();

    res.status(201).json({
      message: "Post was created successfully!",
      post: post,
      creator: { _id: creator._id, name: creator.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }

  // post
  //   .save()
  //   .then((result) => {
  //     return User.findById(req.userId);
  //   })
  //   .then((user) => {
  //     creator = user;
  //     user.posts.push(post);
  //     return user.save();
  //   })
  //   .then((result) => {
  //     res.status(201).json({
  //       message: "Post was created successfully!",
  //       post: post,
  //       creator: { _id: creator._id, name: creator.name },
  //     });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //       next(err);
  //     }
  //   });
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    // if (!post) {
    //   const error = new Error("Could not find post!");
    //   error.statusCode = 404;
    //   throw error;
    // }

    res.status(200).json({ message: "Post fetched successfully", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }

  // Post.findById(postId)
  //   .then((post) => {
  //     if (!post) {
  //       const error = new Error("Could not find post!");
  //       error.statusCode = 404;
  //       throw error;
  //     }
  //     res
  //       .status(200)
  //       .json({ message: "Post fetched successfully", post: post });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //       next(err);
  //     }
  //   });
};

exports.updatePost = async (req, res, next) => {
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

  try {
    const post = await Post.findById(postId);
    // if (!post) {
    //   const error = new Error("Could not find post!");
    //   error.statusCode = 404;
    //   throw error;
    // }

    if (post.creator.toString() !== req.userId) {
      const error = new Error("You are not allowed to edit this post!");
      error.statusCode = 403;
      throw error;
    }

    //if new image uploaded, then we delete old image from computer storage
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const updateResult = await post.save();

    res.status(200).json({ message: "Post updated!", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }

  // Post.findById(postId)
  //   .then((post) => {
  //     if (!post) {
  //       const error = new Error("Could not find post!");
  //       error.statusCode = 404;
  //       throw error;
  //     }
  //     if (post.creator.toString() !== req.userId) {
  //       const error = new Error("You are not allowed to edit this post!");
  //       error.statusCode = 403;
  //       throw error;
  //     }

  //     //if new image uploaded, then we delete old image from computer storage
  //     if (imageUrl !== post.imageUrl) {
  //       clearImage(post.imageUrl);
  //     }

  //     post.title = title;
  //     post.content = content;
  //     post.imageUrl = imageUrl;
  //     return post.save();
  //   })
  //   .then((result) => {
  //     return res.status(200).json({ message: "Post updated!", post: result });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //       next(err);
  //     }
  //   });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    // checking whether post exists in db
    // if (!post) {
    //   const error = new Error("Could not find post!");
    //   error.statusCode = 404;
    //   throw error;
    // }

    //check logged in user
    if (post.creator.toString() !== req.userId) {
      const error = new Error("You are not allowed to edit this post!");
      error.statusCode = 403;
      throw error;
    }

    //deleting an image
    clearImage(post.imageUrl);

    const deleteResult = await Post.findByIdAndDelete(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    const saveResult = await user.save();

    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }

  // Post.findById(postId)
  //   .then((post) => {
  //     //checking whether post exists in db
  //     if (!post) {
  //       const error = new Error("Could not find post!");
  //       error.statusCode = 404;
  //       throw error;
  //     }

  //     //check logged in user
  //     if (post.creator.toString() !== req.userId) {
  //       const error = new Error("You are not allowed to edit this post!");
  //       error.statusCode = 403;
  //       throw error;
  //     }

  //     //deleting an image
  //     clearImage(post.imageUrl);
  //     return Post.findByIdAndDelete(postId);
  //   })
  //   .then((response) => {
  //     return User.findById(req.userId);
  //   })
  //   .then((user) => {
  //     user.posts.pull(postId);
  //     return user.save();
  //   })
  //   .then((result) => {
  //     res.status(200).json({ message: "Post deleted successfully!" });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //       next(err);
  //     }
  //   });
};

//helper fn to delete an image
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);

  //Asynchronously removes/deletes a file or symbolic link.
  //No arguments other than a possible exception are given to the completion callback.
  fs.unlink(filePath, (err) => console.log(err));
};
