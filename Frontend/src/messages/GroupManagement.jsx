import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, List, ListItem, Checkbox, Text } from '@chakra-ui/react';

const GroupManagement = ({ isOpen, onClose, friends }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const userData = JSON.parse(localStorage.getItem('user'));

  const handleCreateGroup = async () => {
    if (groupName.trim() === '' || selectedMembers.length === 0) return;

    try {
      const groupDoc = await addDoc(collection(db, 'groups'), {
        name: groupName,
        members: [userData.username, ...selectedMembers.map(member => member.username)],
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'group_messages'), {
        groupId: groupDoc.id,
        sender: userData.username,
        content: `${userData.username} created this group`,
        timestamp: serverTimestamp(),
      });

      setGroupName('');
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleSelectMember = (member) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(member)
        ? prevSelected.filter((m) => m !== member)
        : [...prevSelected, member]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Group</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            mb={4}
          />
          <Text mb={2}>Select Members</Text>
          <List spacing={3}>
            {friends.map((friend) => (
              <ListItem key={friend.id}>
                <Checkbox
                  isChecked={selectedMembers.includes(friend)}
                  onChange={() => handleSelectMember(friend)}
                >
                  {friend.username}
                </Checkbox>
              </ListItem>
            ))}
          </List>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleCreateGroup}>
            Create Group
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GroupManagement;