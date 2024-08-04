import axios from "axios";
import { API_BASE } from "./config";

const SERVICE_BASE = API_BASE + "/comments/";

const createComment = (id, data) => {
  return axios.post(SERVICE_BASE + `${id}`, data);
};

const updateComment = (id, data) => {
  return axios.put(SERVICE_BASE + `${id}`, data);
};
const likeSwitcher = (id, token) => {
  return axios.put(SERVICE_BASE + `like-switcher/${id}`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};


const deleteComment = (id) => {
  return axios.delete(SERVICE_BASE + `${id}`);
};

const CommentService = {
  likeSwitcher,
  updateComment,
  deleteComment,
  createComment,
};

export default CommentService;
