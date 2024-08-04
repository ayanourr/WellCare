import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileUserDetails from "../Components/ProfileComponents/ProfileUserDetails";
import UserPosts from "../Components/ProfileComponents/UserPosts";
import "./Profile.css";

const Profile = () => {
  const { username } = useParams();
  const [postCount, setPostCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [userProfile, setUserProfile] = useState();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
        const response = await axios.get(
          `http://localhost:8080/api/users/profile/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchProfile();
  }, [username]);

  const updatePostCount = async () => {
    if (userProfile) {
      const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
      const response = await axios.get(
        `http://localhost:8080/api/posts/${userProfile.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data._embedded)
        setPostCount(response.data._embedded.postList.length);
      else setPostCount(0);
    }
  };

  useEffect(() => {
    updatePostCount();
  }, [userProfile]);

  return (
    <div className="lg:px-20 backgroundColor">
      <ProfileUserDetails
        postCount={postCount}
        friendsCount={friendsCount}
        setFriendsCount={setFriendsCount}
        userProfile={userProfile}
      />
      <div className="">
        <UserPosts userProfile={userProfile} updatePosts={updatePostCount} />
      </div>
    </div>
  );
};

export default Profile;
