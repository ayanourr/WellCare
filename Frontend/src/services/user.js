import axios from "axios";
import { API_BASE } from "./config";

const SERVICE_BASE = API_BASE + "/users/profile/";

const getProfile = ({ id }) => {
  return axios.get(SERVICE_BASE + `${id}`);
};

const updatePassword = (data) => {
  return axios.put(SERVICE_BASE + `password`, data);
};

const updateProfile = (id, data) => {
  return axios.put(SERVICE_BASE + `/${id}`, data);
};
const updateDoctorProfile = (id, data) => {
  return axios.put(SERVICE_BASE + `/${id}/doctor`, data);
};

const UserService = {
  updateProfile,
  getProfile,
  updateDoctorProfile,
  updatePassword,
};

export default UserService;
