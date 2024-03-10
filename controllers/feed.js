exports.getPosts = (req, res) => {
  res.status(200).json({
    posts: [{ title: "First post", content: "This the first post" }],
  });
};

exports.createPost = (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  //create post in db
  res.status(201).json({
    message: "Post was created successfully!",
    post: { id: new Date().toISOString(), title: title, content: content },
  });
};
