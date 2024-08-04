import { createContext } from "react";

const userContext = createContext({
  user: null,
  setUser: null,
});

export default userContext;
