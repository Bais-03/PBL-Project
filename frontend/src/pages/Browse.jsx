import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import "../styles/listings.css";

export default function Browse() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get("/listings", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(res => setListings(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="browse-header">
        <h2>Available Academic Resources</h2>

        <Link to="/create">
          <button className="add-item-btn">➕ Add Item</button>
        </Link>
      </div>

      {/* Listings */}
      <div className="listings-container">
        {listings.length === 0 ? (
          <p>No items listed yet.</p>
        ) : (
          listings.map(item => (
            <div className="listing-card" key={item._id}>
              <h3>{item.title}</h3>
              <p>{item.category} • Semester {item.semester}</p>
              <p>{item.description}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}