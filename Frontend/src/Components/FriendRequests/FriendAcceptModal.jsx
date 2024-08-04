import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React from "react";

const FriendAcceptModal = ({ isOpen, onClose, onAccept, onCancel }) => {
  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Friend Request</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <p>Do you want to accept or cancel the friend request?</p>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" mr={3} onClick={handleAccept}>
            Accept
          </Button>
          <Button colorScheme="red" onClick={handleCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FriendAcceptModal;
