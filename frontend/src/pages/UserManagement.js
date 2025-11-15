import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    UserPlus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Shield, 
    Stethoscope, 
    User,
    Mail,
    Phone,
    Calendar,
    Eye,
    EyeOff
} from "lucide-react";
import { toast } from "sonner";
import API from "../api";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        phone: "",
        role: "patient",
        password: ""
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await API.get("/auth/users");
            setUsers(response.data.users || []);
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post("/auth/register", newUser);
            toast.success("User created successfully");
            setShowAddUser(false);
            setNewUser({ name: "", email: "", phone: "", role: "patient", password: "" });
            
            // Add the new user to the current list immediately
            const newUserData = {
                _id: response.data.user?.id || Date.now().toString(),
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                createdAt: new Date().toISOString()
            };
            setUsers(prevUsers => [newUserData, ...prevUsers]);
            
            // Also reload from server to ensure consistency
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.msg || "Failed to create user");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/auth/users/${editingUser._id}`, editingUser);
            toast.success("User updated successfully");
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await API.delete(`/auth/users/${userId}`);
                toast.success("User deleted successfully");
                loadUsers();
            } catch (error) {
                toast.error("Failed to delete user");
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin": return <Shield size={16} />;
            case "doctor": return <Stethoscope size={16} />;
            case "patient": return <User size={16} />;
            default: return <User size={16} />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "admin": return "badge-blue";
            case "doctor": return "badge-green";
            case "patient": return "badge";
            default: return "badge";
        }
    };

    if (loading) {
        return <div className="container-responsive" style={{ paddingTop: 24 }}><p>Loading...</p></div>;
    }

    return (
        <div className="container-responsive" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage all users in the system - patients, doctors, and admins.</p>
            </div>

            {/* User Statistics */}
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0b5f59 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Patients</p>
                            <h3 style={{ fontSize: '24px', margin: '4px 0 0 0' }}>{users.filter(u => u.role === 'patient').length}</h3>
                        </div>
                        <User size={24} />
                    </div>
                </div>
                <div className="card" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Doctors</p>
                            <h3 style={{ fontSize: '24px', margin: '4px 0 0 0' }}>{users.filter(u => u.role === 'doctor').length}</h3>
                        </div>
                        <Stethoscope size={24} />
                    </div>
                </div>
                <div className="card" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Admins</p>
                            <h3 style={{ fontSize: '24px', margin: '4px 0 0 0' }}>{users.filter(u => u.role === 'admin').length}</h3>
                        </div>
                        <Shield size={24} />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                        <Search size={16} />
                        <input
                            className="input"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1 }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Filter size={16} />
                        <select 
                            className="input" 
                            value={roleFilter} 
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{ minWidth: 120 }}
                        >
                            <option value="all">All Roles</option>
                            <option value="patient">Patients</option>
                            <option value="doctor">Doctors</option>
                            <option value="admin">Admins</option>
                        </select>
                        {(searchQuery || roleFilter !== "all") && (
                            <button 
                                className="btn btn-outline" 
                                onClick={() => {
                                    setSearchQuery("");
                                    setRoleFilter("all");
                                }}
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddUser(true)}
                    >
                        <UserPlus size={16} />
                        Add User
                    </button>
                </div>
            </div>

            {/* Users List */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        Users ({filteredUsers.length})
                        {roleFilter !== "all" && (
                            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: 8 }}>
                                • Filtered by {roleFilter}s
                            </span>
                        )}
                    </h2>
                    <Users size={20} color="#0f766e" />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>User</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Role</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Contact</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div>
                                            <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>{user.name}</p>
                                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{user.email}</p>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`badge ${getRoleColor(user.role)}`} style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                                            {getRoleIcon(user.role)}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Phone size={14} />
                                            <span style={{ fontSize: '14px' }}>{user.phone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Calendar size={14} />
                                            <span style={{ fontSize: '14px' }}>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button 
                                                className="btn btn-outline" 
                                                style={{ padding: '6px 8px' }}
                                                onClick={() => setEditingUser(user)}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                className="btn btn-outline" 
                                                style={{ padding: '6px 8px', color: '#ef4444' }}
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '32px 16px',
                            color: '#6b7280'
                        }}>
                            <Users size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                            <p>No users found</p>
                            {searchQuery && <p style={{ fontSize: '14px', marginTop: 8 }}>Try adjusting your search or filter criteria</p>}
                            {roleFilter !== "all" && <p style={{ fontSize: '14px', marginTop: 8 }}>No {roleFilter}s found</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card"
                        style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflow: 'auto' }}
                    >
                        <div className="card-header">
                            <h2 className="card-title">Add New User</h2>
                            <button 
                                className="btn btn-outline" 
                                onClick={() => setShowAddUser(false)}
                                style={{ padding: '4px 8px' }}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="form-field">
                                <label className="label">Name</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label className="label">Email</label>
                                <input
                                    className="input"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label className="label">Phone</label>
                                <input
                                    className="input"
                                    type="tel"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label className="label">Role</label>
                                <select
                                    className="input"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    required
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="label">Password</label>
                                <input
                                    className="input"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <button type="submit" className="btn btn-primary">
                                    <UserPlus size={16} />
                                    Create User
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline"
                                    onClick={() => setShowAddUser(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card"
                        style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflow: 'auto' }}
                    >
                        <div className="card-header">
                            <h2 className="card-title">Edit User</h2>
                            <button 
                                className="btn btn-outline" 
                                onClick={() => setEditingUser(null)}
                                style={{ padding: '4px 8px' }}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-field">
                                <label className="label">Name</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label className="label">Email</label>
                                <input
                                    className="input"
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label className="label">Phone</label>
                                <input
                                    className="input"
                                    type="tel"
                                    value={editingUser.phone}
                                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                />
                            </div>
                            <div className="form-field">
                                <label className="label">Role</label>
                                <select
                                    className="input"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                    required
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <button type="submit" className="btn btn-primary">
                                    <Edit size={16} />
                                    Update User
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
