import { useState } from "react";
import axios from "../api/axios";
import "../styles/form.css";
import "../styles/createListing.css";

export default function CreateListing() {
  const [data, setData] = useState({});

  const submit = async () => {
    try {
      await axios.post("/listings", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      alert("Listing created");
    } catch (err) {
      alert("Failed to create listing");
    }
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <h2>Add Academic Resource</h2>

        <div className="form-group">
          <input placeholder="Title"
            onChange={e => setData({ ...data, title: e.target.value })} />
        </div>

        <div className="form-group">
          <input placeholder="Category (Book / Notes)"
            onChange={e => setData({ ...data, category: e.target.value })} />
        </div>

        <div className="form-group">
          <input placeholder="Semester"
            onChange={e => setData({ ...data, semester: e.target.value })} />
        </div>

        <div className="form-group">
          <textarea placeholder="Description"
            onChange={e => setData({ ...data, description: e.target.value })} />
        </div>

        <button className="create-btn" onClick={submit}>
          Create Listing
        </button>
      </div>
    </div>
  );
}