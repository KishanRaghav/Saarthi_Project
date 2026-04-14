import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import AuthContainer from "./Components/SignIn";



// It should be capital C:
import Chatbot from "./Components/Chatbot/Chatbot";

import UserDashboard from "./Components/UserDashboard/User";
import Booking from "./Components/UserDashboard/Booking";
import Success from "./Components/UserDashboard/Success";
import DoctorLayout from "./Components/Doctor/DoctorLayout";
import AuthLogin from "./Components/SignIn"


const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3fb]">
      <motion.div
        className="text-3xl font-semibold text-[#7C6A9B]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
      >
        Saarthi
      </motion.div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f3fb]">

      {/* 🔝 Navbar */}
      <div className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-[#7C6A9B] flex items-center gap-2">
           Saarthi
        </h1>

        <div className="flex gap-6 items-center text-[#5c4b7a] font-medium">
         
        
        </div>
      </div>

     
      <div className="flex flex-col items-center justify-center text-center mt-20 px-6">

        <motion.h1
          className="text-5xl font-bold text-[#3f2e5c] leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Smart Healthcare <br /> Companion
        </motion.h1>

        <p className="mt-6 text-gray-600 max-w-xl">
          Connect with experienced doctors instantly. Book appointments,
          manage health records, and get personalized care — all in one place.
        </p>

        {/* Buttons */}
        <div className="flex gap-6 mt-10">

          

           <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 border border-[#7C6A9B] rounded-lg hover:bg-[#7C6A9B] hover:text-white transition"
          >
            Login
          </button>

        </div>
      </div>


      <div className="mt-24 px-10 grid md:grid-cols-3 gap-8">

        {[
          {
            title: "Instant Booking",
            desc: "Book appointments with top doctors in seconds.",
          },
          {
            title: "AI Health Assistant",
            desc: "Smart chatbot to guide your health queries.",
          },
          {
            title: "Secure Records",
            desc: "Your medical data stored safely and privately.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xl font-semibold text-[#5c4b7a]">
              {item.title}
            </h3>
            <p className="text-gray-600 mt-3">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* 📦 Footer */}
      <div className="mt-20 text-center text-gray-500 pb-6">
        © 2026 Saarthi — Smart Healthcare Platform
      </div>
    </div>
  );
};



const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },

  { path: "/login", element: <AuthContainer /> },
  
  { path: "/Chatbot", element: <Chatbot /> },
  

  { path: "/UserDashboard", element: <UserDashboard /> },
  { path: "/booking", element: <Booking /> },
  { path: "/success", element: <Success /> },

  { path: "/doctor", element: <DoctorLayout /> },
  {path:"/SignIn",element:<AuthLogin/>},
]);



function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  return loading ? <Loader /> : <RouterProvider router={router} />;
}

export default App;
