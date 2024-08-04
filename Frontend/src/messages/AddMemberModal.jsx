import React, { useState } from 'react';
import { Modal,Text, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, List, ListItem, Checkbox } from '@chakra-ui/react';

const AddMemberModal = ({ isOpen, onClose, friends = [], onAdd }) => { // Default to an empty array if friends is undefined
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleToggle = (friend) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friend)
        ? prevSelected.filter((f) => f !== friend)
        : [...prevSelected, friend]
    );
  };

  const handleAddMembers = () => {
    onAdd(selectedFriends);
    setSelectedFriends([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Member</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <List>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <ListItem key={friend.id}>
                  <Checkbox isChecked={selectedFriends.includes(friend.username)} onChange={() => handleToggle(friend.username)}>
                    {friend.username}
                  </Checkbox>
                </ListItem>
              ))
            ) : (
              <Text>No friends available to add.</Text>
            )}
          </List>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleAddMembers}>
            Add Members
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMemberModal;