// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    country: "",
    state: "",
    city: "",
  });

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setEditForm({
            name: data.user.name || "",
            email: data.user.email || "",
            department: data.user.department || "",
            role: data.user.role || "",
            country: data.user.country || "",
            state: data.user.state || "",
            city: data.user.city || "",
          });
        } else {
          window.location.href = "/sign-in";
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const runScript = () => {
      try {
        // Subtle micro-animations
        document.querySelectorAll("button").forEach((button) => {
          button.addEventListener("mousedown", () => {
            button.classList.add("scale-95");
          });
          button.addEventListener("mouseup", () => {
            button.classList.remove("scale-95");
          });
        });
      } catch (e) {
        console.error("Error running page script:", e);
      }
    };
    runScript();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarBg = (name?: string) => {
    if (!name) return "from-purple-600 to-indigo-600";
    const colors = [
      "from-purple-600 to-indigo-600",
      "from-blue-600 to-cyan-600",
      "from-emerald-600 to-teal-600",
      "from-orange-600 to-amber-600",
      "from-rose-600 to-pink-600",
      "from-violet-600 to-fuchsia-600"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm("Are you absolutely sure you want to permanently delete your profile? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch("/api/auth/profile", {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert("Your profile has been permanently deleted.");
        window.location.href = "/sign-in";
      } else {
        alert(data.message || "Failed to delete profile. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setIsEditOpen(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred. Please try again.");
    }
  };
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      ` }} />

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="space-y-1 text-center md:text-left">
          <h1 className="page-heading text-foreground">
            Account Profile
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Manage your personal profile and account security settings.
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white border border-border shadow-sm rounded-2xl p-8 space-y-8">
          
          {/* Avatar and Info Row */}
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-border shadow-sm flex items-center justify-center bg-slate-50">
                {user?.name ? (
                  <div className={`w-full h-full bg-gradient-to-br ${getAvatarBg(user.name)} text-white flex items-center justify-center text-3xl font-extrabold select-none`}>
                    {getInitials(user.name)}
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-100 animate-pulse" />
                )}
              </div>
            </div>

            {/* User Metadata */}
            <div className="text-center md:text-left space-y-2 flex-grow">
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                {user?.name || (loading ? "Loading..." : "Guest")}
              </h2>
              <p className="text-muted-foreground text-sm font-semibold">
                {user?.role || "Operator"} • {user?.department || "Operations"}
              </p>
              <div className="flex flex-col md:flex-row md:items-center gap-y-1 gap-x-4 text-xs text-muted-foreground pt-1.5 border-t border-slate-50">
                <span className="flex items-center justify-center md:justify-start gap-1">
                  <span className="material-symbols-outlined text-sm">mail</span> {user?.email || "No Email"}
                </span>
                <span className="flex items-center justify-center md:justify-start gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span> {user?.city ? `${user.city}, ${user.state || ""}`.trim() : "Unknown Location"}
                </span>
              </div>
            </div>
          </div>

          {/* Basic Account Details Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between p-3 bg-slate-50/50 border border-border/60 rounded-xl">
                <span className="text-muted-foreground font-semibold">Department</span>
                <span className="text-foreground font-bold">{user?.department || "N/A"}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50/50 border border-border/60 rounded-xl">
                <span className="text-muted-foreground font-semibold">Role</span>
                <span className="text-foreground font-bold">{user?.role || "N/A"}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50/50 border border-border/60 rounded-xl">
                <span className="text-muted-foreground font-semibold">Country</span>
                <span className="text-foreground font-bold">{user?.country || "N/A"}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50/50 border border-border/60 rounded-xl">
                <span className="text-muted-foreground font-semibold">State</span>
                <span className="text-foreground font-bold">{user?.state || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-white border border-border shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Edit Profile</h3>
            <p className="text-xs text-muted-foreground">Update your personal information and contact details.</p>
          </div>
          <button 
            onClick={() => setIsEditOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">person_edit</span>
            Edit Profile
          </button>
        </div>

        {/* Delete Profile */}
        <div className="bg-white border border-border shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Delete Profile</h3>
            <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
          </div>
          <button 
            onClick={handleDeleteProfile}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-xl text-xs font-bold text-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Delete Profile
          </button>
        </div>

        {/* Account Health */}
        <div className="bg-white border border-border shadow-sm rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Account Health</h3>
            <p className="text-xs text-muted-foreground">Ensure your account security requirements are met.</p>
          </div>
          <div className="p-5 bg-slate-50 border border-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Security Score</span>
              <span className="text-xs font-bold text-primary font-mono">98% Secure</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "98%" }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Edit Profile</h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                  <input 
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                  <input 
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                  <input 
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</label>
                  <input 
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Country</label>
                  <input 
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">State</label>
                  <input 
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">City</label>
                  <input 
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:brightness-105 active:scale-95 transition-all flex items-center gap-1"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
