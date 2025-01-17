import React from "react";
import { useNavigate } from "react-router-dom";

const SearchUserCard = ({ user, onUserClick }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate(`/${user.username}`);
    onUserClick();
  };

  return (
    <div onClick={handleUserClick} className="py-2 cursor-pointer">
      <div className="flex items-center">
        <img
          className="w-10 h-10 rounded-full"
          src={
            user.image ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
          }
          alt=""
        />
        <div className="ml-3">
          <p>{user.name}</p>
          <p className="opacity-70">{user.username}</p>
        </div>
      </div>
    </div>
  );
};

export default SearchUserCard;
