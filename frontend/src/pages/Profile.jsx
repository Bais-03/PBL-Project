import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    semester: "",
  });
  const [toast, setToast] = useState(null);

  // Wrap fetch functions in useCallback
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await axios.get("/users/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(res.data);
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        college: res.data.college || "",
        semester: res.data.semester || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  const fetchUserListings = useCallback(async () => {
    try {
      const res = await axios.get("/users/listings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setListings(res.data);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchUserListings();
  }, [fetchUserProfile, fetchUserListings]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/users/profile", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(response.data);
      setEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      await axios.delete(`/listings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setListings(listings.filter((l) => l._id !== id));
      showToast("Listing deleted successfully", "success");
    } catch (err) {
      showToast("Failed to delete listing", "error");
    }
  };

  const handleMarkAsSold = async (id) => {
    try {
      await axios.patch(`/listings/${id}/status`, 
        { status: "sold" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setListings(listings.map((l) => l._id === id ? { ...l, status: "sold" } : l));
      showToast("Listing marked as sold", "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleEditListing = (id) => {
    // Since there's no edit page yet, we can either:
    // Option 1: Navigate to create with pre-filled data (if supported)
    // Option 2: Show a message that edit is coming soon
    // Option 3: Open a modal for quick edit
    
    // For now, showing a toast message
    showToast("Edit functionality coming soon!", "info");
    
    // If you have an edit page later, uncomment this:
    // navigate(`/edit/${id}`);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="profile">
      {/* Toast Notification */}
      {toast && (
        <div className={`profile__toast profile__toast--${toast.type}`}>
          {toast.type === "success" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          )}
          {toast.type === "error" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Header with back button */}
      <div className="profile__header">
        <button className="profile__back" onClick={() => navigate("/browse")}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Back to Marketplace
        </button>
      </div>

      {/* Profile Content */}
      <div className="profile__content">
        {/* Profile Sidebar */}
        <div className="profile__sidebar">
          <div className="profile__avatar-wrapper">
            <div className="profile__avatar">
              {user ? getInitials(user.name) : "U"}
            </div>
            <button className="profile__avatar-edit" title="Change photo">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          <div className="profile__info">
            {user && (
              <>
                <h2 className="profile__name">{user.name || "User"}</h2>
                <p className="profile__email">{user.email}</p>
                
                <div className="profile__stats">
                  <div className="profile__stat">
                    <span className="profile__stat-value">{listings.length}</span>
                    <span className="profile__stat-label">Listings</span>
                  </div>
                  <div className="profile__stat">
                    <span className="profile__stat-value">
                      {listings.filter(l => l.status === "sold").length}
                    </span>
                    <span className="profile__stat-label">Sold</span>
                  </div>
                  <div className="profile__stat">
                    <span className="profile__stat-value">
                      {listings.filter(l => l.status === "available").length}
                    </span>
                    <span className="profile__stat-label">Active</span>
                  </div>
                </div>

                {user.college && (
                  <div className="profile__detail">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356.257l-2.5 3.5A1 1 0 014 13v3a1 1 0 001 1h10a1 1 0 001-1v-3a1 1 0 00-.106-.442l-2.5-3.5a1 1 0 01.356-.257l2.644-1.131a1 1 0 000-1.84l-7-3z" />
                    </svg>
                    {user.college}
                  </div>
                )}

                {user.phone && (
                  <div className="profile__detail">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +91 {user.phone}
                  </div>
                )}

                {user.semester && (
                  <div className="profile__detail">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Semester {user.semester}
                  </div>
                )}
              </>
            )}

            <button 
              className="profile__edit-btn"
              onClick={() => setEditing(true)}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="profile__main">
          {/* Tabs */}
          <div className="profile__tabs">
            <button
              className={`profile__tab ${activeTab === "listings" ? "profile__tab--active" : ""}`}
              onClick={() => setActiveTab("listings")}
            >
              My Listings
            </button>
            <button
              className={`profile__tab ${activeTab === "saved" ? "profile__tab--active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              Saved Items
            </button>
            <button
              className={`profile__tab ${activeTab === "activity" ? "profile__tab--active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile__tab-content">
            {activeTab === "listings" && (
              <div className="profile__listings">
                <div className="profile__listings-header">
                  <h3>Your Listings</h3>
                  <button 
                    className="profile__create-listing"
                    onClick={() => navigate("/create")}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Create New
                  </button>
                </div>

                {loading ? (
                  <div className="profile__loading">
                    <div className="profile__spinner" />
                    <p>Loading your listings...</p>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="profile__empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                    </svg>
                    <h4>No listings yet</h4>
                    <p>Start sharing items with your campus community</p>
                    <button 
                      className="profile__empty-btn"
                      onClick={() => navigate("/create")}
                    >
                      Create Your First Listing
                    </button>
                  </div>
                ) : (
                  <div className="profile__listings-grid">
                    {listings.map((listing) => (
                      <div key={listing._id} className="profile__listing-card">
                        <div className="profile__listing-image">
                          {listing.image ? (
                            <img src={listing.image} alt={listing.title} />
                          ) : (
                            <div className="profile__listing-placeholder">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="20" height="20" rx="2.18" />
                                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
                              </svg>
                            </div>
                          )}
                          <span className={`profile__listing-status status--${listing.status || "available"}`}>
                            {listing.status || "Available"}
                          </span>
                        </div>
                        
                        <div className="profile__listing-info">
                          <h4 className="profile__listing-title">{listing.title}</h4>
                          <p className="profile__listing-price">
                            {listing.priceType === "free" && "Free"}
                            {listing.priceType === "negotiable" && "Negotiable"}
                            {listing.priceType === "fixed" && listing.price && `₹${listing.price.toLocaleString("en-IN")}`}
                          </p>
                          <p className="profile__listing-date">
                            Posted {formatDate(listing.createdAt)}
                          </p>
                          
                          <div className="profile__listing-actions">
                            <button 
                              className="profile__listing-btn profile__listing-btn--edit"
                              onClick={() => handleEditListing(listing._id)}
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit
                            </button>
                            
                            {listing.status !== "sold" && (
                              <button 
                                className="profile__listing-btn profile__listing-btn--sold"
                                onClick={() => handleMarkAsSold(listing._id)}
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                Mark Sold
                              </button>
                            )}
                            
                            <button 
                              className="profile__listing-btn profile__listing-btn--delete"
                              onClick={() => handleDeleteListing(listing._id)}
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div className="profile__saved">
                <h3>Saved Items</h3>
                <div className="profile__empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  <h4>No saved items yet</h4>
                  <p>Items you save will appear here</p>
                  <button 
                    className="profile__empty-btn"
                    onClick={() => navigate("/browse")}
                  >
                    Browse Marketplace
                  </button>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="profile__activity">
                <h3>Recent Activity</h3>
                <div className="profile__empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <h4>No recent activity</h4>
                  <p>Your activity history will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="profile__modal-overlay" onClick={() => setEditing(false)}>
          <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile__modal-header">
              <h3>Edit Profile</h3>
              <button className="profile__modal-close" onClick={() => setEditing(false)}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile__form">
              <div className="profile__form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="profile__form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="profile__form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="profile__form-group">
                <label htmlFor="college">College/University</label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="Enter your college name"
                />
              </div>

              <div className="profile__form-group">
                <label htmlFor="semester">Current Semester</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                >
                  <option value="">Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div className="profile__form-actions">
                <button type="button" className="profile__form-cancel" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="profile__form-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}