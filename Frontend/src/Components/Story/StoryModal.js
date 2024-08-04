import { ConfigProvider, Modal } from "antd";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import Stories from "react-insta-stories";
import userContext from "../../AuthContext/UserContext";

const StoryModal = ({ isModalOpen, setIsModalOpen, stories = [] }) => {
  const [startOver, setStartOver] = useState(0);
  const [showDropDown, setShowDropDown] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const ref = useRef(null);

  const { user } = useContext(userContext);
  const isUser = user.id === stories[0].userId;

  const handleCancel = () => {
    setStartOver(0);
    setIsModalOpen(false);
  };

  const handleClick = () => {
    setShowDropDown(!showDropDown);
  };
  const [currentStoryId, setCurrentStoryId] = useState(null);

  // Rest of the component...

  const handleStoryStart = (story) => {
    // Set the ID of the current story when it starts
    setCurrentStoryId(story); // Assuming each story object has an 'id' property
  };

  const handleDeletePost = () => {
    setShowDropDown(false);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).accessToken;
      await axios.delete(
        `http://localhost:8080/api/stories/${stories[currentStoryId].id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsDeleteModalOpen(false);
      handleCancel();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleOutsideClick = (event) => {
    // Close dropdown when clicked outside
    if (ref.current && !ref.current.contains(event.target)) {
      setShowDropDown(false);
    }
  };

  // Attach event listener for outside click
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const items = [
    {
      key: "1",
      label: (
        <div className="flex items-center">
          <RiDeleteBin6Line
            style={{
              width: "1.5rem",
              color: "red",
              marginRight: "0.5rem",
            }}
          />
          <span style={{ color: "red" }} onClick={handleDelete}>
            Delete
          </span>
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "transparent",
            footerBg: "transparent",
            headerBg: "transparent",
          },
        },
      }}
    >
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
        // title={
        //   isUser && (
        //     <div className="relative" ref={ref}>
        //       <Dropdown
        //         menu={{
        //           items,
        //         }}
        //         placement="bottomLeft"
        //       >
        //         <BsThreeDots className="cursor-pointer" onClick={handleClick} />
        //       </Dropdown>
        //     </div>
        //   )
        // }
      >
        {stories.length > 0 ? (
          <Stories
            stories={stories}
            // defaultInterval={1500}
            width={350}
            height={750}
            keyboardNavigation={true}
            onStoryEnd={(s, st) => console.log("story ended", s, st)}
            onAllStoriesEnd={(s, st) => console.log("all stories ended", s, st)}
            onStoryStart={(s, st) => console.log("story started", s, st)}
            onNext={() => console.log("next button pressed")}
            onPrevious={() => console.log("previous button pressed")}
            isPaused={false}
          />
        ) : (
          <div>No stories available</div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default StoryModal;
