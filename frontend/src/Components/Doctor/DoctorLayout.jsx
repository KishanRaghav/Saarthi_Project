import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Calendar, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorAppointments from "./DoctorAppointments";
import DoctorSchedule from "./DoctorSchedule";
import { api, getUser, logout } from "../../services/api";

const menu = [
  { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Appointments", icon: <Calendar size={18} /> },
  { name: "Schedule", icon: <Clock size={18} /> },
];

export default function DoctorLayout() {
  const [active, setActive] = useState("Dashboard");
  const [profile, setProfile] = useState(getUser());
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    api.getDoctorAppointments().then(data => {
      if (data.success) {
        const appts = data.data;
        const today = new Date().toDateString();
        setStats({
          total: appts.length,
          today: appts.filter(a => new Date(a.date).toDateString() === today).length,
          pending: appts.filter(a => a.status === "pending").length,
        });
        setRecentAppts(appts.slice(0, 4));
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex min-h-screen bg-[#f9f7fd]">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r p-6 hidden md:flex flex-col">
        <h2 className="text-2xl font-semibold text-[#7C6A9B] mb-10">Saarthi 💜</h2>
        <div className="flex flex-col gap-2 flex-1">
          {menu.map((item) => (
            <button key={item.name} onClick={() => setActive(item.name)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition ${active === item.name ? "bg-[#7C6A9B] text-white" : "text-gray-600 hover:bg-[#f3effa]"}`}>
              {item.icon} {item.name}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#5c4b7a]">{active}</h1>
            {profile && <p className="text-sm text-gray-400 mt-1">Welcome, {profile.name} 👨‍⚕️</p>}
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border text-sm text-[#5c4b7a] font-medium">
            {profile?.name || "Doctor"}
          </div>
        </div>

        {active === "Dashboard" && <Dashboard stats={stats} recentAppts={recentAppts} />}
        {active === "Appointments" && <DoctorAppointments />}
        {active === "Schedule" && <DoctorSchedule />}
      </div>
    </div>
  );
}

function Dashboard({ stats, recentAppts }) {
  const statCards = [
    { title: "Total Appointments", value: stats.total },
    { title: "Today", value: stats.today },
    { title: "Pending", value: stats.pending },
  ];
  const statusColors = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-600", completed: "bg-blue-100 text-blue-600", rejected: "bg-red-100 text-red-600" };
  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-gray-500 text-sm">{card.title}</p>
            <h2 className="text-3xl font-semibold text-[#5c4b7a] mt-1">{card.value}</h2>
          </motion.div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-lg font-semibold text-[#5c4b7a] mb-4">Recent Appointments</h2>
        {recentAppts.length === 0 ? (
          <p className="text-gray-400 text-sm">No appointments yet</p>
        ) : recentAppts.map(appt => (
          <div key={appt._id} className="flex justify-between items-center p-4 border rounded-xl mb-2">
            <div>
              <p className="font-medium text-[#5c4b7a]">{appt.patientId?.name || "Patient"}</p>
              <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString()} • {new Date(appt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[appt.status] || "bg-gray-100"}`}>{appt.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
