import axios from "axios";
import { API_BASE } from "./config";

const SERVICE_BASE = API_BASE + "/posts/";

const getFeed = (role) => {
  return axios.get(SERVICE_BASE + `feed?role=${role}`);
};

const getUserPost = (id) => {
  return axios.get(SERVICE_BASE + `${id}`);
};
const getSavedPost = () => {
  return axios.get(SERVICE_BASE + `saved-posts`);
};

const likeSwitcher = async (post, setIsPostLiked, isPostLiked, setLikesCount) => {
  try {
      const token = JSON.parse(localStorage.getItem('user')).accessToken;
      const response = await fetch(`${SERVICE_BASE}/like-switcher/${post.id}`, {
          method: "PUT",
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      if (response.ok) {
          const updatedPost = await response.json();
          setIsPostLiked(!isPostLiked);
          setLikesCount(updatedPost.noOfLikes);
      } else {
          // Handle error
          console.error("Failed to toggle like on post. Status:", response.status);
      }
  } catch (error) {
      console.error("Error toggling like on post:", error);
  }
};

const saveSwitcher = (id) => {
  return axios.put(SERVICE_BASE + `save-switcher/${id}`);
};

const updatePost = (id, data) => {
  return axios.put(SERVICE_BASE + `${id}`, data);
};

const createPost = (data) => {
  return axios.post(SERVICE_BASE + "/new-post", data);
};

const deletePost = (id) => {
  return axios.delete(SERVICE_BASE + `${id}`);
};

const PostService = {
  getFeed,
  getUserPost,
  getSavedPost,
  likeSwitcher,
  updatePost,
  deletePost,
  saveSwitcher,
  createPost,
};

export default PostService;
