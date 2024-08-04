import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import { push as Menu } from "react-burger-menu";
import { AiOutlineMessage, AiOutlineNotification } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { CiSearch } from "react-icons/ci";
import { IoCreateOutline, IoEllipsisHorizontal } from "react-icons/io5";
import { LuHome } from "react-icons/lu";
import { SlLogout } from "react-icons/sl";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import userContext from "../AuthContext/UserContext";
import EditAccount from "../Components/EditAccount/EditAccount";
import PostCreate from "../Components/Post/PostCreate";
import Auth from "../Components/Register/Auth";
import SearchPostCard from "../Components/SearchComponents/SearchPostCard";
import SearchPostResults from "../Components/SearchComponents/SearchPostResults";
import SearchUserCard from "../Components/SearchComponents/SearchUserCard";
import { searchPosts } from "../Components/SearchComponents/searchPostsQuery";
import HomePage from "../Homepage/HomePage";
import NotificationList from "../Notification/NotificationsList";
import useNotifications from "../Notification/useNotifications";
import Profile from "../Profile/Profile";
import FriendList from "../messages/FriendsList";
import { useUnreadMessages } from "../messages/useUnreadMessages";
import "./routercss.css";

const Router = () => {
  const { user, setUser } = useContext(userContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isPostCreateOpen, setIsPostCreateOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isPostContentSearch, setIsPostContentSearch] = useState(false); // New state

  const handleSearch = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    try {
      const userData = JSON.parse(localStorage.getItem("user"));

      const token = userData.accessToken;
      let userResponse = await axios.get(
        `http://localhost:8080/api/users/search?q=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const postResponse = await searchPosts(searchQuery);

      setSearchResults({ users: userResponse.data, posts: postResponse });
      setError(null);
    } catch (error) {
      setError("Error fetching search results");
      console.error("Error fetching search results:", error);
    }
  };
  const handleSearchClick = () => {
    if (query) {
      navigate("/search", { state: { query, isPostContentSearch } });
    }
    setQuery("");
    setSearchResults([]);
  };

  const { unreadCount } = useNotifications(user?.username);
  const unreadUsers = useUnreadMessages(user?.username).length;

  const handleUserClick = () => {
    setQuery("");
    setSearchResults([]);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (
      !token &&
      location.pathname !== "/signin" &&
      location.pathname !== "/signup"
    ) {
      navigate("/signin", { replace: true });
    }
  }, [location.pathname]);
  const handleTabClick = (title) => {
    if (title === "Message") {
      navigate("/chat");
      setIsMenuOpen(false);
    } else {
      if (title !== "Message") {
        navigate("/");
        setIsMenuOpen(false);
      }
    }

    if (title === "Profile") {
      if (user && user.username) {
        navigate(`/${user.username}`);
        setIsMenuOpen(false);
      } else {
        navigate("/signin");
        setIsMenuOpen(false);
      }
    } else if (title === "Home") {
      navigate("/");
      setIsMenuOpen(false);
    } else if (title === "Notification") {
      navigate("/notifications");
      setIsMenuOpen(false);
    } else if (title === "New Post") {
      setIsPostCreateOpen(true);
      setIsMenuOpen(false);
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
  return (
    <div>
      {location.pathname !== "/signin" && location.pathname !== "/signup" && (
        <div className="flex">
          <div style={{ position: "static", zIndex: 99999, cursor: "pointer" }}>
            <Menu left isOpen={isMenuOpen}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <div>
                  <div className="pb-5 mt-10 justify-center">
                    <div className="searchInputWrapper">
                      <input
                        onChange={handleSearch}
                        value={query}
                        className="searchInput"
                        type="search"
                        placeholder="Search..."
                        color="white"
                        style={{ paddingRight: "20px" }}
                      />
                      <div className="searchIcon" onClick={handleSearchClick}>
                        <CiSearch />
                      </div>
                    </div>
                    {error && <p>{error}</p>}
                  </div>
                  {query && !isPostContentSearch && (
                    <div className="searchContainer">
                      <div className="px-3 pt-5">
                        {searchResults.users &&
                          searchResults.users.length > 0 &&
                          searchResults.users.map((user) => (
                            <SearchUserCard
                              key={user.id}
                              user={user}
                              onUserClick={handleUserClick}
                            />
                          ))}
                        {searchResults.posts &&
                          searchResults.posts.length > 0 &&
                          searchResults.posts.map((post) => (
                            <SearchPostCard key={post.id} post={post} />
                          ))}
                        {!searchResults.users && !searchResults.posts && (
                          <p>No results found</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBlock: "20px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleTabClick("Home")}
                  >
                    <LuHome className="text-3xl mr-5" />
                    Home
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBlock: "20px",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => handleTabClick("Message")}
                  >
                    <AiOutlineMessage className="text-3xl mr-5" />
                    Message
                    {unreadUsers > 0 && (
                      <span className="unread-badge">{unreadUsers}</span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBlock: "20px",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => handleTabClick("Notification")}
                  >
                    <AiOutlineNotification className="text-3xl mr-5" />
                    Notification
                    {unreadCount > 0 && (
                      <span className="unread-badge">{unreadCount}</span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBlock: "20px",
                      cursor: "pointer",
                    }}
                    onClick={() => setIsPostCreateOpen(true)}
                  >
                    <IoCreateOutline className="text-3xl mr-5" />
                    New Post
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBlock: "20px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleTabClick("Profile")}
                  >
                    <CgProfile className="text-3xl mr-5" />
                    Profile
                  </div>
                </div>
                <dv>
                  {user && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onClick={toggleDropdown}
                    >
                      <img
                        src={
                          user?.image ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                        }
                        alt="Profile"
                        className="w-12 h-12 rounded-full profile-picture"
                        style={{ objectFit: "cover", objectPosition: "center" }}
                      />
                      <div style={{ display: "flex" }}>
                        <div>
                          <p className="user-name">{user.name}</p>
                          <p
                            className="user-handle"
                            style={{ overflow: "hidden" }}
                          >
                            @{user.username}
                          </p>
                        </div>
                        <button className="ellipsis-button">
                          <IoEllipsisHorizontal size={20} />
                        </button>
                        {isDropdownVisible && (
                          <DropdownMenu onLogout={handleLogout} />
                        )}
                      </div>
                    </div>
                  )}
                </dv>
              </div>
            </Menu>
          </div>
          {/* <div className="w-[20%] border border-l-slate-500">
            <Sidebar
              isPostCreateOpen={isPostCreateOpen}
              setIsPostCreateOpen={setIsPostCreateOpen}
              posts={posts}
              setPosts={setPosts}
            />
          </div> */}
          <div className="w-full">
            <Routes>
              <Route
                path="/"
                element={<HomePage posts={posts} setPosts={setPosts} />}
              ></Route>
              <Route path="/:username" element={<Profile />}></Route>
              <Route path="/comment/:postId" element={<HomePage />} />
              <Route path="/chat" element={<FriendList />} />
              <Route path="/account/edit" element={<EditAccount />}></Route>
              <Route
                path="/notifications"
                element={<NotificationList />}
              ></Route>
              <Route path="/search" element={<SearchPostResults />}></Route>
            </Routes>
          </div>
        </div>
      )}
      {(location.pathname === "/signin" || location.pathname === "/signup") && (
        <Routes>
          <Route path="/signup" element={<Auth />} />
          <Route path="/signin" element={<Auth />} />
          {/* Add more routes as needed */}
        </Routes>
      )}
      <PostCreate
        isOpen={isPostCreateOpen}
        onClose={() => setIsPostCreateOpen(false)}
        posts={posts}
        setPosts={setPosts}
      />
    </div>
  );
};

export default Router;
