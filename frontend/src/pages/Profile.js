import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import API from "../api";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await API.get("/auth/me");
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name || "",
        email: response.data.user.email || "",
        phone: response.data.user.phone || "",
        address: response.data.user.address || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || ""
    });
  };

  const handleSave = async () => {
    try {
      const response = await API.put("/auth/profile", formData);
      setUser(response.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="container-responsive" style={{ paddingTop: 24 }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container-responsive" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
            <User size={20} color="#0f766e" />
          </div>
          
          {isEditing ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div className="form-field">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div className="form-field">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div className="form-field">
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div className="form-field">
                <label className="label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input"
                  rows={3}
                />
              </div>
              
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleSave} className="btn btn-primary">
                  <Save size={16} />
                  Save Changes
                </button>
                <button onClick={handleCancel} className="btn">
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <User size={16} color="#6b7280" />
                <div>
                  <p style={{ fontWeight: 600 }}>Name</p>
                  <p className="text-muted">{user?.name || "Not provided"}</p>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Mail size={16} color="#6b7280" />
                <div>
                  <p style={{ fontWeight: 600 }}>Email</p>
                  <p className="text-muted">{user?.email || "Not provided"}</p>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Phone size={16} color="#6b7280" />
                <div>
                  <p style={{ fontWeight: 600 }}>Phone</p>
                  <p className="text-muted">{user?.phone || "Not provided"}</p>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MapPin size={16} color="#6b7280" />
                <div>
                  <p style={{ fontWeight: 600 }}>Address</p>
                  <p className="text-muted">{user?.address || "Not provided"}</p>
                </div>
              </div>
              
              <button onClick={handleEdit} className="btn btn-primary">
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Account Details</h2>
            <User size={20} color="#0f766e" />
          </div>
          
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <p style={{ fontWeight: 600 }}>Role</p>
              <span className="badge badge-blue">{user?.role || "Unknown"}</span>
            </div>
            
            <div>
              <p style={{ fontWeight: 600 }}>Account Created</p>
              <p className="text-muted">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            
            <div>
              <p style={{ fontWeight: 600 }}>Last Updated</p>
              <p className="text-muted">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;








