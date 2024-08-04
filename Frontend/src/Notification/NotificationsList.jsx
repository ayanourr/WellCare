import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaComment,
  FaThumbsUp,
  FaUserCheck,
  FaUserPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useNotifications from "./useNotifications";
import sendNotification from "../Notification/sendNotification";

const NotificationsList = ({ onIconClick }) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const { notifications, unreadCount, markAsRead, fetchNotifications } =
    useNotifications(userData?.username);
  const [targetPostId, setTargetPostId] = useState(null);
  const [targetCommentId, setTargetCommentId] = useState(null);
  const [showButtons, setShowButtons] = useState(true);
  const navigate = useNavigate();
  const [notificationId, setNotificationId] = useState(null);

  const [processedNotifications, setProcessedNotifications] = useState(
    new Set(JSON.parse(localStorage.getItem("processedNotifications")) || [])
  );

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    if (notification.sourceData) {
      const { postId, commentId } = notification.sourceData;
      setTargetPostId(postId);
      setTargetCommentId(commentId);

      navigate("/", { state: { postId, commentId } });
    }
  };

  useEffect(() => {
    if (onIconClick) {
      onIconClick();
    }
  }, [unreadCount, onIconClick]);

  const handleAccept = async (friendUsername, notificationId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/relationship/friend-accept/${friendUsername}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData?.accessToken}`,
          },
        }
      );
      markAsRead(notificationId);
      setShowButtons(false);

      const id = await sendNotification(
        null,
        friendUsername,
        `${userData.username} accepted your friend request`,
        userData.username,
        null,
        null,
        "friend_request_approved"
      );
      setNotificationId(id);
      const newProcessedNotifications = new Set(processedNotifications);
      newProcessedNotifications.add(notificationId);
      setProcessedNotifications(newProcessedNotifications);
      localStorage.setItem(
        "processedNotifications",
        JSON.stringify(Array.from(newProcessedNotifications))
      );
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleCancel = async (friendUsername, notificationId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/relationship/friend-request-cancel/${friendUsername}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData?.accessToken}`,
          },
        }
      );
      const newProcessedNotifications = new Set(processedNotifications);
      newProcessedNotifications.add(notificationId);
      setProcessedNotifications(newProcessedNotifications);
      localStorage.setItem(
        "processedNotifications",
        JSON.stringify(Array.from(newProcessedNotifications))
      );
      markAsRead(notificationId);
      setShowButtons(false);
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "like":
        return <Icon as={FaThumbsUp} color="green.500" />;
      case "comment":
        return <Icon as={FaComment} color="blue.500" />;
      case "friend_request":
        return <Icon as={FaUserPlus} color="teal.500" />;
      case "friend_request_approved":
        return <Icon as={FaUserCheck} color="purple.500" />;
      default:
        return <Icon as={FaBell} color="gray.500" />;
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
      <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
        Notifications
      </Text>
      {notifications.map((notification) => (
        <Box
          key={notification.id}
          bg={notification.read ? "gray.100" : "blue.50"}
          p={4}
          borderRadius="md"
          boxShadow="sm"
          mb={4}
          transition="transform 0.3s"
          _hover={{ transform: "scale(1.02)", cursor: "pointer" }}
          onClick={() => handleNotificationClick(notification)}
        >
          <Flex align="center">
            {notification.Type !== "friend_request_approved" && (
              <Avatar
                src={notification.senderImage}
                size="md"
                mr={4}
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(notification.id);
                  navigate(`/${notification.senderName}`);
                }}
              />
            )}
            <VStack align="start" spacing={1} flex="1">
              <HStack>
                {getTypeIcon(notification.Type)}
                <Text color="gray.800" fontWeight="bold">
                  {notification.senderName}
                </Text>
                {notification.Type && (
                  <Badge
                    colorScheme={
                      notification.Type === "like"
                        ? "green"
                        : notification.Type === "comment"
                        ? "blue"
                        : notification.Type === "friend_request"
                        ? "teal"
                        : "purple"
                    }
                  >
                    {notification.Type.replace("_", " ").toUpperCase()}
                  </Badge>
                )}
              </HStack>
              <Text color="gray.600">{notification.text}</Text>
              <Text fontSize="sm" color="gray.500">
                {notification.createdAt && notification.createdAt.seconds
                  ? new Date(
                      notification.createdAt.seconds * 1000
                    ).toLocaleString()
                  : "Unknown date"}
              </Text>
              {!notification.read && (
                <Box
                  as="span"
                  bg="blue.500"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  position="absolute"
                  top="8px"
                  right="8px"
                ></Box>
              )}
              {notification.Type === "friend_request" &&
                showButtons &&
                !processedNotifications.has(notification.id) && (
                  <HStack spacing={3} mt={2}>
                    <Button
                      onClick={() =>
                        handleAccept(notification.senderName, notification.id)
                      }
                      colorScheme="green"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() =>
                        handleCancel(notification.senderName, notification.id)
                      }
                      colorScheme="red"
                    >
                      Cancel
                    </Button>
                  </HStack>
                )}
              {notification.Type === "friend_request_approved" && (
                <Text mt={2} color="green.500">
                  Friends
                </Text>
              )}
            </VStack>
          </Flex>
        </Box>
      ))}
    </Box>
  );
};

export default NotificationsList;
