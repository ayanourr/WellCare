import React, { useContext, useEffect, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { MdOutlineDoneOutline, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import userContext from "../../AuthContext/UserContext";
import sendNotification from "../../Notification/sendNotification";
import "./CommentModel.css";

const CommentCard = ({
  comment,
  handleDeleteComment,
  userimg,
  postId,
  notifycommentId,
}) => {
  const { id, createdAt, content, attachment, noOfLikes, commentLikes } =
    comment;
  const currentuserid = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).id
    : null;
  const { user } = useContext(userContext);
  const [postTime, setPostTime] = useState("");
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(noOfLikes);
  const [isCurrentUserComment, setIsCurrentUserComment] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(content);
  const userData = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const isLiked = commentLikes.some((like) => like.id === user.id);
    console.log("isLiked", isLiked);
    setIsCommentLiked(isLiked);
  }, [commentLikes, user.id, user?.username]);

  useEffect(() => {
    const commentElement = document.getElementById(
      `comment-${notifycommentId}`
    );
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        commentElement.style.backgroundColor = "";
        notifycommentId = null;
      }, 9000);
    }
  }, [notifycommentId]);
  console.log("comment", comment);
  useEffect(() => {
    const calculateTimeDifference = () => {
      const currentTime = new Date();
      const postDate = new Date(createdAt);
      const timeDifference = currentTime - postDate;

      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(timeDifference / (1000 * 60));
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));

      if (weeks > 0) {
        setPostTime(`${weeks}w`);
      } else if (days > 0) {
        setPostTime(`${days}d`);
      } else if (hours > 0) {
        setPostTime(`${hours}h`);
      } else if (minutes > 0) {
        setPostTime(`${minutes}m`);
      } else {
        setPostTime(`${seconds}s`);
      }
    };
    calculateTimeDifference();
    if (user.id === currentuserid) {
      setIsCurrentUserComment(true);
    }
  }, [createdAt, user]);

  const handleCommentLike = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const response = await fetch(
        `http://localhost:8080/api/comments/like-switcher/${comment.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const updatedComment = await response.json();
        if (!isCommentLiked && userData.username !== user.username) {
          const sourceData = {
            postId: postId,
            commentId: comment.id,
          };

          await sendNotification(
            user.id,
            user.username,
            `${userData.username} Liked Your Comment`,
            userData.username,
            userimg,
            sourceData,
            "like"
          );
        }
        const isLiked = updatedComment.commentLikes.some(
          (like) => like.id === user.id
        );
        console.log("isLiked", isLiked);
        setIsCommentLiked(isLiked);
        console.log("updatedComment", updatedComment);
        setLikesCount(updatedComment.noOfLikes);
      } else {
        console.error("Failed to toggle like:", response.statusText);
      }
    } catch (error) {
      console.error("Error toggling like on comment:", error);
    }
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", updatedContent);

    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const response = await fetch(
        `http://localhost:8080/api/comments/${comment.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (response.ok) {
        comment.content = updatedContent;
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  return !isDeleted ? (
    <div
      className={`comment-card ${notifycommentId ? "highlighted" : ""}`}
      id={`comment-${comment.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <img
              className="w-12 h-12 rounded-full"
              src={
                user.image ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
              }
              alt="User Avatar"
              style={{ cursor: "pointer", borderRadius: "50%" }}
              onClick={() => navigate(`/${user.username}`)}
            />
          </div>

          <div className="ml-4" style={{ width: "100%" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex" }}>
                <h1
                  className="font-semibold"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/${user.username}`)}
                >
                  {user.username}
                </h1>
                <p style={{ marginInline: "8px" }}>{postTime}</p>
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={updatedContent}
                onChange={(e) => setUpdatedContent(e.target.value)}
                rows={3}
                className="border border-gray-300 rounded p-2 mt-1 w-full"
              />
            ) : (
              <p className="text-sm mt-1" style={{ color: "black" }}>
                {content}
              </p>
            )}
            <div className="flex items-center text-xs text-gray-600 mt-2">
              {likesCount > 0 && (
                <span className="text-red-500">{likesCount} likes</span>
              )}
            </div>
          </div>
        </div>
        <div
          className="flex items-center"
          style={{
            flexDirection: "column",
            gap: "10px",
            alignItems: "baseline",
          }}
        >
          {isCurrentUserComment && (
            <div className="relative inline-block ml-2">
              <span
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer opacity-60"
              >
                <IoEllipsisHorizontal />
              </span>
              {isDropdownOpen && (
                <div className="absolute bg-white border rounded-lg shadow-md p-2 right-0 mt-2">
                  <button
                    onClick={() => handleDeleteComment(id)}
                    className="hover:text-red-500"
                  >
                    <div className="flex items-center">
                      <RiDeleteBin6Line
                        style={{
                          width: "1.5rem",
                          marginRight: "0.5rem",
                          color: "red",
                        }}
                      />
                      <span style={{ color: "red" }}>Delete</span>
                    </div>
                  </button>
                  <hr />
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="hover:text-blue-500"
                  >
                    <div className="flex items-center">
                      <MdOutlineEdit
                        style={{ width: "1.5rem", marginRight: "0.5rem" }}
                      />
                      <span>Update</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
          {isCommentLiked ? (
            <AiFillHeart
              onClick={handleCommentLike}
              className="text-red-500 text-lg cursor-pointer hover:opacity-75"
            />
          ) : (
            <AiOutlineHeart
              onClick={handleCommentLike}
              className="text-lg cursor-pointer hover:opacity-75"
            />
          )}
        </div>
      </div>
      {isEditing && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleUpdateComment}
            disabled={updatedContent === content}
            className={`px-4 py-2 bg-blue-500 text-white rounded ${
              updatedContent === content ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ position: "relative" }}
          >
            <div
              style={{
                backgroundColor: "green",
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                right: "5rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <MdOutlineDoneOutline style={{ color: "white" }} />
            </div>
            Update
          </button>
        </div>
      )}
    </div>
  ) : null;
};

export default CommentCard;
