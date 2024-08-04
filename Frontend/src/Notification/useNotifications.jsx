// useNotifications.js
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase";

const useNotifications = (username) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(() => {
    if (!username) {
      console.log("Username not available");
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("receiverUsername", "==", username),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = [];
        let unreadCount = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.read) {
            unreadCount++;
          }
          notificationsData.push({ id: doc.id, ...data });
        });
        setUnreadCount(unreadCount);
        setNotifications(notificationsData);
      },
      (error) => {
        console.error("Error fetching notifications: ", error);
      }
    );

    return unsubscribe;
  }, [username]);

  useEffect(() => {
    const unsubscribe = fetchNotifications();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read: ", error);
    }
  };

  return { notifications, unreadCount, markAsRead, fetchNotifications };
};

export default useNotifications;
