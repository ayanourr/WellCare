import { CloseIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import axios from "axios";
import React, { useState } from "react";
import { BsEmojiSunglasses } from "react-icons/bs";
import { MdFileUpload } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import useFileHandler from "../../UseFileHandler";

const PostCreate = ({ onClose, isOpen, posts, setPosts }) => {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const { imageFile, onFileChange, clearFiles, removeImage } = useFileHandler(
    "multiple",
    []
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const addEmoji = (emoji) => {
    setContent(content + emoji.native);
    setShowEmojiPicker(false);
  };
  const handleContentChange = (e) => setContent(e.target.value);
  const handleLocationChange = (e) => setLocation(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && imageFile.length === 0) {
      setError("Please provide content or an attachment.");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("content", content);
    formData.append("location", location); // Append location to formData
    imageFile.forEach((image) => {
      if (image.file) formData.append("file", image.file);
    });

    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      const response = await axios.post(
        "http://localhost:8080/api/posts/new-post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts([response.data, ...posts]);
      setContent("");
      setLocation("");
      clearFiles();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Post</ModalHeader>
        <hr />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                marginTop: "10px",
              }}
            >
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={handleContentChange}
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <BsEmojiSunglasses
                  style={{ fontSize: "24px", marginLeft: "10px" }}
                />
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <Picker data={data} onEmojiSelect={addEmoji} />
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <Input
                type="text"
                placeholder="Location"
                value={location}
                onChange={handleLocationChange}
                style={{ flex: 1, padding: "10px", borderRadius: "5px" }}
              />
              <SlLocationPin style={{ fontSize: "24px", marginLeft: "10px" }} />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                multiple
                type="file"
                hidden
                accept="image/*"
                onChange={onFileChange}
                id="photos"
              />
              <label
                htmlFor="photos"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  cursor: "pointer",
                  background: "transparent",
                  transition: "background-color 0.3s",
                  borderRadius: "5px",
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                    borderRadius: "5px",
                    padding: "15px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <MdFileUpload style={{ fontSize: "34px" }} />
                </div>
              </label>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {imageFile &&
                imageFile.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                      backgroundImage: `url(${image.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  >
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeImage(image.id)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                      aria-label="Remove Image"
                    >
                      <CloseIcon />
                    </Button>
                  </div>
                ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Button
                type="submit"
                colorScheme="blue"
                variant="outline"
                borderColor="blue.500"
                mt={4}
                onClick={handleSubmit}
              >
                Create Post
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PostCreate;
