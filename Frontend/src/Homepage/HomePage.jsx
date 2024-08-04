import { Button, Spinner } from "@chakra-ui/react"; // Import Tabs components
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import PostCard from "../Components/Post/PostCard";
// import StoryListContainer from "../Components/Story/StoryList.js";
import { useLocation } from "react-router-dom";
import StoryListContainer from "../Components/Story/StoryList";
import "./HomePage.css";
const options = [
  { value: "ALL", label: "All" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "PATIENT", label: "Patient" },
];

const HomePage = ({ posts, setPosts }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    selectedRole: "ALL",
    friendsOnly: false,
  });
  const [loading, setLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [iscreateModalOpen, setIscreateModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const location = useLocation();
  const { postId, commentId } = location.state || {};

  useEffect(() => {
    const fetchDataAndScroll = async () => {
      await fetchPosts(currentPage);

      if (postId) {
        console.log("Target Post ID:", postId);
        const postElement = document.getElementById(`post-${postId}`);
        console.log("Post Element:", postElement);
        if (postElement) {
          postElement.scrollIntoView({ behavior: "smooth", block: "center" });
          postElement.classList.add("highlighted-post");
          setTimeout(() => {
            postElement.classList.remove("highlighted-post");
            navigate("/", { state: { postId: null } });
          }, 5000);
        }
      }

      if (commentId) {
        console.log("Target Comment ID:", commentId);
        const commentElement = document.getElementById(`comment-${commentId}`);
        console.log("Comment Element:", commentElement);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            commentElement.style.backgroundColor = "";
            navigate("/", { state: { commentId: null } });
          }, 40000);
        }
      }
    };

    fetchDataAndScroll();
  }, [postId, commentId]);

  useEffect(() => {
    if (isUpdated == true) {
      fetchPosts(currentPage);
      setIsUpdated(false);
    }
  }, [isUpdated]);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.accessToken || !userData.username) {
          return;
        }
        const response = await axios.get(
          `http://localhost:8080/api/users/profile/${userData.username}`,
          {
            headers: {
              Authorization: `Bearer ${userData.accessToken}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);

    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [filters, currentPage]);

  const fetchPosts = async (page) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.accessToken) {
        setError("User data or access token not available");
        setLoading(false);
        return;
      }
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      let url = `http://localhost:8080/api/posts/feed?friendsOnly=${filters.friendsOnly}&page=${page}&size=20`;

      if (filters.selectedRole !== "ALL") {
        url += `&role=${filters.selectedRole}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        response.data &&
        response.data._embedded &&
        response.data._embedded.postList
      ) {
        setPosts(
          page === 0
            ? response.data._embedded.postList
            : [...posts, ...response.data._embedded.postList]
        );
        setTotalPages(response.data.page.totalPages);
        setError(null);
      } else {
        setError("No posts found");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Error fetching posts");
      setLoading(false);
    }
  };

  const handleFriendsOnlyClick = () => {
    setFilters({ ...filters, friendsOnly: true });
  };

  const handleAllPostsClick = () => {
    setFilters({ ...filters, friendsOnly: false });
  };

  const handleRoleChange = (selectedOption) => {
    setFilters({ ...filters, selectedRole: selectedOption.value });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    // Show scroll-to-top button when user scrolls down
    setShowScrollToTop(window.scrollY > 200);
  };

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    // Remove scroll event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="mb-20 ">
      <div
        className={`navbar ${isSticky ? "sticky" : ""}`}
        style={{ paddingInline: "100px" }}
      >
        {/* <Menu right isOpen={false} /> */}
        <div className="navbar-left">
          <div className="navbar-item" onClick={handleAllPostsClick}>
            All
          </div>
          <div className="vertical-line"></div>
          <div className="navbar-item" onClick={handleFriendsOnlyClick}>
            Friends
          </div>
        </div>
        <div className="filter-container">
          <label htmlFor="role" className="text-sm"></label>
          <Select
            options={options}
            value={options.find(
              (option) => option.value === filters.selectedRole
            )}
            onChange={handleRoleChange}
            className="p-2 rounded-sm text-sm react-select__control"
            classNamePrefix="react-select"
            isSearchable={false}
          />
        </div>
      </div>
      {showScrollToTop && (
        <div className="scroll-to-top" onClick={scrollToTop}>
          <Button
            variant="outline"
            colorScheme="blue"
            borderRadius="50%"
            position="fixed"
            bottom="2rem"
            right="2rem"
            width="50px"
            height="50px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-arrow-up"
            >
              <line x1="12" y1="19" x2="  12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </Button>
        </div>
      )}
      <hr />
      <StoryListContainer />
      <hr />
      <div className="mt-10 flex w-full justify-center ">
        <div>
          <div className="space-y-10 w-full mt-10">
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            ) : error ? (
              <div>{error}</div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  setIsUpdated={setIsUpdated}
                  notifycommentId={commentId}
                  className={post.id === postId ? "highlighted-post" : ""}
                />
              ))
            )}
            {currentPage < totalPages - 1 && (
              <Button onClick={() => setCurrentPage(currentPage + 1)}>
                Load More
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
