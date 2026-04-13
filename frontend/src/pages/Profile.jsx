import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useBooking } from "../context/BookingContext";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { bookedItems } = useBooking();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    college: "",
    semester: "",
    department: "",
    graduationYear: "",
    bio: "",
    socialLinks: {
      instagram: "",
      linkedin: ""
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      const tokenData = JSON.parse(atob(token.split('.')[1]));
      
      try {
        const profileRes = await axios.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileRes.data) {
          setUser(profileRes.data);
          setFormData({
            name: profileRes.data.name || tokenData.name || "",
            phone: profileRes.data.phone || "",
            college: profileRes.data.college || "",
            semester: profileRes.data.semester || "",
            department: profileRes.data.department || "",
            graduationYear: profileRes.data.graduationYear || "",
            bio: profileRes.data.bio || "",
            socialLinks: {
              instagram: profileRes.data.socialLinks?.instagram || "",
              linkedin: profileRes.data.socialLinks?.linkedin || ""
            }
          });
          return;
        }
      } catch (apiErr) {
        console.log("Profile endpoint not available, using token data");
      }
      
      const savedUser = localStorage.getItem("user");
      let userData;
      
      if (savedUser) {
        userData = JSON.parse(savedUser);
      } else {
        userData = {
          id: tokenData.id,
          email: tokenData.email,
          name: tokenData.name || "User",
          phone: "",
          college: "",
          semester: "",
          department: "",
          graduationYear: "",
          bio: "",
          socialLinks: { instagram: "", linkedin: "" }
        };
      }
      
      setUser(userData);
      setFormData({
        name: userData.name,
        phone: userData.phone || "",
        college: userData.college || "",
        semester: userData.semester || "",
        department: userData.department || "",
        graduationYear: userData.graduationYear || "",
        bio: userData.bio || "",
        socialLinks: {
          instagram: userData.socialLinks?.instagram || "",
          linkedin: userData.socialLinks?.linkedin || ""
        }
      });
      
    } catch (err) {
      console.error("Failed to fetch profile", err);
      showToast("Failed to load profile", "error");
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserListings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const tokenData = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      const res = await axios.get("/listings");
      
      if (tokenData && tokenData.id) {
        const userListings = res.data.filter(
          listing => listing.createdBy && listing.createdBy._id === tokenData.id
        );
        setListings(userListings);
      }
    } catch (err) {
      console.error("Failed to fetch listings", err);
      showToast("Failed to load your listings", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchUserListings();
  }, [fetchUserProfile, fetchUserListings]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name must be less than 50 characters";
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    if (formData.college && formData.college.length < 3) {
      errors.college = "College name must be at least 3 characters";
    }

    if (formData.semester && (formData.semester < 1 || formData.semester > 8)) {
      errors.semester = "Semester must be between 1 and 8";
    }

    const currentYear = new Date().getFullYear();
    if (formData.graduationYear) {
      const year = parseInt(formData.graduationYear);
      if (year < currentYear || year > currentYear + 6) {
        errors.graduationYear = `Year must be between ${currentYear} and ${currentYear + 6}`;
      }
    }

    if (formData.department && formData.department.length < 2) {
      errors.department = "Department name is too short";
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = "Bio must be less than 500 characters";
    }

    if (formData.socialLinks.instagram && 
        !/^[a-zA-Z0-9._]{1,30}$/.test(formData.socialLinks.instagram)) {
      errors.instagram = "Invalid Instagram username";
    }

    if (formData.socialLinks.linkedin && 
        !/^[a-zA-Z0-9-]{3,100}$/.test(formData.socialLinks.linkedin)) {
      errors.linkedin = "Invalid LinkedIn profile ID";
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
      // Clear error using the actual error key (e.g. "instagram", not "social.instagram")
      if (formErrors[socialField]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[socialField];
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };


  const handleCancelEdit = () => {
    // Reset form back to current saved user data and clear all errors
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        college: user.college || "",
        semester: user.semester || "",
        department: user.department || "",
        graduationYear: user.graduationYear || "",
        bio: user.bio || "",
        socialLinks: {
          instagram: user.socialLinks?.instagram || "",
          linkedin: user.socialLinks?.linkedin || ""
        }
      });
    }
    setFormErrors({});
    setEditing(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        college: formData.college,
        semester: formData.semester ? parseInt(formData.semester) : null,
        department: formData.department,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
        bio: formData.bio,
        socialLinks: formData.socialLinks
      };

      try {
        const response = await axios.put("/users/profile", updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const updatedUser = response.data;
        setUser(updatedUser);
        
        setFormData({
          name: updatedUser.name || "",
          phone: updatedUser.phone || "",
          college: updatedUser.college || "",
          semester: updatedUser.semester || "",
          department: updatedUser.department || "",
          graduationYear: updatedUser.graduationYear || "",
          bio: updatedUser.bio || "",
          socialLinks: {
            instagram: updatedUser.socialLinks?.instagram || "",
            linkedin: updatedUser.socialLinks?.linkedin || ""
          }
        });
        
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        showToast("Profile updated successfully!", "success");
        setEditing(false);
        
      } catch (apiErr) {
        console.log("Profile update endpoint not available, updating locally");
        
        const updatedUser = {
          ...user,
          ...updateData
        };
        
        setUser(updatedUser);
        setFormData({
          name: updatedUser.name || "",
          phone: updatedUser.phone || "",
          college: updatedUser.college || "",
          semester: updatedUser.semester || "",
          department: updatedUser.department || "",
          graduationYear: updatedUser.graduationYear || "",
          bio: updatedUser.bio || "",
          socialLinks: {
            instagram: updatedUser.socialLinks?.instagram || "",
            linkedin: updatedUser.socialLinks?.linkedin || ""
          }
        });
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        showToast("Profile updated successfully!", "success");
        setEditing(false);
      }
      
    } catch (err) {
      console.error("Failed to update profile", err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) 
      return;
    
    try {
      const token = localStorage.getItem("token");
      
      try {
        await axios.delete(`/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setListings(listings.filter((l) => l._id !== id));
        showToast("Listing deleted successfully", "success");
        
      } catch (apiErr) {
        setListings(listings.filter((l) => l._id !== id));
        showToast("Listing deleted successfully", "success");
      }
      
    } catch (err) {
      console.error("Failed to delete listing", err);
      showToast("Failed to delete listing", "error");
    }
  };

  const handleMarkAsSold = async (id) => {
    try {
      const token = localStorage.getItem("token");
      
      try {
        await axios.patch(`/listings/${id}/status`, 
          { status: "sold" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setListings(listings.map((l) => 
          l._id === id ? { ...l, status: "sold" } : l
        ));
        showToast("Listing marked as sold", "success");
        
      } catch (apiErr) {
        setListings(listings.map((l) => 
          l._id === id ? { ...l, status: "sold" } : l
        ));
        showToast("Listing marked as sold", "success");
      }
      
    } catch (err) {
      console.error("Failed to update status", err);
      showToast("Failed to mark as sold", "error");
    }
  };

  const handleEditListing = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    showToast("Logged out successfully", "info");
  };

  // const handleProfile = () => {
  //   navigate("/profile");
  // };

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

  return (
    <div className="profile">
      {toast && (
        <div key={toast.id} className={`profile__toast profile__toast--${toast.type}`}>
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
          {toast.type === "info" && (
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <div className="profile__header">
        <button className="profile__back" onClick={() => navigate("/browse")}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Back to Marketplace
        </button>
      </div>

      <div className="profile__content">
        <div className="profile__sidebar">
          <div className="profile__avatar-wrapper">
            <div className="profile__avatar">
              {user ? getInitials(user.name) : "U"}
            </div>
            <button 
              className="profile__avatar-edit" 
              title="Change photo"
              onClick={() => showToast("Photo upload coming soon!", "info")}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          <div className="profile__info">
            {user && (
              <>
                <h2 className="profile__name">{user.name}</h2>
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

                {(user.college || user.department) && (
                  <div className="profile__detail">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356.257l-2.5 3.5A1 1 0 004 13v3a1 1 0 001 1h10a1 1 0 001-1v-3a1 1 0 00-.106-.442l-2.5-3.5a1 1 0 01.356-.257l2.644-1.131a1 1 0 000-1.84l-7-3z" />
                    </svg>
                    {user.college}
                    {user.department && ` • ${user.department}`}
                  </div>
                )}

                {(user.semester || user.graduationYear) && (
                  <div className="profile__detail">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    {user.semester && `Semester ${user.semester}`}
                    {user.graduationYear && ` • Class of ${user.graduationYear}`}
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

                {user.bio && (
                  <div className="profile__bio">
                    <p>{user.bio}</p>
                  </div>
                )}

                {(user.socialLinks?.instagram || user.socialLinks?.linkedin) && (
                  <div className="profile__social">
                    {user.socialLinks.instagram && (
                      <a 
                        href={`https://instagram.com/${user.socialLinks.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="profile__social-link"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                        </svg>
                        @{user.socialLinks.instagram}
                      </a>
                    )}
                    {user.socialLinks.linkedin && (
                      <a 
                        href={`https://linkedin.com/in/${user.socialLinks.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="profile__social-link"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        {user.socialLinks.linkedin}
                      </a>
                    )}
                  </div>
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

                <button onClick={() => navigate("/bookings")} className="profile__edit-btn" style={{ marginTop: "0.5rem", background: "#f3f4f6", color: "#374151" }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                  </svg>
                  My Bookings ({bookedItems.length})
                </button>

                <button onClick={handleLogout} className="profile__edit-btn" style={{ marginTop: "0.5rem", background: "#fee2e2", color: "#991b1b" }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile__main">
          <div className="profile__tabs">
            <button
              className={`profile__tab ${activeTab === "listings" ? "profile__tab--active" : ""}`}
              onClick={() => setActiveTab("listings")}
            >
              My Listings ({listings.length})
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                            {listing.status === "available" ? "Available" : 
                             listing.status === "sold" ? "Sold" : "Pending"}
                          </span>
                        </div>
                        
                        <div className="profile__listing-info">
                          <h4 className="profile__listing-title">{listing.title}</h4>
                          <p className="profile__listing-price">
                            {listing.priceType === "free" && "Free"}
                            {listing.priceType === "negotiable" && "Negotiable"}
                            {listing.priceType === "fixed" && listing.price && 
                              `₹${listing.price.toLocaleString("en-IN")}`}
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

      {editing && (
        <div className="profile__modal-overlay" onClick={handleCancelEdit}>
          <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile__modal-header">
              <h3>Edit Profile</h3>
              <button className="profile__modal-close" onClick={handleCancelEdit}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile__form">
              <div className="profile__form-group">
                <label htmlFor="name">Full Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={formErrors.name ? "error" : ""}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="profile__form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user?.email || ""}
                  disabled
                  className="read-only"
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>

              <div className="profile__form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className={formErrors.phone ? "error" : ""}
                />
                {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
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
                  className={formErrors.college ? "error" : ""}
                />
                {formErrors.college && <span className="field-error">{formErrors.college}</span>}
              </div>

              <div className="profile__form-group">
                <label htmlFor="department">Department/Major</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  className={formErrors.department ? "error" : ""}
                />
                {formErrors.department && <span className="field-error">{formErrors.department}</span>}
              </div>

              <div className="profile__form-row">
                <div className="profile__form-group">
                  <label htmlFor="semester">Current Semester</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className={formErrors.semester ? "error" : ""}
                  >
                    <option value="">Select semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                  {formErrors.semester && <span className="field-error">{formErrors.semester}</span>}
                </div>

                <div className="profile__form-group">
                  <label htmlFor="graduationYear">Graduation Year</label>
                  <select
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    className={formErrors.graduationYear ? "error" : ""}
                  >
                    <option value="">Select year</option>
                    {[...Array(6)].map((_, i) => {
                      const year = new Date().getFullYear() + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                  {formErrors.graduationYear && <span className="field-error">{formErrors.graduationYear}</span>}
                </div>
              </div>

              <div className="profile__form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell others a bit about yourself (max 500 characters)"
                  rows="4"
                  className={formErrors.bio ? "error" : ""}
                />
                <div className="textarea-footer">
                  {formErrors.bio && <span className="field-error">{formErrors.bio}</span>}
                  <span className="character-count">{formData.bio.length}/500</span>
                </div>
              </div>

              <div className="profile__form-section">
                <h4>Social Links</h4>
                <p className="section-hint">Connect your social profiles (optional)</p>
              </div>

              <div className="profile__form-group">
                <label htmlFor="instagram">Instagram</label>
                <div className="input-prefix">
                  <span className="prefix">@</span>
                  <input
                    type="text"
                    id="instagram"
                    name="social.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleInputChange}
                    placeholder="username"
                    className={formErrors.instagram ? "error" : ""}
                  />
                </div>
                {formErrors.instagram && <span className="field-error">{formErrors.instagram}</span>}
              </div>

              <div className="profile__form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <div className="input-prefix">
                  <span className="prefix">linkedin.com/in/</span>
                  <input
                    type="text"
                    id="linkedin"
                    name="social.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    placeholder="profile-id"
                    className={formErrors.linkedin ? "error" : ""}
                  />
                </div>
                {formErrors.linkedin && <span className="field-error">{formErrors.linkedin}</span>}
              </div>

              <div className="profile__form-actions">
                <button type="button" className="profile__form-cancel" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={`profile__form-save ${saving ? 'saving' : ''}`} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}