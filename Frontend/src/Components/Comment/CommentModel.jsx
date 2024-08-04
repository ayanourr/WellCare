import { Modal, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import sendNotification from "../../Notification/sendNotification";
import CommentCard from "./CommentCard";
import "./CommentModel.css";

const CommentModel = ({
  onClose,
  isOpen,
  postId,
  updateCommentsCount,
  user,
  userimg,
  notifycommentId,
  setCommentCount,
}) => {
  const [commentContent, setCommentContent] = useState("");
  const [commentAttachment, setCommentAttachment] = useState();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const response = await axios.get(
        `http://localhost:8080/api/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(response.data);
      setCommentCount(response.data.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [isOpen, postId]);

  const handleSubmitComment = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const formData = new FormData();
      formData.append("content", commentContent);
      formData.append("attachment", commentAttachment || null);
      const response = await axios.post(
        `http://localhost:8080/api/comments/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newComment = response.data;
      setCommentCount((prev) => prev + 1);
      setComments([...comments, newComment]);
      setCommentContent("");
      setCommentAttachment(null);
      updateCommentsCount((prevCount) => prevCount + 1);

      if (userData.username !== user.username) {
        const sourceData = {
          postId: postId,
          commentId: newComment.id,
        };
        await sendNotification(
          user.id,
          user.username,
          `${userData.username} Commented on Your Post`,
          userData.username,
          userimg,
          sourceData,
          "comment"
        );
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const response = await fetch(
        `http://localhost:8080/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
        updateCommentsCount((prevCount) => prevCount - 1);
      } else {
        console.error("Error deleting comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const addEmoji = (emoji) => {
    setCommentContent(commentContent + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <Modal size="4xl" onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <div className="comment">
            {isLoading ? (
              <p>Loading comments...</p>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  handleDeleteComment={handleDeleteComment}
                  userimg={userimg}
                  postId={postId}
                  notifycommentId={notifycommentId}
                />
              ))
            )}
          </div>
          <div className="flex items-center relative mt-4">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <BsEmojiSmile />
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker">
                <Picker data={data} onEmojiSelect={addEmoji} />
              </div>
            )}
            <input
              className="commentInput"
              type="text"
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && commentContent.trim() !== "") {
                  handleSubmitComment();
                }
              }}
            />
            <button
              className="submitCommentButton"
              onClick={handleSubmitComment}
            >
              <IoSend size={24} />
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CommentModel;
