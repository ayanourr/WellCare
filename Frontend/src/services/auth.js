import axios from "axios";
import { API_BASE } from "./config";

const SERVICE_BASE = API_BASE + "/auth";

const login = (data) => {
  return axios.post(SERVICE_BASE + "/signin", data);
};
const signup = (data) => {
  return axios.post(SERVICE_BASE + "/signup", data);
};

const AuthService = {
  login,
  signup,
};

export default AuthService;
