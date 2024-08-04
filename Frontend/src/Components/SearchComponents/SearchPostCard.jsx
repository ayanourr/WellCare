import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchPostCard = ({ post }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const postId = post.id;



  return (
    <div className="py-2 cursor-pointer">
      <div className="flex items-center">

        <div className="ml-3 justify-center items-center">
          <p>{post.user.username}</p>
          <p className="opacity-70">{post.content}</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPostCard;
