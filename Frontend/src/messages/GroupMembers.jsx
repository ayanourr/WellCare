import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, List, ListItem } from '@chakra-ui/react';

const GroupMembers = ({ members = [], onClose, isOpen }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Group Members</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <List spacing={3}>
            {members.map((member, index) => (
              <ListItem key={index}>{member}</ListItem>
            ))}
          </List>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GroupMembers;