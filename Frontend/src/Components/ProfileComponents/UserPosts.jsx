import { useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { AiOutlineTable } from "react-icons/ai";
import { BiBookmark } from "react-icons/bi";
import userContext from "../../AuthContext/UserContext";
import PostCard from "../Post/PostCard";
import "./UserPosts.css";

const UserPosts = ({ userProfile, updatePosts }) => {
  const [activeTab, setActiveTab] = useState("Post");
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const toast = useToast();
  const [isUpdated, setIsUpdated] = useState(false);
  const { user } = useContext(userContext);
  const isLoggedInUserProfile = user?.username === userProfile?.username;

  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    if (isUpdated) {
      fetchUserPosts(userProfile.id);
      setIsUpdated(false);
    }
  }, [isUpdated]);

  const tabs = [
    {
      tab: "Post",
      icon: <AiOutlineTable />,
      posts: userPosts, // Set the user's posts for the 'Post' tab
    },
    ...(isLoggedInUserProfile
      ? [
          {
            tab: "Saved",
            icon: <BiBookmark />,
            posts: savedPosts,
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (userProfile && userProfile.id) {
      fetchUserPosts(userProfile.id);
    }
  }, [userProfile]);

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
  useEffect(() => {
    fetchSavedPosts();
  }, []);

  useEffect(() => {
    // Fetch saved posts when the active tab is changed to "Saved"
    if (activeTab === "Saved") {
      fetchSavedPosts();
    }
  }, [activeTab]);

  const fetchUserPosts = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/posts/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (
        response.data &&
        response.data._embedded &&
        response.data._embedded.postList
      ) {
        setUserPosts(response.data._embedded.postList);
      } else {
        setUserPosts([]); // If the structure is not as expected, set an empty array
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleDeletePost = (postId) => {
    setUserPosts(userPosts.filter((post) => post.id !== postId));
  };

  const activePosts = tabs.find((tab) => tab.tab === activeTab)?.posts || [];

  return !isDeleted ? (
    <div className="container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          gap: 120,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
          onClick={() => setActiveTab("Post")}
        >
          <AiOutlineTable />
          <h1>Posts</h1>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
          onClick={() => setActiveTab("Saved")}
        >
          <BiBookmark />
          <h1>Saved</h1>
        </div>
      </div>

      <hr className="hr-divider2" />
      <div className="flex flex-col items-center mt-4 space-y-4 user-posts-content">
        {activePosts.length > 0 ? (
          activePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={userProfile}
              width="100%"
              // height="60%"
              setIsUpdated={setIsUpdated}
              updatePosts={updatePosts}
            />
          ))
        ) : (
          <div className="no-posts-message">
            {activeTab === "Saved" ? "No Saved Posts yet" : "No Posts yet"}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="p-4 mb-4 text-gray-600">Post deleted successfully.</div>
  );
};

export default UserPosts;
