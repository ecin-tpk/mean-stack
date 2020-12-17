const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let err = new Error("Invalid mime type");
    if (isValid) {
      err = null;
    }
    cb(err, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

// POST: Create post
router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      author: req.userData.userId,
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
  }
);

// GET: Get posts (paginated)
router.get("", (req, res) => {
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
        message: "Posts fetched successfully",
        posts: fetchedPosts,
        maxPosts: count,
      });
    });
});

// GET: Get post by id
router.get("/:id", (req, res) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: "Post not found",
      });
    }
  });
});

// PUT: Update post
router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res) => {
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
    Post.updateOne(
      { _id: req.params.id, author: req.userData.userId },
      post
    ).then((result) => {
      if (result.nModified > 0) {
        res.status(200).json({
          message: "Updated post successfully",
        });
      } else {
        res.status(401).json({
          message: "Not authorized",
        });
      }
    });
  }
);

// DELETE: Delete post
router.delete("/:id", checkAuth, (req, res) => {
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
      console.log("Failed to delete post");
    });
});

module.exports = router;
