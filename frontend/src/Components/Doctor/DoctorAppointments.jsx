import React, { useState, useEffect } from "react";
import { AlertCircle, User, Calendar, Clock, FileText } from "lucide-react";
import { api } from "../../services/api";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prescModal, setPrescModal] = useState(null); // { id, prescription, notes }
  const [prescLoading, setPrescLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true); setError("");

    try {
      const data = await api.getDoctorAppointments();
      if (data.success) setAppointments(data.data);
      else setError(data.message || "Failed to load");
    } catch { setError("Network error. Is backend running?"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const changeStatus = async (id, status) => {
    try {
      const data = await api.updateAppointmentStatus(id, status);
      if (data.success) fetchAppointments();
      else alert(data.message);
    } catch { alert("Failed to update status"); }
  };

  const submitPrescription = async () => {
    if (!prescModal?.prescription?.trim()) { alert("Prescription is required"); return; }
    setPrescLoading(true);
    try {
      const data = await api.addPrescription(prescModal.id, { prescription: prescModal.prescription, notes: prescModal.notes });
      if (data.success) { setPrescModal(null); fetchAppointments(); }
      else alert(data.message);
    } catch { alert("Failed to save prescription"); }
    finally { setPrescLoading(false); }
  };

  const filtered = tab === "all" ? appointments : appointments.filter(a => a.status === tab);

  const statusBadge = (status) => {
    const s = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-600",
      rejected: "bg-red-100 text-red-600",
      completed: "bg-blue-100 text-blue-600",
    };
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${s[status] || "bg-gray-100"}`}>{status}</span>;
  };

  return (
    <div>
      {/* FILTER TABS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["all", "pending", "approved", "rejected", "completed"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${tab === t ? "bg-[#7C6A9B] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#f3effa]"}`}>
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
        <p className="text-gray-400 text-center mt-10">Loading appointments...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(appt => (
            <div key={appt._id} className="bg-white p-5 rounded-xl border hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#5c4b7a] flex items-center gap-2">
                    <User size={16} /> {appt.patientId?.name || "Patient"}
                  </h3>
                  <p className="text-sm text-gray-400">{appt.patientId?.email}</p>
                  {appt.patientId?.age && <p className="text-xs text-gray-400">Age: {appt.patientId.age} • {appt.patientId.gender}</p>}
                </div>
                {statusBadge(appt.status)}
              </div>

              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} /> {new Date(appt.date).toLocaleDateString()}
                <Clock size={14} className="ml-2" /> {new Date(appt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>

              {appt.prescription && (
                <div className="mt-3 p-3 bg-[#f5f3fb] rounded-lg text-sm">
                  <p className="font-medium text-[#5c4b7a] mb-1">Prescription</p>
                  <p className="text-gray-600">{appt.prescription}</p>
                  {appt.notes && <p className="mt-1 text-gray-400 italic text-xs">{appt.notes}</p>}
                </div>
              )}

              {/* ACTIONS */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {appt.status === "pending" && (
                  <>
                    <button onClick={() => changeStatus(appt._id, "approved")}
                      className="flex-1 py-2 bg-[#7C6A9B] text-white rounded-xl text-sm font-medium hover:bg-[#5c4b7a] transition">
                      ✓ Accept
                    </button>
                    <button onClick={() => changeStatus(appt._id, "rejected")}
                      className="flex-1 py-2 border border-red-300 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                      ✗ Reject
                    </button>
                  </>
                )}
                {appt.status === "approved" && (
                  <button onClick={() => setPrescModal({ id: appt._id, prescription: "", notes: "" })}
                    className="flex-1 py-2 bg-[#7C6A9B] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                    <FileText size={14} /> Add Prescription & Complete
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="col-span-2 text-center text-gray-400 mt-10">No {tab} appointments</p>
          )}
        </div>
      )}

      {/* PRESCRIPTION MODAL */}
      {prescModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#5c4b7a] mb-4">Add Prescription</h3>
            <textarea placeholder="Prescription (required)" value={prescModal.prescription}
              onChange={e => setPrescModal(p => ({ ...p, prescription: e.target.value }))}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#7C6A9B] resize-none h-28 mb-3" />
            <textarea placeholder="Notes (optional)" value={prescModal.notes}
              onChange={e => setPrescModal(p => ({ ...p, notes: e.target.value }))}
              className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#7C6A9B] resize-none h-16 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setPrescModal(null)} className="flex-1 py-2 border rounded-xl text-sm text-gray-600">Cancel</button>
              <button onClick={submitPrescription} disabled={prescLoading}
                className="flex-1 py-2 bg-[#7C6A9B] text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {prescLoading ? "Saving..." : "Save & Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
