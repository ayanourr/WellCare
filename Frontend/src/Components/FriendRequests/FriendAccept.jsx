import axios from "axios";
import React, { useEffect, useState } from "react";
import { CiCircleRemove } from "react-icons/ci";
import { FaAngleDown } from "react-icons/fa";
import { SlUserFollow, SlUserFollowing } from "react-icons/sl";
import sendNotification from "../../Notification/sendNotification";
import FriendRequestModal from "./FriendRequestModal";

const FriendAccept = ({ friendUserId, friendUsername, onStatusChange, user,setHandleFriendClick }) => {
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
            user.image,
            null,
            "friend_request"
          );
          setNotificationId(id);
        }
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
      }
    } catch (error) {
      setError("Failed to toggle friend request");
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
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      await axios.put(
        `http://localhost:8080/api/relationship/friend-request-approve/${friendUsername}`,
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
        `${user.username} accepted your friend request`,
        user.username,
        user.image,
        null,
        "friend_request_approved"
      );
      setHandleFriendClick(true)
      setNotificationId(id);
    } catch (error) {
      console.error("Failed to accept friend request", error);
    }
    setIsModalOpen(false);
  };

  const handleReject = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      await axios.delete(
        `http://localhost:8080/api/relationship/friend-request-reject/${friendUsername}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHandleFriendClick(true)
      setStatus("Friend request not sent");
      onStatusChange("rejected");
    } catch (error) {
      console.error("Failed to reject friend request", error);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={handleToggleFriendRequest} disabled={loading}>
        {loading ? "Loading..." : status === "Friends" ? "Friends" : status === "Friend request received" ? "Accept Friend Request" : status === "Friend request already sent" ? "Cancel Friend Request" : "Add Friend"}
      </button>
      {status === "Friends" && isDropdownVisible && (
        <div className="dropdown">
          <button onClick={handleRemoveFriend}>Remove Friend</button>
        </div>
      )}
      <FriendRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAccept}
        onReject={handleReject}
        friendUsername={friendUsername}
      />
    </div>
  );
};

export default FriendAccept;
