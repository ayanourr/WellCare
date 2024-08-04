import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

const useUnreadMessages = (username) => {
  const [unreadUsers, setUnreadUsers] = useState([]);

  useEffect(() => {
    if (!username) return;

    const q = query(
      collection(db, "messages"),
      where("receiverUsername", "==", username),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unreadUsersSet = new Set();
      snapshot.forEach((doc) => {
        unreadUsersSet.add(doc.data().displayName);
      });
      setUnreadUsers(Array.from(unreadUsersSet));
    });

    return () => unsubscribe();
  }, [username]);

  return unreadUsers;
};

const useUnreadMessageCounts = (username) => {
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    if (!username) return;

    const q = query(
      collection(db, "messages"),
      where("receiverUsername", "==", username),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = {};
      snapshot.forEach((doc) => {
        const senderUsername = doc.data().displayName;
        counts[senderUsername] = (counts[senderUsername] || 0) + 1;
      });
      setUnreadMessages(counts);
    });

    return () => unsubscribe();
  }, [username]);

  return unreadMessages;
};

export { useUnreadMessageCounts, useUnreadMessages };
