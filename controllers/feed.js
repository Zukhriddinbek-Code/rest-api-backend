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
  const title = req.body.title;
  const content = req.body.content;
  //create post in db
  res.status(201).json({
    message: "Post was created successfully!",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: {
        name: "Zuhriddin",
      },
      createdAt: new Date(),
    },
  });
};
