import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";


const UserProfile = () => {
  const { user, axios, setUser } = useAppContext();

  if (!user) return <div className="p-8">Please log in to view your profile.</div>;

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username: user.username || '', name: user.name, contactNumber: user.contactNumber, country: user.country });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setSaving(true);
    setEditError("");
    try {
      const { data } = await axios.post("/api/user/update-profile", {
        name: editData.name,
        username: editData.username,
        contactNumber: editData.contactNumber,
        country: editData.country,
        email: user.email
      });
      if (data.success) {
        setUser((prev) => ({ ...prev, ...data.user }));
        setEditMode(false);
      } else {
        setEditError(data.message || "Failed to update profile");
      }
    } catch (e) {
      setEditError("Failed to update profile");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-tr from-primary/10 to-white rounded-2xl shadow-lg p-8 mb-10 border border-primary/20">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-3 border-4 border-primary/30">
            <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.25a7.5 7.5 0 0115 0v.25a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.25z" /></svg>
          </div>
          <div className="text-lg font-bold text-primary">{editMode ? (
            <input
              type="text"
              name="username"
              value={editData.username}
              onChange={handleEditChange}
              className="border rounded px-2 py-1 w-40 text-center mb-2"
              disabled={saving}
            />
          ) : user.username}</div>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium text-gray-700">{user.email}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">Name</div>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 w-40"
                disabled={saving}
              />
            ) : <div className="font-medium text-gray-700">{user.name}</div>}
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">Contact Number</div>
            {editMode ? (
              <input
                type="text"
                name="contactNumber"
                value={editData.contactNumber}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 w-40"
                disabled={saving}
              />
            ) : <div className="font-medium text-gray-700">{user.contactNumber}</div>}
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">Country</div>
            {editMode ? (
              <input
                type="text"
                name="country"
                value={editData.country}
                onChange={handleEditChange}
                className="border rounded px-2 py-1 w-40"
                disabled={saving}
              />
            ) : <div className="font-medium text-gray-700">{user.country}</div>}
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-8">
          {editMode ? (
            <>
              <button
                className="px-6 py-2 rounded-full bg-primary text-white font-semibold shadow hover:bg-accent transition-all text-sm mb-1"
                onClick={handleEditSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="px-6 py-2 rounded-full bg-gray-300 text-gray-700 font-semibold shadow transition-all text-sm"
                onClick={() => { setEditMode(false); setEditData({ name: user.name, username: user.username || '', contactNumber: user.contactNumber, country: user.country }); setEditError(""); }}
                disabled={saving}
              >
                Cancel
              </button>
              {editError && <div className="text-red-500 text-xs mt-1">{editError}</div>}
            </>
          ) : (
            <button
              className="px-6 py-2 rounded-full bg-primary text-white font-semibold shadow hover:bg-accent transition-all text-sm"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-8">
        <button
          onClick={() => window.location.href = '/products'}
          className="w-52 h-12 px-8 py-3 rounded-full bg-primary text-white font-semibold shadow hover:bg-accent transition-all text-lg flex items-center justify-center"
        >
          Purchase Order
        </button>
        <button
          onClick={() => window.location.href = '/my-orders'}
          className="w-52 h-12 px-8 py-3 rounded-full bg-primary text-white font-semibold shadow hover:bg-accent transition-all text-lg flex items-center justify-center"
        >
          My Orders
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
