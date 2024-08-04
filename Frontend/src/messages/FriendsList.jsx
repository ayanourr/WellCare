import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useUnreadMessageCounts, useUnreadMessages } from './useUnreadMessages';
import GroupManagement from './GroupManagement';
import Chat from './Chat';
import GroupChat from './GroupChat';
import './FriendList.css';

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 700);

  const userData = JSON.parse(localStorage.getItem('user'));
  const currentUserId = userData.id;
  const unreadCounts = useUnreadMessageCounts(userData.username);

  const fetchGroups = async () => {
    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('members', 'array-contains', userData.username));
      const querySnapshot = await getDocs(q);
      const groupsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsList);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/relationship/${currentUserId}/friends`);
        const friendsList = response.data;
        const chatbot = {
          id: 'CareWizard',
          username: 'CareWizard',
          image: 'https://miro.medium.com/v2/resize:fit:612/1*C_LFPy6TagD1SEN5SwmVRQ.jpeg'
        };
        setFriends([chatbot, ...friendsList]);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
    fetchGroups();
  }, [currentUserId, userData.username]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 700);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);

    // Mark messages as read
    if (chat.type === 'friend') {
      const q = query(
        collection(db, 'messages'),
        where('receiverUsername', '==', userData.username),
        where('displayName', '==', chat.username),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        updateDoc(doc.ref, { read: true });
      });
    } else if (chat.type === 'group') {
      const q = query(
        collection(db, 'group_messages'),
        where('groupId', '==', chat.id),
        where('readBy', 'not-in', [userData.username])
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        const readBy = doc.data().readBy || [];
        updateDoc(doc.ref, { readBy: [...readBy, userData.username] });
      });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchGroups();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLeaveGroup = (groupId) => {
    setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
    setSelectedChat(null);
  };

  const allChats = [
    ...friends.map(friend => ({ ...friend, type: 'friend' })),
    ...groups.map(group => ({ ...group, type: 'group' }))
  ];

  if (isMobileView && selectedChat) {
    return (
      <div className="chat-section">
        <button onClick={() => setSelectedChat(null)} className="back-button">Back to List</button>
        {selectedChat.type === 'friend' ? (
          <Chat selectedFriend={selectedChat} />
        ) : (
          <GroupChat selectedGroup={selectedChat} onLeaveGroup={handleLeaveGroup} />
        )}
      </div>
    );
  }

  return (
    <div className="friend-chat-container">
      <div className={`friends-list ${isSidebarOpen ? 'open' : ''}`}>
        <h2>Friends & Groups List</h2>
        <button onClick={openModal} className="create-group-button">
          + Create Group
        </button>
        <GroupManagement isOpen={isModalOpen} onClose={closeModal} friends={friends} />
        <ul>
          {allChats.map((chat) => (
            <li key={chat.id} onClick={() => handleSelectChat(chat)}>
              <img
                className="profile-pic"
                src={chat.image ? chat.image : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"}
                alt={chat.username || chat.name}
              />
              <span className="username" title={chat.username || chat.name}>{chat.username || chat.name}</span>
              {chat.type === 'friend' && unreadCounts[chat.username] > 0 && (
                <span className="unread-indicator">{unreadCounts[chat.username]}</span>
              )}
              {chat.type === 'group' && unreadCounts[chat.id] > 0 && (
                <span className="unread-indicator">{unreadCounts[chat.id]}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {!isMobileView && (
        <div className="chat-section">
          {selectedChat ? (
            selectedChat.type === 'friend' ? (
              <Chat selectedFriend={selectedChat} />
            ) : (
              <GroupChat selectedGroup={selectedChat} onLeaveGroup={handleLeaveGroup} />
            )
          ) : (
            <div className="placeholder">Select a friend or group to chat</div>
          )}
        </div>
      )}
      {window.innerWidth <= 700 && (
        <button className="toggle-sidebar-button" onClick={toggleSidebar}>
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>
      )}
    </div>
  );
};

export default FriendList;