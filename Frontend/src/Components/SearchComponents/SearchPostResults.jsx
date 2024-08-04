import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PostCard from "../Post/PostCard"; 
import { searchPosts } from "./searchPostsQuery";

const SearchPostResults = () => {
  const location = useLocation();
  const { query } = location.state;
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {

        const posts = await searchPosts(query);
        setPosts(posts);
        setError(null);
      } catch (error) {
        setError("Error fetching search results");
        console.error("Error fetching search results:", error);
      }
    };

    fetchPosts();
  }, [query]);

  return (
    <div className="mb-20">
      <div className="justify-center px-3 pt-5">
        {error && <p>{error}</p>}
        {posts.length > 0 ? (
          posts.map((post) => 
        
        <div key={post.id} className="mb-4"> 
            <PostCard post={post} />
          </div>
        
        )
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchPostResults;
