const express = require("express");
const router = express.Router();
const checkImage = require("../middleware/check-image-file");
const checkAuth = require("../middleware/check-auth");
const PostsController = require("../controllers/posts");

// POST: Create post
router.post("", checkAuth, checkImage, PostsController.createPost);

// GET: Get posts (paginated)
router.get("", PostsController.getPosts);

// GET: Get post by id
router.get("/:id", PostsController.getPost);

// PUT: Update post
router.put("/:id", checkAuth, checkImage, PostsController.updatePost);

// DELETE: Delete post
router.delete("/:id", checkAuth, PostsController.deletePost);

module.exports = router;
