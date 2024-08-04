import axios from "axios";
import React, { useEffect, useState } from "react";
import { CiCircleRemove } from "react-icons/ci";
import { FaAngleDown } from "react-icons/fa";
import { SlUserFollow, SlUserFollowing } from "react-icons/sl";
import sendNotification from "../../Notification/sendNotification";
import FriendRequestModal from "./FriendRequestModal";

const FriendRequest = ({
  friendUserId,
  friendUsername,
  onStatusChange,
  user,
  setHandleFriendClick
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationId, setNotificationId] = useState(null);

  useEffect(() => {
    const checkRequestStatus = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
        const response = await axios.get(
          `http://localhost:8080/api/relationship/friend-request-status/${friendUsername}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStatus(response.data.message);
      } catch (error) {
        console.error("Error checking friend request status:", error);
      }
    };

    if (friendUsername) {
      checkRequestStatus();
    }
  }, [friendUsername]);

  const handleToggleFriendRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      if (friendUsername) {
        if (status === "Friend request received") {
          setIsModalOpen(true);
        } else if (status === "Friend request already sent") {
          await axios.put(
            `http://localhost:8080/api/relationship/friend-request-cancel/${friendUsername}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setStatus("Friend request not sent");
          onStatusChange("cancelled");
        } else if (status === "Friends" || status === "Already friends") {
          setIsDropdownVisible((prev) => !prev);
        } else {
          await axios.put(
            `http://localhost:8080/api/relationship/new-friend/${friendUsername}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setStatus("Friend request already sent");
          onStatusChange("sent");
          const id = await sendNotification(
            friendUserId,
            friendUsername,
            `${user.username} sent you a friend request`,
            user.username,
            user.image ?? null, // Use null if user.image is undefined
            null,
            "friend_request"
          );
          setNotificationId(id);
          
         }} else {
        await axios.put(
          `http://localhost:8080/api/relationship/new-friend/${friendUsername}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStatus("Friend request already sent");
        onStatusChange("sent");

      }
      setHandleFriendClick(true)
    } catch (error) {
      // setError("Failed to toggle friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      await axios.delete(
        `http://localhost:8080/api/relationship/friends/${friendUsername}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("Friend request not sent");
      onStatusChange("removed");
      setHandleFriendClick(true)
    } catch (error) {
      setError("Failed to remove friend");
    } finally {
      setLoading(false);
      setIsDropdownVisible(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const handleAccept = async () => {
    try {
      console.log("handleAccept here ")
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      await axios.put(
        `http://localhost:8080/api/relationship/friend-accept/${friendUsername}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("Friends");
      onStatusChange("accepted");
      const id = await sendNotification(
        friendUserId,
        friendUsername,
        `${user.username} sent you a friend request`,
        user.username,
        user.image,
        null,
        "friend_request_approved"
      );
      setNotificationId(id);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      setError("Failed to accept friend request");
    }
  };

  const handleCancel = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      await axios.put(
        `http://localhost:8080/api/relationship/friend-request-cancel/${friendUsername}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("Friend request not sent");
      onStatusChange("cancelled");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
      setError("Failed to cancel friend request");
    }
  };

  return (
    <div className="relative">
      <button
        className={`text-base ${
          status === "Friends" || status === "Already friends"
            ? "bg-gradient-to-b from-blue-500 to-purple-800 text-white"
            : "bg-gradient-to-b from-blue-500 to-purple-800 text-white"
        } text-white px-4 py-2 rounded-md flex items-center space-x-2`}
        onClick={
          status === "Friends" || status === "Already friends"
            ? toggleDropdown
            : handleToggleFriendRequest
        }
        disabled={loading}
      >
        {status === "Friends" || status === "Already friends" ? (
          <>
            <SlUserFollowing /> <span>Friends</span> <FaAngleDown />
          </>
        ) : status === "Friend request already sent" ? (
          "Requested"
        ) : status === "Friend request received" ? (
          "Confirm"
        ) : (
          <>
            <SlUserFollow /> <span>Add Friend</span>
          </>
        )}
      </button>
      {isDropdownVisible && (
        <div className="absolute left-0 w-full z-10">
          <div className="bg-white shadow-md rounded-md mt-2 z-10">
            <div
              className="dropdown-item flex items-center space-x-2 px-4 py-2 cursor-pointer hover:bg-gray-100 z-10"
              onClick={handleRemoveFriend}
            >
              <CiCircleRemove /> <span>Unfriend</span>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <FriendRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAccept}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default FriendRequest;
