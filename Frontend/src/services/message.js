import axios from "axios";
import { API_BASE } from "./config";

const SERVICE_BASE = API_BASE + "/messages/";

const sendMessage = (id, data) => {
  return axios.post(SERVICE_BASE + `new-message/${id}`, data);
};

const updateMessage = (id, data) => {
  return axios.put(SERVICE_BASE + `${id}`, data);
};

const getMessagesWithUser = (id) => {
  return axios.get(SERVICE_BASE + `chat/${id}`);
};

const getRecentChat = (page = 0, size = 1) => {
  return axios.get(SERVICE_BASE + `recent?page=${id}&size=${size}`);
};
const getUnreadMessages = () => {
  return axios.get(SERVICE_BASE + `unread`);
};

const RelationshipService = {
  sendMessage,
  updateMessage,
  getMessagesWithUser,
  getRecentChat,
  getUnreadMessages,
};

export default RelationshipService;
