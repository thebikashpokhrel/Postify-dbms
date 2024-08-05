import Comment from "./../models/Comment.model.js";

export const GetCommentsByPostId = async function (req, res) {
  try {
    const postId = req.params.postId;
    const allComments = await Comment.findByPostId(postId);

    return res.status(200).json({
      allComments,
      message: "Comments fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const CreateComment = async function (req, res) {
  try {
    const { postId, content } = req.body;
    const userId = req.userId;

    const createdComment = new Comment(postId, userId, content);
    await createdComment.save();

    return res.status(200).json({
      createdComment,
      message: "Comment created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
