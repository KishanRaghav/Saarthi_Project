import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, LayoutDashboard, ClipboardList, User, LogOut, AlertCircle, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, getUser, logout } from "../../services/api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Appointments");
  const [tab, setTab] = useState("pending");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(getUser());

  const fetchAppointments = async () => {
    setLoading(true); setError("");
    try {
      const data = await api.getMyAppointments();
      if (data.success) setAppointments(data.data);
      else setError(data.message || "Failed to load appointments");
    } catch {
      setError("Network error. Is the backend running?");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      const data = await api.cancelAppointment(id);
      if (data.success) fetchAppointments();
      else alert(data.message);
    } catch { alert("Failed to cancel"); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const tabMap = { pending: "Upcoming", approved: "Upcoming", completed: "Completed", rejected: "Cancelled" };
  const filteredMap = { Upcoming: ["pending", "approved"], Completed: ["completed"], Cancelled: ["rejected"] };
  const filtered = appointments.filter(a => filteredMap[tab]?.includes(a.status));

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-[#ede9f7] text-[#7C6A9B]",
      completed: "bg-blue-100 text-blue-600",
      rejected: "bg-red-100 text-red-600",
    };
    const labels = { pending: "Pending", approved: "Approved", completed: "Completed", rejected: "Rejected" };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || ""}`}>{labels[status] || status}</span>;
  };

  const sidebarItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Appointments", icon: <ClipboardList size={18} /> },
    { name: "Profile", icon: <User size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r p-6 hidden md:flex flex-col">
        <h2 className="text-2xl font-semibold text-[#7C6A9B] mb-10">Saarthi</h2>
        <div className="flex flex-col gap-2 flex-1">
          {sidebarItems.map((item) => (
            <button key={item.name} onClick={() => setActivePage(item.name)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition ${activePage === item.name ? "bg-[#7C6A9B] text-white shadow" : "text-gray-600 hover:bg-[#f3effa]"}`}>
              {item.icon} {item.name}
            </button>
          ))}

          {/* Chatbot sidebar link */}
          <button
            onClick={() => navigate("/chatbot")}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition text-gray-600 hover:bg-[#f3effa] mt-2"
          >
            <MessageCircle size={18} />
            Ask Saarthi AI
          </button>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 mt-4">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#5c4b7a]">
              {activePage === "Profile" ? "My Profile" : "My Appointments"}
            </h1>
            {profile && <p className="text-sm text-gray-400 mt-1">Welcome, {profile.name} 👋</p>}
          </div>
          {activePage === "Appointments" && (
            <button onClick={() => navigate("/booking")} className="px-4 py-2 rounded-xl text-sm font-medium bg-[#7C6A9B] text-white hover:scale-105 transition">
              + Book Appointment
            </button>
          )}
        </div>

        {activePage === "Profile" && <ProfilePage profile={profile} />}

        {activePage === "Appointments" && (
          <>
            <div className="flex gap-3 mb-6">
              {["Upcoming", "Completed", "Cancelled"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t ? "bg-[#7C6A9B] text-white" : "bg-white border text-gray-600 hover:bg-[#f3effa]"}`}>
                  {t}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {loading ? (
              <div className="text-center mt-20 text-gray-400">Loading appointments...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((appt, index) => (
                  <motion.div key={appt._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }} whileHover={{ y: -5 }}
                    className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <h2 className="text-lg font-semibold text-[#5c4b7a]">{appt.doctorId?.name || "Doctor"}</h2>
                    <p className="text-sm text-gray-500 mb-3">{appt.doctorId?.specialization || ""}</p>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} /> {new Date(appt.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Clock size={16} /> {new Date(appt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {statusBadge(appt.status)}
                    {appt.status === "pending" && (
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => handleCancel(appt._id)}
                          className="flex-1 py-2 rounded-xl text-sm font-medium border text-red-500 hover:bg-red-50 transition">
                          Cancel
                        </button>
                        <button onClick={() => navigate("/booking", { state: { doctor: appt.doctorId } })}
                          className="flex-1 py-2 rounded-xl text-sm font-medium bg-[#7C6A9B] text-white hover:scale-105 transition">
                          Reschedule
                        </button>
                      </div>
                    )}
                    {appt.prescription && (
                      <div className="mt-3 p-3 bg-[#f5f3fb] rounded-xl text-sm text-gray-600">
                        <p className="font-medium text-[#5c4b7a] mb-1">Prescription</p>
                        <p>{appt.prescription}</p>
                        {appt.notes && <p className="mt-1 text-gray-400 italic">{appt.notes}</p>}
                      </div>
                    )}
                  </motion.div>
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full text-center mt-10">
                    <p className="text-gray-400 mb-4">No {tab.toLowerCase()} appointments</p>
                    <button onClick={() => navigate("/booking")} className="px-5 py-2 rounded-xl bg-[#7C6A9B] text-white text-sm">
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FLOATING CHATBOT BUTTON ── */}
      <motion.button
        onClick={() => navigate("/chatbot")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#7C6A9B] text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium"
      >
        <MessageCircle size={18} />
        Ask Saarthi AI
      </motion.button>
    </div>
  );
}

function ProfilePage({ profile }) {
  if (!profile) return <p className="text-gray-400">No profile data</p>;
  return (
    <div className="max-w-md bg-white rounded-2xl border p-6 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[#ede9f7] flex items-center justify-center text-2xl mb-4">
        {profile.name?.[0]?.toUpperCase() || "P"}
      </div>
      <h2 className="text-xl font-semibold text-[#5c4b7a]">{profile.name}</h2>
      <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
      {profile.age && <p className="text-sm text-gray-500 mt-1">Age: {profile.age}</p>}
      {profile.gender && <p className="text-sm text-gray-500 mt-1 capitalize">Gender: {profile.gender}</p>}
    </div>
  );
}
