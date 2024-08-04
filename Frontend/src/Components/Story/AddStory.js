import React, { useContext } from "react";
import userContext from "../../AuthContext/UserContext";

function AddStory({ onAddStory }) {
  const { user } = useContext(userContext);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    onAddStory(selectedFile);
  };

  const handleClick = () => {
    document.getElementById("fileInput").click();
  };

  if (user)
    return (
      <div style={{ marginLeft: "5px" }}>
        <div
          style={{
            position: "relative",
            border: `5px solid rgb(59 130 246)`,
            width: "200px",
            height: "350px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={handleClick}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*, video/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div
            style={{
              backgroundImage: `url(${
                user.image
                  ? user.image
                  : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
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
          <label
            className="add-story"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
              color: "white",
            }}
          >
            <img
              src={
                user.image
                  ? user.image
                  : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
              }
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
              alt="user_image"
            />
            <h1
              style={{
                marginTop: "10px",
                color: "white",
              }}
            >
              Create a story
            </h1>
          </label>
        </div>
      </div>
    );
}

export default AddStory;
