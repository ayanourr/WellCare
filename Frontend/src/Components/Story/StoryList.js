import axios from "axios";
import { useContext, useEffect, useState } from "react";
import userContext from "../../AuthContext/UserContext";
import AddStory from "./AddStory";
import StoryModal from "./StoryModal";

const StoryListContainer = () => {
  const { user } = useContext(userContext);

  const [rectangles, setRectangles] = useState([]);

  const handleAddStory = async (file) => {
    const token = JSON.parse(localStorage.getItem("user")).accessToken;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", "null");

    try {
      const response = await axios.post(
        `http://localhost:8080/api/stories/user/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Parse file name to get extension
      const fileName = response.data.image;
      const fileExtension = fileName.split(".").pop().toLowerCase();

      // Check if extension is for video or image
      const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(
        fileExtension
      );

      const newStory = {
        id: response.data.id,
        header: {
          heading: user.name,
          subheading: `${new Date().toUTCString()}`,
          profileImage:
            user.image ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        },
        url: response.data.image,
        duration: 6000,
        userId: user.id,
        type: isVideo ? "video" : "image",
      };

      setRectangles((prevRectangles) => {
        const existingRect = prevRectangles.find(
          (rect) => rect.userId === user.id
        );
        let updatedRectangles;
        if (existingRect) {
          updatedRectangles = prevRectangles.map((rect) => {
            if (rect.userId === user.id) {
              return {
                ...rect,
                stories: [...rect.stories, newStory],
              };
            }
            return rect;
          });
        } else {
          const newId = prevRectangles.length
            ? prevRectangles[prevRectangles.length - 1].id + 1
            : 1;
          updatedRectangles = [
            ...prevRectangles,
            { id: newId, userId: user.id, stories: [newStory] },
          ];
        }
        // Ensure user's stories are first
        return updatedRectangles.sort((a, b) =>
          a.userId === user.id ? -1 : b.userId === user.id ? 1 : 0
        );
      });
    } catch (error) {
      console.error("Error adding story:", error);
    }
  };

  const fetchStories = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.accessToken) {
        console.error("User data or access token not available");
        return;
      }
      const token = userData.accessToken;

      const response = await axios.get(
        "http://localhost:8080/api/stories/active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const storiesByUser = {};

      response.data.forEach((story) => {
        const userId = story.user.id;
        if (!storiesByUser[userId]) {
          storiesByUser[userId] = {
            id: Object.keys(storiesByUser).length + 1,
            userId: userId,
            stories: [],
          };
        }
        const fileName = story.image;
        const fileExtension = fileName.split(".").pop().toLowerCase();

        // Check if extension is for video or image
        const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(
          fileExtension
        );
        storiesByUser[userId].stories.push({
          id: story.id,
          userId: userId,
          header: {
            heading: story.user.username,
            subheading: story.createdAt,
            profileImage:
              story.user.image ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
          },
          url: story.image,
          duration: 6000,
          type: isVideo ? "video" : "image",
        });
      });

      const rectanglesArray = Object.values(storiesByUser);

      rectanglesArray.sort((a, b) =>
        a.userId === user.id ? -1 : b.userId === user.id ? 1 : 0
      );

      setRectangles(rectanglesArray);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  function ColorfulRectangular({ id, stories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRectId, setSelectedRectId] = useState(null);

    const handleClick = (id) => {
      setSelectedRectId(id);
      setIsModalOpen(true);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
      setSelectedRectId(null);
    };

    return (
      <div>
        <div
          style={{
            position: "relative",
            border: `5px solid rgb(59 130 246)`,
            width: "200px",
            height: "350px",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => handleClick(id)}
        >
          <div
            style={{
              backgroundImage: `url(${
                stories[0]?.url ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.3,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
          <div
            style={{
              backgroundColor: "black",
              opacity: 0.5,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
          <img
            alt="story"
            style={{
              objectFit: "cover",
              borderRadius: "50%",
              position: "relative",
              zIndex: 1,
              width: "120px",
              height: "120px",
            }}
            src={
              stories[0]?.header.profileImage ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
            }
          />
          <h1
            style={{
              fontSize: "20px",
              marginTop: "10px",
              color: "black",
              position: "relative",
              zIndex: 1,
            }}
          >
            {stories[0].header.heading}
          </h1>
        </div>
        {isModalOpen && selectedRectId === id && (
          <StoryModal
            setIsModalOpen={setIsModalOpen}
            isModalOpen={isModalOpen}
            stories={stories}
            handleCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginTop: "30px",
        marginRight: "20px",
        marginLeft: "20px",
        overflowX: "scroll",
      }}
    >
      <AddStory onAddStory={handleAddStory} />
      {rectangles.map((rect) => (
        <ColorfulRectangular
          key={rect.id}
          id={rect.id}
          stories={rect.stories}
        />
      ))}
    </div>
  );
};

export default StoryListContainer;
