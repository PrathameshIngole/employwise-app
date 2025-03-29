import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../context/UsersContext";
import SearchIcon from "./icons/SearchIcon";
import EditIcon from "./icons/EditIcon";
import DeleteIcon from "./icons/DeleteIcon";
import LogoutIcon from "./icons/LogoutIcon";
import MoreVertIcon from "./icons/MoreVertIcon";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import "./UserList.css";

const UserList = ({page, setPage}) => {
  const [apiUsers, setApiUsers] = useState([]);
  const { localUpdates, handleUserUpdated } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [locallyDeletedUsers, setLocallyDeletedUsers] = useState([]);

  const getCombinedUsers = () => {
    return apiUsers
      .filter(user => !locallyDeletedUsers.includes(user.id))
      .map(user => ({
        ...user,
        ...localUpdates[user.id] || {}
      }));
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await getUsers(page);
        setApiUsers(data.data);
        setTotalPages(data.total_pages);
        setError(null);
        setLocallyDeletedUsers([]); // Reset deletions on page change
      } catch (err) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, token, navigate]);

  useEffect(() => {
    const combinedUsers = getCombinedUsers();
    const filtered = combinedUsers.filter(user => 
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, apiUsers, localUpdates, locallyDeletedUsers]);

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(userToDelete);
      setLocallyDeletedUsers(prev => [...prev, userToDelete]);
      setApiUsers(prev => prev.filter(user => user.id !== userToDelete));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete user");
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleEditUser = (user) => {
    navigate(`/edit-user/${user.id}`, {
      state: { userData: { ...user, ...localUpdates[user.id] } }
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderDropdown = (user) => {
    return (
      <div className="dropdown">
        <button className="dropdown-toggle">
          <MoreVertIcon />
        </button>
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => handleEditUser(user)}>
            <EditIcon /> Edit
          </button>
          <button className="dropdown-item delete" onClick={() => handleDeleteClick(user.id)}>
            <DeleteIcon /> Delete
          </button>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    return (
      <div className="pagination">
        <button
          className={`pagination-prev ${page <= 1 ? "disabled" : ""}`}
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>

        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`pagination-number ${page === i + 1 ? "active" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className={`pagination-next ${page >= totalPages ? "disabled" : ""}`}
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="user-card skeleton">
        <div className="user-card-image skeleton-image"></div>
        <div className="user-card-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="user-list-container">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="user-list-header">
        <h1 className="user-list-title">User Directory</h1>
        <button className="logout-button" onClick={logout}>
          <LogoutIcon />
          Logout
        </button>
      </div>

      <div className="search-container search-input-container">
        <SearchIcon className="search-icon" />
        <input
          className="search-input"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="user-grid">{renderSkeletons()}</div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="user-grid">
              {filteredUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-image">
                    {user.avatar ? (
                      <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                    ) : (
                      <div className="user-initials">{getInitials(user.first_name, user.last_name)}</div>
                    )}
                  </div>
                  <div className="user-card-content">
                    <div className="user-card-header">
                      <h3 className="user-name">{`${user.first_name} ${user.last_name}`}</h3>
                      {renderDropdown(user)}
                    </div>
                    <p className="user-email">{user.email}</p>
                    <button className="edit-button" onClick={() => handleEditUser(user)}>
                      <EditIcon />
                      Edit Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pagination-container">{renderPagination()}</div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: 'var(--dialog-bg)',
            color: 'var(--text-color)',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" style={{ color: 'var(--text-color)', padding: '0 0 16px 0' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent style={{ padding: '0 0 16px 0' }}>
          <p style={{ margin: 0 }}>Are you sure you want to delete this user? This action cannot be undone.</p>
        </DialogContent>
        <DialogActions style={{ padding: 0 }}>
          <Button 
            onClick={handleDeleteCancel} 
            style={{
              color: 'var(--button-text)',
              backgroundColor: 'var(--button-bg)',
              textTransform: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              marginRight: '8px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            style={{
              color: '#fff',
              backgroundColor: '#e53935',
              textTransform: 'none',
              padding: '8px 16px',
              borderRadius: '4px'
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList;