import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";
import userContext from "../../AuthContext/UserContext";
import FriendAccept from "../FriendRequests/FriendAccept";
import FriendRequest from "../FriendRequests/FriendRequest";
import "./ProfileUserDetails.css";

const ProfileUserDetails = ({
  postCount,
  userProfile,
  friendsCount,
  setFriendsCount,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 350 });

  const navigate = useNavigate();
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const { id, username, image, bio } = userProfile || {};
  const token = localStorage.getItem("token");
  const { user } = useContext(userContext);
  const isLoggedInUserProfile = username === user?.username;

  const [handleFriendClick, setHandleFriendClick] = useState(false);
  useEffect(() => {
    if (handleFriendClick) fetchFriendsCount();
    setHandleFriendClick(false);
  }, [handleFriendClick]);

  const fetchFriendsCount = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/relationship/count/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFriendsCount(response.data.friendsCount);
    } catch (error) {
      console.error("Error fetching friends count:", error);
    }
  };
  useEffect(() => {
    if (username) {
      fetchFriendsCount();
    }
  }, [username, setFriendsCount]);

  useEffect(() => {
    const checkFriendRequestStatus = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
        const response = await axios.get(
          `http://localhost:8080/api/relationship/friend-request-status/${userProfile.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFriendRequestStatus(response.data.message);
      } catch (error) {
        console.error("Error checking friend request status:", error);
      }
    };

    if (!isLoggedInUserProfile && userProfile && userProfile.id) {
      checkFriendRequestStatus();
    } else {
      setFriendRequestStatus("Friends");
    }
  }, [isLoggedInUserProfile, userProfile]);

  const handleStatusChange = (newStatus) => {
    setFriendRequestStatus(
      newStatus === "accepted" || newStatus === "Friends"
        ? "Friends"
        : newStatus
    );
    fetchFriends();
  };

  const toggleFriendsModal = () => {
    setShowFriendsModal(!showFriendsModal);
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/relationship/${userProfile.id}/friends`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    if (showFriendsModal) {
      fetchFriends();
    }
  }, [showFriendsModal]);

  return (
    <div className="container w-full flex flex-col items-center">
      <div className="profile-container py-10 w-full flex flex-col md:flex-row justify-center items-center">
        <div className="flex flex-col items-center md:w-1/2">
          <div className="relative profile-details">
            <img
              className="w-32 h-32 rounded-full mb-2"
              src={
                image ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
              }
              alt=""
            />
          </div>
          <p className="font-semibold text-lg">{userProfile?.name}</p>
          <p className="text-lg text-sm opacity-50">@{userProfile?.username}</p>
          {!isMobile && (
            <p className="font-thin pt-3 ml-4 text-base">
              {userProfile &&
              userProfile.bio !== null &&
              userProfile.bio !== "null"
                ? bio
                : ""}
            </p>
          )}
          <div className="flex items-center mt-2">
            <span className="font-semibold mr-2 text-sm text-base">
              {postCount}
            </span>
            <span className="text-base mr-5">posts</span>
            <span className="font-semibold ml-4 mr-2 text-base">
              {friendsCount}
            </span>
            {isLoggedInUserProfile ||
            friendRequestStatus === "Friends" ||
            friendRequestStatus === "Already Friends" ||
            friendsCount > 0 ? (
              <span
                onClick={toggleFriendsModal}
                className="text-base cursor-pointer"
              >
                friends
              </span>
            ) : (
              <span>friends</span>
            )}
          </div>
          {user?.username === userProfile?.username ? (
            <div className="flex justify-center items-center mt-2">
              <button
                className="text-base px-2 py-1 rounded-md buttonWithBorder"
                onClick={() => navigate("/account/edit")}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="flex space-x-2 mt-4">
              {friendRequestStatus === "Friend request received" ? (
                <FriendAccept
                  friendUserId={id}
                  onStatusChange={handleStatusChange}
                  user={user}
                  friendUsername={username}
                  setHandleFriendClick={setHandleFriendClick}
                />
              ) : (
                <FriendRequest
                  friendUserId={id}
                  friendUsername={username}
                  onStatusChange={handleStatusChange}
                  user={user}
                  setHandleFriendClick={setHandleFriendClick}
                />
              )}
            </div>
          )}
          <hr />
        </div>
      </div>
      <Modal isOpen={showFriendsModal} onClose={toggleFriendsModal} size="lg">
        <ModalOverlay />
        <ModalContent
          bgGradient="linear-gradient(to right, #FFFFFF, #faf1f1)"
          color="#4f357e"
          borderRadius="md"
        >
          <ModalHeader>Friends</ModalHeader>
          <hr />
          <ModalCloseButton />
          <ModalBody>
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-content"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate(`/${friend.username}`);
                  toggleFriendsModal();
                }}
              >
                <img
                  src={
                    friend?.image ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                  }
                  className="w-10 h-10 rounded-full mb-2 mr-2"
                  alt="Friend's Profile"
                />
                <h1>{friend.username}</h1>
              </div>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfileUserDetails;
