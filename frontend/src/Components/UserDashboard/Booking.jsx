import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Search, AlertCircle, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedDoctor = location.state?.doctor || null;

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError] = useState("");

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    api.getDoctors().then(data => {
      if (data.success) setDoctors(data.data);
    }).catch(() => setError("Could not load doctors")).finally(() => setFetchingDoctors(false));
  }, []);

  const handleBook = async () => {
    if (!selectedDoctor) { setError("Please select a doctor"); return; }
    if (!date) { setError("Please select a date"); return; }
    if (!time) { setError("Please select a time"); return; }
    setLoading(true); setError("");
    try {
      const datetime = new Date(`${date}T${time}:00`);
      const data = await api.bookAppointment({ doctorId: selectedDoctor._id || selectedDoctor.id, date: datetime.toISOString() });
      if (!data.success) { setError(data.message || "Booking failed"); return; }
      navigate("/success", { state: { doctor: selectedDoctor, date, time, appointment: data.data } });
    } catch { setError("Network error. Is backend running?"); }
    finally { setLoading(false); }
  };

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/UserDashboard")} className="flex items-center gap-1 text-[#7C6A9B] text-sm mb-6 hover:underline">
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border p-8">
          <h2 className="text-2xl font-semibold text-[#5c4b7a] mb-6 text-center">Book Appointment</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Step 1: Select Doctor */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">1. Select a Doctor</h3>
            {selectedDoctor ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#f5f3fb] border border-[#d8d0ee]">
                <div>
                  <p className="font-semibold text-[#5c4b7a]">{selectedDoctor.name}</p>
                  <p className="text-sm text-gray-500">{selectedDoctor.specialization} • {selectedDoctor.experience} yrs exp</p>
                </div>
                <button onClick={() => setSelectedDoctor(null)} className="text-sm text-[#7C6A9B] underline">Change</button>
              </div>
            ) : (
              <>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 mb-3">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input placeholder="Search by name or specialization" value={search} onChange={e => setSearch(e.target.value)}
                    className="outline-none text-sm w-full text-gray-700" />
                </div>
                {fetchingDoctors ? (
                  <p className="text-gray-400 text-sm text-center py-4">Loading doctors...</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                    {filteredDoctors.map(doc => (
                      <button key={doc._id} onClick={() => setSelectedDoctor(doc)}
                        className="text-left p-4 rounded-xl border hover:border-[#7C6A9B] hover:bg-[#f5f3fb] transition">
                        <p className="font-medium text-[#5c4b7a]">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.specialization}</p>
                        <p className="text-xs text-gray-400 mt-1">{doc.experience} yrs experience</p>
                      </button>
                    ))}
                    {filteredDoctors.length === 0 && (
                      <p className="text-gray-400 text-sm col-span-2 text-center py-4">No doctors found</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Step 2: Date */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <Calendar size={16} /> 2. Select Date
            </h3>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-3 rounded-xl border outline-none text-sm focus:ring-2 focus:ring-[#7C6A9B]" />
          </div>

          {/* Step 3: Time */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <Clock size={16} /> 3. Select Time
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {timeSlots.map(slot => (
                <motion.button key={slot} onClick={() => setTime(slot)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl text-sm border transition"
                  style={{ backgroundColor: time === slot ? "#7C6A9B" : "white", color: time === slot ? "white" : "#5c4b7a" }}>
                  {slot}
                </motion.button>
              ))}
            </div>
          </div>

          <button onClick={handleBook} disabled={loading}
            className="w-full py-4 rounded-xl font-medium text-white text-sm transition disabled:opacity-60"
            style={{ backgroundColor: "#7C6A9B" }}>
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
