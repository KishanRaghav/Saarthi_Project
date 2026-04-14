import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Calendar, Clock, CheckCircle } from "lucide-react";

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border p-8"
      >

        
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="bg-green-100 p-4 rounded-full mb-3"
          >
            <CheckCircle className="text-green-600" size={40} />
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-semibold text-[#5c4b7a]">
            Appointment Confirmed
          </h1>

          <p className="text-gray-500 text-sm mt-2 text-center">
            Your booking has been successfully scheduled.
          </p>
        </div>

       
        <div className="mb-5 p-4 rounded-xl border bg-[#f5f3fb]">
          <h3 className="font-medium text-[#5c4b7a] mb-3">
            Patient Details
          </h3>

          <p className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} /> {state.name || "N/A"}
          </p>

          <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Phone size={16} /> {state.phone || "N/A"}
          </p>
        </div>

       
        <div className="mb-5 p-4 rounded-xl border bg-[#f5f3fb]">
          <h3 className="font-medium text-[#5c4b7a] mb-3">
            Appointment Details
          </h3>

          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} /> {state.date || "N/A"}
          </p>

          <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Clock size={16} /> {state.time || "N/A"}
          </p>
        </div>

        
        {state.doctor && (
          <div className="mb-6 p-4 rounded-xl border bg-[#f5f3fb]">
            <h3 className="font-medium text-[#5c4b7a] mb-3">
              Doctor Details
            </h3>

            <p className="text-sm text-gray-600">
              <b>{state.doctor.name}</b>
            </p>
            <p className="text-sm text-gray-500">
              {state.doctor.specialization}
            </p>
          </div>
        )}

      
        <div className="flex flex-col md:flex-row gap-3">

          <button
            onClick={() => navigate("/UserDashboard")}
            className="flex-1 py-3 rounded-xl text-sm font-medium border"
            style={{
              color: "#7C6A9B",
              borderColor: "#e5e0f0",
            }}
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate("/doctor")}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: "#7C6A9B",
              color: "white",
            }}
          >
            Book Another
          </button>

        </div>
      </motion.div>
    </div>
  );
}
