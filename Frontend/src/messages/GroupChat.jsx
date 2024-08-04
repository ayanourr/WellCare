import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, where, onSnapshot, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Box, Button, Input, Tooltip, IconButton, VStack, HStack, Text, useDisclosure, Flex } from '@chakra-ui/react';
import { CloseIcon, AddIcon, InfoIcon } from '@chakra-ui/icons';
import AddMemberModal from './AddMemberModal'; 
import GroupMembers from './GroupMembers'; 
import './Chat.css';

const GroupChat = ({ selectedGroup, onLeaveGroup, friends = [] }) => { 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesRef = collection(db, 'group_messages');

  const userData = JSON.parse(localStorage.getItem('user'));
  const dummy = useRef();
  const chatContainerRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const { isOpen: isAddMemberOpen, onOpen: onAddMemberOpen, onClose: onAddMemberClose } = useDisclosure(); 
  const { isOpen: isGroupMembersOpen, onOpen: onGroupMembersOpen, onClose: onGroupMembersClose } = useDisclosure(); 

  const scrollToBottom = () => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop === chatContainer.clientHeight;
      setIsAutoScroll(isAtBottom);
    }
  };

  useEffect(() => {
    if (!selectedGroup) return;

    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc'),
      where('groupId', '==', selectedGroup.id)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({ ...data, id: doc.id });
      });

      setMessages(messages);
      setLoading(false);
      scrollToBottom();
      
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: userData.id,
        displayName: userData.username,
        groupId: selectedGroup.id,
        read: false,
      });

      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const groupRef = doc(db, 'groups', selectedGroup.id);
      await updateDoc(groupRef, {
        members: selectedGroup.members.filter(member => member !== userData.username)
      });
      onLeaveGroup(selectedGroup.id);
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  const handleAddMembers = async (newMembers) => {
    try {
      const groupRef = doc(db, 'groups', selectedGroup.id);
      await updateDoc(groupRef, {
        members: [...selectedGroup.members, ...newMembers]
      });
    } catch (error) {
      console.error("Failed to add members:", error);
    }
  };

  return (
    <Box className="chat-container">
      <HStack className="chat-header" justify="space-between" px={6} py={4} bg="#3f90ff">
        <Flex align="center">
          <Tooltip label="Leave group" aria-label="Leave group tooltip">
            <IconButton
              icon={<CloseIcon />}
              onClick={handleLeaveGroup}
              aria-label="Leave group"
              bg="red.500"
              _hover={{ bg: 'red.400' }}
              color="white"
              size="sm"
              mr={2}
            />
          </Tooltip>
        </Flex>
        <Text fontSize="26px" flex="1" textAlign="center">{selectedGroup.name}</Text>
        <Flex justify="flex-end">
          <Tooltip label="Group members" aria-label="Group members tooltip">
            <IconButton
              icon={<InfoIcon />}
              onClick={onGroupMembersOpen}
              aria-label="Group members"
              bg="blue.700"
              _hover={{ bg: 'blue.600' }}
              color="white"
              size="sm"
              mr={2}
            />
          </Tooltip>
          <Tooltip label="Add new member" aria-label="Add new member tooltip">
            <IconButton
              icon={<AddIcon />}
              onClick={onAddMemberOpen}
              aria-label="Add new member"
              bg="green.500"
              _hover={{ bg: 'green.400' }}
              color="white"
              size="sm"
            />
          </Tooltip>
        </Flex>
      </HStack>
      <Box className="chat-messages" ref={chatContainerRef} onScroll={handleScroll} p={4} bg="gray.100" flex="1" overflowY="auto">
        {loading ? (
          <Text>Loading messages...</Text>
        ) : (
          messages.map(message => (
            <Box key={message.id} className={`message ${message.uid === userData.id ? 'sent' : 'received'}`} mb={3}>
              <Text className="message-sender" fontWeight="bold">{message.displayName}</Text>
              <Text className="message-text">{message.text}</Text>
            </Box>
          ))
        )}
        <div ref={dummy}></div>
      </Box>
      <Box as="form" onSubmit={handleSend} className="chat-form" p={4} bg="white" boxShadow="md">
        <HStack width="100%">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chat-input"
            placeholder="Type your message here..."
            size="lg"
            flex="1"
          />
          <Button type="submit" colorScheme="blue" size="lg">Send</Button>
        </HStack>
      </Box>
      <AddMemberModal isOpen={isAddMemberOpen} onClose={onAddMemberClose} friends={friends} onAdd={handleAddMembers} />
      <GroupMembers isOpen={isGroupMembersOpen} onClose={onGroupMembersClose} members={selectedGroup.members} />
    </Box>
  );
};

export default GroupChat;