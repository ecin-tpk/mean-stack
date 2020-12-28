const Post = require("../models/post");

// Create post
exports.createPost = (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req["file"].filename,
    author: req["userData"].userId,
  });
  post
    .save()
    .then((createdPost) => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id,
        },
      });
    })
    .catch(() => {
      res.status(500).json({
        message: "Failed to add post",
      });
    });
};

// Update post
exports.updatePost = (req, res) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    author: req.userData.userId,
  });
  Post.updateOne({ _id: req.params.id, author: req.userData.userId }, post)
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: "Updated post successfully",
        });
      } else {
        res.status(401).json({
          message: "Not authorized",
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: "Failed to update post",
      });
    });
};

// Delete post
exports.deletePost = (req, res) => {
  Post.deleteOne({ _id: req.params.id, author: req.userData.userId })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: "Post deleted successfully",
        });
      } else {
        res.status(401).json({
          message: "Not authorized",
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: "Failed to delete post",
      });
    });
};

// Get posts (paginated)
exports.getPosts = (req, res) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((data) => {
      fetchedPosts = data;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch(() => {
      res.status(500).json({
        message: "Failed to fetch posts",
      });
    });
};

// Get post by id
exports.getPost = (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: "Post not found",
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: "Failed to fetch post",
      });
    });
};
