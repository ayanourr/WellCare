import axios from "axios";
import { API_BASE } from "./config";

const SERVICE_BASE = API_BASE + "/relationship/";

const getFriendRequests = () => {
  return axios.get(SERVICE_BASE + `friend-requests`);
};

const addFriend = (id) => {
  return axios.put(SERVICE_BASE + `new-friend/${id}`);
};

const cancelFriendRequest = (id) => {
  return axios.put(SERVICE_BASE + `friend-request-cancel/${id}`);
};
const acceptFriend = (id) => {
  return axios.put(SERVICE_BASE + `friend-accept/${id}`);
};

const removeFriend = (id) => {
  return axios.delete(SERVICE_BASE + `friends/${id}`);
};

const RelationshipService = {
  getFriendRequests,
  addFriend,
  cancelFriendRequest,
  acceptFriend,
  removeFriend,
};

export default RelationshipService;
