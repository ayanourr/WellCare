import {
  Button,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import userContext from "../../AuthContext/UserContext";
import ChangeProfilePic from "./ChangeProfilePic";

const EditAccount = () => {
  const [userData, setUserData] = useState({});
  const { setUser } = useContext(userContext);

  const [specialty, setSpecialty] = useState("");
  const [degree, setDegree] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [password, setPassword] = useState("");
  const [endpoint, setEndpoint] = useState("profile");
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [imageFile, setImageFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/users/loggedin-profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          setUser(response.data);
          setUserData(response.data);
          if (response.data.role === "DOCTOR") {
            setSpecialty(response.data.specialty);
            setDegree(response.data.degree);
            setAttachment(response.data.attachment);
            setAttachmentPreview(response.data.attachment);
          }
        } else {
          throw new Error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleImageFileChange = (selectedImage) => {
    setImageFile(selectedImage);
    setProfilePicture(selectedImage);
  };

  const handleAttachmentChange = (e) => {
    const selectedAttachment = e.target.files[0];
    if (selectedAttachment) {
      setAttachment(selectedAttachment);
      setAttachmentPreview(URL.createObjectURL(selectedAttachment));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("mobile", userData.mobile);
    formData.append("bio", userData.bio);
    if (userData.gender !== null) formData.append("gender", userData.gender);
    if (imageFile) {
      formData.append("profile_picture", imageFile);
    }

    if (userData.role === "DOCTOR" && endpoint === "profile/doctor") {
      formData.append("specialty", specialty);
      formData.append("degree", degree);
      if (attachment) {
        formData.append("attachment", attachment);
      }
    }
    if (password) {
      formData.append("password", password);
    }

    try {
      let response;
      if (userData.role === "DOCTOR" && endpoint === "profile/doctor") {
        response = await axios.put(
          "http://localhost:8080/api/users/profile/doctor",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.put(
          `http://localhost:8080/api/users/${endpoint}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      setUser(response.data.data);
      if (response.status === 200) {
        toast({
          title: "Profile updated successfully",
          status: "success",
          duration: 6000,
          isClosable: true,
        });
        navigate("/" + userData.username);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      toast({
        title: "Error updating profile",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6 rounded-md shadow-md">
    <div className="flex pb-7">
        <div className="w-[15%]">
          <img
            className="w-12 h-12 rounded-full"
            src={
              profilePicture
                ? URL.createObjectURL(profilePicture)
                : userData?.image ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
            }
            alt=""
          />
        </div>
        <div>
          <p>{userData?.username}</p>
          <p
            onClick={onOpen}
            className="font-bold text-blue-800 cursor-pointer"
          >
            Change Profile Picture
          </p>
          <ChangeProfilePic
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            handleProfileImageChange={handleImageFileChange}
          />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center">
        <FormControl className="flex mb-4" id="name">
          <FormLabel className="w-[15%]">Name</FormLabel>
          <div className="">
            <input
              placeholder="Name"
              className="w-50 px-3 py-1 border rounded-md"
              type="text"
              name="name"
              value={userData.name || ""}
              onChange={handleInputChange}
            />
          </div>
        </FormControl>
        <FormControl className="flex mb-4" id="email">
          <FormLabel className="w-[15%]">Email</FormLabel>
          <div className="">
            <input
              placeholder="Email"
              className="w-50 px-3 py-1 border rounded-md"
              type="email"
              name="email"
              value={userData.email || ""}
              onChange={handleInputChange}
            />
          </div>
        </FormControl>
        <FormControl className="flex mb-4" id="mobile">
          <FormLabel className="w-[15%]">Mobile</FormLabel>
          <div className="">
            <input
              placeholder="Mobile"
              className="w-50 px-3 py-1 border rounded-md"
              type="text"
              name="mobile"
              value={userData.mobile || ""}
              onChange={handleInputChange}
            />
          </div>
        </FormControl>
        <FormControl className="flex mb-4" id="bio">
          <FormLabel className="w-[15%]">Bio</FormLabel>
          <div className="">
            <input
              placeholder="Bio"
              className="w-50 px-3 py-1 border rounded-md"
              type="text"
              name="bio"
              value={userData.bio || ""}
              onChange={handleInputChange}
            />
          </div>
        </FormControl>
        <FormControl className="flex mb-4" id="gender">
          <FormLabel className="w-[15%]">Gender</FormLabel>
          <div className="">
            <input
              placeholder="Gender"
              className="w-50 px-3 py-1 border rounded-md"
              type="text"
              name="gender"
              value={userData.gender || ""}
              onChange={handleInputChange}
            />
          </div>
        </FormControl>
  
        {userData.role === "DOCTOR" && (
          <>
            <FormControl className="flex mb-4" id="endpoint">
              <FormLabel className="w-[15%]">Update</FormLabel>
              <RadioGroup value={endpoint} onChange={setEndpoint}>
                <Stack direction="row">
                  <Radio value="profile">Profile</Radio>
                  <Radio value="profile/doctor">Profile Doctor</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            {endpoint === "profile/doctor" && (
              <>
                <FormControl className="flex mb-4" id="specialty">
                  <FormLabel className="w-[15%]">Specialty</FormLabel>
                  <div className="">
                    <input
                      placeholder="Specialty"
                      className="w-50 px-3 py-1 border rounded-md"
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormControl className="flex mb-4" id="degree">
                  <FormLabel className="w-[15%]">Degree</FormLabel>
                  <div className="">
                    <input
                      placeholder="Degree"
                      className="w-50 px-3 py-1 border rounded-md"
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormControl className="flex mb-4" id="attachment">
                  <FormLabel className="w-[20%] mt-300">Attachment</FormLabel>
                  <div className="w-full flex items-center">
                    <input
                      id="attachment"
                      className="hidden"
                      type="file"
                      onChange={handleAttachmentChange}
                    />
                    <Button as="label" htmlFor="attachment" variant="ghost">
                      <FaUpload />
                    </Button>
                  </div>
                  {attachmentPreview && (
                    <img
                      src={attachmentPreview}
                      alt="Attachment Preview"
                      style={{ maxWidth: "100%", maxHeight: "200px", marginRight: "200px" }}
                    />
                  )}
                </FormControl>
              </>
            )}
          </>
        )}
  
        <FormControl className="flex mb-4" id="password">
          <FormLabel className="w-[15%]">Password</FormLabel>
          <div className="">
            <input
              placeholder="Password"
              className="w-50 px-3 py-1 border rounded-md"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </FormControl>
  
        <Button type="submit" colorScheme="blue" className="w-50 px-3 py-1 mt-5">
          Update Profile
        </Button>
      </form>
    </div>
  );
};

export default EditAccount;