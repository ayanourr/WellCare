import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

const SavedPostsContext = createContext();

export const useSavedPosts = () => {
  return useContext(SavedPostsContext);
};

export const SavedPostsProvider = ({ children }) => {
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user")).accessToken;
        const response = await axios.get(
          `http://localhost:8080/api/posts/saved-posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data._embedded.postList)
          setSavedPosts(response.data._embedded.postList);
        else setSavedPosts([]);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };
    fetchSavedPosts();
  }, []);

  const toggleSavePost = (postId) => {
    setSavedPosts((prevState) =>
      prevState.includes(postId)
        ? prevState.filter((id) => id !== postId)
        : [...prevState, postId]
    );
  };

  return (
    <SavedPostsContext.Provider value={{ savedPosts, toggleSavePost }}>
      {children}
    </SavedPostsContext.Provider>
  );
};
