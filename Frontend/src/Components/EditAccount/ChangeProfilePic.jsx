import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";

function ChangeProfilePic({
  isOpen,
  onOpen,
  onClose,
  handleProfileImageChange,
}) {
  const [image, setImage] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    console.log("Profile Picture Updated:", profilePicture);
    if (profilePicture) {
      setImage(URL.createObjectURL(profilePicture));
    }
  }, [profilePicture]);

  const handleUploadPicture = () => {
    if (image) {
      handleProfileImageChange(profilePicture);
      onClose();
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target?.files[0];
    if (selectedImage) {
      setProfilePicture(selectedImage);
    }
  };

  return (
    <>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={"center"}>Change Profile Picture</ModalHeader>

          <ModalBody>
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="profileImage"
                className="font-bold py-3 text-blue-600 text-center cursor-pointer text-xs w-full"
              >
                <FaUpload size={20} style={{ marginLeft: "192px", justifyContent: "center" }} /> 
              </label>

              <input
                onChange={handleImageChange}
                type="file"
                id="profileImage"
                name="profileImage"
                style={{ display: "none" }} // hide the default file input
              />
              {image && (
                <img
                  src={image}
                  alt="Selected Profile Picture"
                  className="mt-4 rounded-md max-h-40"
                />
              )}

              <div className="mt-4 mb-4">
                <Button
                  colorScheme="blue"
                  onClick={handleUploadPicture}
                >
                  OK
                </Button>
              </div>
            </div>

            <hr />

            <p className="py-3 text-center cursor-pointer" onClick={onClose}>
              Cancel
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ChangeProfilePic;