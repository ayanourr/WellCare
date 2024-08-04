import { ChakraProvider } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import UserContext from "./AuthContext/UserContext";
import Router from "./Router/Router";
import { theme } from "./Theme/Theme";

function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
        if (token) {
          const response = await axios.get(
            "http://localhost:8080/api/auth/isAuth",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
  return (
    <ChakraProvider theme={theme}>
      <UserContext.Provider value={{ user, setUser }}>
        <div className="App">
          <Router />
        </div>
      </UserContext.Provider>
    </ChakraProvider>
  );
}

export default App;
