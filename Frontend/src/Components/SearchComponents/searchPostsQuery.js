import axios from "axios";

export const searchPosts = async (query) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData.accessToken;
  
      const response = await axios.get(
        `http://localhost:8080/api/posts/search?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      throw new Error("Error fetching search results");
    }
  };