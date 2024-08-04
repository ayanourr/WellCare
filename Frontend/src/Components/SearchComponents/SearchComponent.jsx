import axios from "axios";
import React, { useEffect, useState } from "react";
import "./SearchComponent.css";
import SearchUserCard from "./SearchUserCard";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));

        const token = userData.accessToken;
        const response = await axios.get(
          `http://localhost:8080/api/users/search?q=${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSearchResults(response.data);
        if (response.data.length === 0) {
          setError("No users found");
        } else {
          setError(null);
        }
      } catch (error) {
        setError("Error fetching search results");
        setSearchResults([]);
        console.error("Error fetching search results:", error);
      }
    };

    if (query.trim() !== "") {
      fetchSearchResults();
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [query]);

  return (
    <div className="searchContainer z-9999">
      <div className="px-3 pb-5">
        <h1 className="text-xl pb-3">Search</h1>
        <input
          onChange={handleSearch}
          value={query}
          className="searchInput"
          type="search"
          placeholder="Search..."
          style={{ paddingRight: '90px' }}
        />
        {error && <p>{error}</p>}
      </div>

      <hr />

      {/* <div className="px-3 pt-5">
        {searchResults.map((user) => (
          <SearchUserCard key={user.id} user={user} />
        ))}
      </div> */}
    </div>
  );
};

export default SearchComponent;
