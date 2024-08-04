import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { SlLogout } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import userContext from "../../AuthContext/UserContext";
import useNotifications from "../../Notification/useNotifications";
import { useUnreadMessages } from "../../messages/useUnreadMessages";
import PostCreate from "../Post/PostCreate";
import SearchUserCard from "../SearchComponents/SearchUserCard";
import "./Sidebar.css";
import SidebarConfig from "./SidebarConfig";

const Sidebar = ({
  isPostCreateOpen,
  setIsPostCreateOpen,
  posts,
  setPosts,
}) => {
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const { user, setUser } = useContext(userContext);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));

        const token = userData.accessToken;
        const response = await axios.get(
          `http://localhost:8080/api/users/search?q=${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSearchResults(response.data);
        if (response.data.length === 0) {
          setError("No users found");
        } else {
          setError(null);
        }
      } catch (error) {
        setError("Error fetching search results");
        setSearchResults([]);
        console.error("Error fetching search results:", error);
      }
    };

    if (query.trim() !== "") {
      fetchSearchResults();
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [query]);

  const { unreadCount } = useNotifications(user?.username);
  const unreadUsers = useUnreadMessages(user?.username).length;

  console.log("userrrrrrr", user);
  const handleTabClick = (title) => {
    if (title === "Message") {
      setIsMessageVisible(true);
      setActiveTab("Message");
      navigate("/chat");
    } else {
      setIsMessageVisible(false);
      setActiveTab(title);
      if (title !== "Message") {
        navigate("/");
      }
    }

    if (title === "Profile") {
      if (user && user.username) {
        navigate(`/${user.username}`);
      } else {
        navigate("/signin");
      }
    } else if (title === "Home") {
      navigate("/");
    } else if (title === "Notification") navigate("/notifications");
    else if (title === "New Post") {
      setIsPostCreateOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/signin");
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const DropdownMenu = ({ onLogout }) => {
    return (
      <div className="dropdown-menu">
        <div className="dropdown-item" onClick={onLogout}>
          <SlLogout />
          <span>Logout </span>
          <span className="username">@{user?.username}</span>
        </div>
      </div>
    );
  };

  const handleUserClick = () => {
    setQuery("");
    setSearchResults([]);
  };

  return (
    <div className="sidebar-container ">
      <div className="px-3 pb-5 mt-10 justify-center">
        <div className="searchInputWrapper">
          <input
            onChange={handleSearch}
            value={query}
            className="searchInput"
            type="text"
            placeholder="Search..."
            color="white"
          />
          <div className="searchIcon" onClick={handleSearch}>
            <CiSearch />
          </div>
        </div>
        {error && <p>{error}</p>}
      </div>

      <hr />
      {query && (
        <div className="searchContainer">
          <div className="px-3 pt-5">
            {searchResults.map((user) => (
              <SearchUserCard
                key={user.id}
                user={user}
                onUserClick={handleUserClick}
              />
            ))}
          </div>
        </div>
      )}
      <div
        className={`flex flex-col justify-between h-full ${
          isMessageVisible ? "px-2 justify-center" : "px-10"
        }`}
      >
        <div>
          {isMessageVisible && <div className="pt-10"></div>}
          <div className="mt-10">
            <SidebarConfig
              activeTab={activeTab}
              handleTabClick={handleTabClick}
              unreadNotificationCount={unreadCount}
              unreadMessageCount={unreadUsers}
            />
          </div>
        </div>
        <div className="user-profile-container">
          {user && (
            <>
              <img
                src={
                  user?.image ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                }
                alt="Profile"
                className="w-12 h-12 rounded-full profile-picture"
              />
              <div className="user-info11">
                <div>
                  <p className="user-name">{user.name}</p>
                  <p className="user-handle">@{user.username}</p>
                </div>
                <button className="ellipsis-button" onClick={toggleDropdown}>
                  <IoEllipsisHorizontal size={20} />
                </button>
                {isDropdownVisible && <DropdownMenu onLogout={handleLogout} />}
              </div>
            </>
          )}
        </div>
      </div>
      <PostCreate
        isOpen={isPostCreateOpen}
        onClose={() => setIsPostCreateOpen(false)}
        posts={posts}
        setPosts={setPosts}
      />
    </div>
  );
};

export default Sidebar;