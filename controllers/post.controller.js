import Post from "../models/Post.model.js";

export const GetPostsController = async function (req, res) {
  try {
    const result = await Promise.all([Post.findAllWithDetails(), Post.count()]);
    res.status(200).json({
      posts: result[0], //Array of posts
      count: result[1], //Total number of posts count
      message: "Posts fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const GetPostByIdController = async function (req, res) {
  try {
    const post = await Post.findByIdWithDetails(req.params.id);
    res.status(200).json({
      post,
      message: "Post fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const CreatePostController = async function (req, res) {
  try {
    const { title, content, categoryIds, postId } = req.body;
    const userId = req.userId;
    let newPost = null;
    console.log(categoryIds);

    if (!postId) {
      newPost = new Post(userId, title, content);
    } else {
      newPost = await Post.findById(postId);

      if (newPost.user_id != req.userId) {
        return res.status(400).json({
          message: "Unauthorized request",
        });
      }

      newPost.title = title;
      newPost.content = content;
    }
    const savedPost = await newPost.save();

    if (!savedPost) {
      return res.status(400).json({
        message: "Error while creating a new post",
      });
    }

    if (categoryIds && categoryIds.length > 0) {
      if (!postId) savedPost.addCategories(categoryIds);
      else savedPost.updateCategories(categoryIds);
    }

    return res.status(201).json({
      savedPost,
      message: "Post Created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const DeletePostController = async function (req, res) {
  try {
    const postToDelete = await Post.findById(req.params.id);
    if (postToDelete.userId != req.userId) {
      return res.status(400).json({
        message: "Uauthorized request",
      });
    }

    const deleted = await Post.deleteById(req.params.id);
    if (deleted) {
      return res.status(200).json({
        message: "Post deleted successfully",
      });
    }
    return res.status(400).json({
      message: "Error while deleteting the post",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const GetPostsByUserIdController = async function (req, res) {
  try {
    const posts = await Post.findWithUserId(req.params.id);
    res.status(200).json({
      posts,
      message: "Posts fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
