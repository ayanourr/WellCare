import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsBookmark, BsBookmarkFill, BsDot, BsThreeDots } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-cube";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import userContext from "../../AuthContext/UserContext";
import sendNotification from "../../Notification/sendNotification";
import CommentModel from "../Comment/CommentModel";
import "./PostCard.css";
import PostUpdate from "./PostUpdate";
import { useSavedPosts } from "./SavedPostsContext";

const PostCard = ({
  post,
  width,
  height,
  updatePosts,
  setIsUpdated,
  notifycommentId,
}) => {
  const { user } = useContext(userContext);
  const { savedPosts, toggleSavePost } = useSavedPosts();
  const currentuserid = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).id
    : null;
  const [showDropDown, setShowDropDown] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [commentCounts, setCommentCount] = useState(0);
  const [postState, setPostState] = useState({
    likesCount: post.noOfLikes,
    commentsCount: post.noOfComments,
    isSaved:
      post.savedBy && post.savedBy.length > 0
        ? post.savedBy.some((status) => status.id === currentuserid)
        : false,
  });
  const [postTime, setPostTime] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPostDeleted, setIsPostDeleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const isUser = post.user && user.id === post.user.id;
  const userData = JSON.parse(localStorage.getItem("user"));
  const ref = useRef(null);
  const navigate = useNavigate();

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const handleUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  useEffect(() => {
    const userLiked = post.likes && post.likes.some((e) => e.id === user.id);
    setIsPostLiked(userLiked);
  }, [post.likes, user.id]);

  useEffect(() => {
    const calculateTimeDifference = () => {
      const currentTime = new Date();
      const postDate = new Date(post.createdAt);
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
  }, [post.createdAt, user, currentuserid]);

  const handlePostLike = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const response = await fetch(
        `http://localhost:8080/api/posts/like-switcher/${post.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const updatedPost = await response.json();
        if (!isPostLiked && post.user.username !== user.username) {
          const sourceData = {
            postId: post.id,
          };
          await sendNotification(
            user.id,
            post.user.username,
            `${userData.username} Liked Your Post`,
            userData.username,
            user.image,
            sourceData,
            "like"
          );
        }
        setIsPostLiked(!isPostLiked);
        setPostState((prevState) => ({
          ...prevState,
          likesCount: updatedPost.noOfLikes,
        }));
      } else {
        // Handle error
      }
    } catch (error) {
      console.error("Error toggling like on post:", error);
    }
  };

  const handleSaveClick = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const response = await fetch(
        `http://localhost:8080/api/posts/save-switcher/${post.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setPostState((prevState) => ({
          ...prevState,
          isSaved: !prevState.isSaved,
        }));
        toggleSavePost(post.id);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleClick = () => {
    setShowDropDown(!showDropDown);
  };

  const handleOpenCommentModel = () => {
    onOpen();
  };

  const updateCommentsCount = (newCommentCount) => {
    setPostState((prevState) => ({
      ...prevState,
      commentsCount: newCommentCount,
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeletePost = () => {
    setShowDropDown(false);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      await axios.delete(`http://localhost:8080/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsDeleteModalOpen(false);
      setIsPostDeleted(true);
      updatePosts(post.id);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  if (post && post.user)
    return (
      <div
        id={`post-${post.id}`}
        className="flex justify-center items-center"
        style={{ width }}
      >
        {!isPostDeleted && (
          <div
            className="post-container rounded-md w-full shadow-md max-w-lg"
            style={{ borderRadius: "30px" }}
          >
            <div className="flex justify-between items-center w-full py-4 px-5">
              <div className="flex items-center mb-4 sm:mb-0">
                <img
                  className="h-12 w-12 rounded-full"
                  src={
                    post.user.image
                      ? post.user.image
                      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                  }
                  alt={post.user.username}
                  style={{
                    cursor: "pointer",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  onClick={() => navigate(`/${post.user.username}`)}
                />
                <div className="pl-2">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <p
                        className="font-semibold text-sm"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/${post.user.username}`)}
                      >
                        {post.user.username}
                      </p>
                      <BsDot className="text-2xl opacity-70" />
                      <p className="opacity-70 text-sm">{postTime}</p>
                    </div>
                    <p className="font-thin text-sm text-left">
                      {post.location}
                    </p>
                  </div>
                </div>
              </div>
              {isUser && (
                <div className="flex items-center space-x-4 relative" ref={ref}>
                  <BsThreeDots
                    className="dots cursor-pointer"
                    onClick={handleClick}
                  />
                  {showDropDown && (
                    <div className="dropdown-content absolute bg-white border rounded-md p-2 top-0 right-0 mt-8 z-10">
                      <button
                        className="block w-full text-left py-1 px-4 rounded-md cursor-pointer mb-2 hover:bg-gray-100"
                        onClick={handleUpdate}
                      >
                        <div className="flex items-center">
                          <MdOutlineEdit
                            style={{ width: "1.5rem", marginRight: "0.5rem" }}
                          />
                          <span>Update</span>
                        </div>
                      </button>
                      <hr />
                      <button
                        className="block w-full text-left py-1 px-4 rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={handleDeletePost}
                      >
                        <div className="flex items-center">
                          <RiDeleteBin6Line
                            style={{
                              width: "1.5rem",
                              color: "red",
                              marginRight: "0.5rem",
                            }}
                          />
                          <span style={{ color: "red" }}>Delete</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-5">
              <p className="mb-3 text-left">{post.content}</p>
              <div className="flex justify-center">
                {post.attachment && post.attachment.length > 1 ? (
                  <Swiper
                    effect={"coverflow"}
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={"auto"}
                    coverflowEffect={{
                      stretch: 0,
                      depth: 100,
                      modifier: 2.5,
                    }}
                    pagination={{ el: ".swiper-pagination", clickable: true }}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                      clickable: true,
                    }}
                    modules={[EffectCoverflow, Pagination, Navigation]}
                    className="swiper_container"
                  >
                    {post.attachment.map((attachmentUrl, index) => (
                      <SwiperSlide key={index}>
                        <img
                          className="w-full rounded-lg shadow-md"
                          src={attachmentUrl}
                          style={{
                            objectFit: "cover",
                          }}
                          alt={`Attachment ${index}`}
                          onClick={() => handleImageClick(attachmentUrl)}
                        />
                      </SwiperSlide>
                    ))}
                    <div className="slider-controler">
                      <div className="swiper-button-prev slider-arrow">
                        <IoIosArrowDropleftCircle
                          style={{ width: "300px", color: "black" }}
                        />
                      </div>
                      <div className="swiper-button-next slider-arrow">
                        <IoIosArrowDroprightCircle
                          style={{ width: "300px", color: "black" }}
                        />
                      </div>
                      <div className="swiper-pagination"></div>
                    </div>
                  </Swiper>
                ) : (
                  post.attachment &&
                  post.attachment.length === 1 && (
                    <img
                      className="w-full rounded-lg shadow-md"
                      src={post.attachment[0]}
                      alt="Attachment"
                      onClick={() => handleImageClick(post.attachment[0])}
                    />
                  )
                )}
              </div>
            </div>

            <div className="flex justify-between items-center w-full px-5 py-4">
              <div className="flex items-center space-x-2">
                {isPostLiked ? (
                  <AiFillHeart
                    className="text-2xl hover:opacity-50 cursor-pointer text-red-500"
                    onClick={handlePostLike}
                  />
                ) : (
                  <AiOutlineHeart
                    className="text-2xl hover:opacity-50 cursor-pointer"
                    onClick={handlePostLike}
                  />
                )}
                <p className="text-sm opacity-70">{postState.likesCount}</p>
                <div className="flex items-center px-20">
                  <FaRegComment
                    className="text-xl hover:opacity-50 cursor-pointer"
                    onClick={handleOpenCommentModel}
                  />
                  <p className="opacity-70 px-3 text-sm">{commentCounts}</p>
                </div>
              </div>
              <div className="cursor-pointer">
                {postState.isSaved ? (
                  <BsBookmarkFill
                    className="text-xl hover:opacity-50 cursor-pointer"
                    onClick={handleSaveClick}
                  />
                ) : (
                  <BsBookmark
                    className="text-xl hover:opacity-50 cursor-pointer"
                    onClick={handleSaveClick}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        <Modal
          isOpen={isImageModalOpen}
          onClose={handleCloseImageModal}
          size="3xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody>
              <Image
                src={selectedImage}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "cover",
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal
          onClose={() => setIsDeleteModalOpen(false)}
          isOpen={isDeleteModalOpen}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalBody>
              <p>Are you sure you want to delete this post?</p>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={handleDelete}>
                Delete
              </Button>
              <Button onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <PostUpdate
          post={post}
          onClose={() => setIsUpdateModalOpen(false)}
          isOpen={isUpdateModalOpen}
          setIsUpdated={setIsUpdated}
        />
        <CommentModel
          setCommentCount={setCommentCount}
          onClose={onClose}
          isOpen={isOpen}
          postId={post.id}
          updateCommentsCount={updateCommentsCount}
          user={post.user}
          userimg={user.image}
          notifycommentId={notifycommentId} // Pass commentId to CommentModel
        />
      </div>
    );
};

export default PostCard;
