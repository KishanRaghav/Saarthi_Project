import React, { useState, useRef, useLayoutEffect } from "react";
import { User, Lock, Mail, Stethoscope, AlertCircle } from "lucide-react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { api, saveAuth } from "../services/api";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState("patient"); // "patient" | "doctor"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sign-in form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign-up form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupAge, setSignupAge] = useState("");
  const [signupGender, setSignupGender] = useState("other");
  const [signupSpec, setSignupSpec] = useState("");
  const [signupExp, setSignupExp] = useState("");

  const navigate = useNavigate();

  const shellRef = useRef(null);
  const leftWrap = useRef(null);
  const rightWrap = useRef(null);
  const leftForm = useRef(null);
  const rightForm = useRef(null);
  const leftImg = useRef(null);
  const rightImg = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(leftWrap.current, { width: "65%" });
      gsap.set(rightWrap.current, { width: "35%" });
      gsap.set(leftForm.current, { x: 0, autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(rightForm.current, { x: 40, autoAlpha: 0, pointerEvents: "none" });
      gsap.set(leftImg.current, { autoAlpha: 0 });
      gsap.set(rightImg.current, { autoAlpha: 1 });
    }, shellRef);
    return () => ctx.revert();
  }, []);

  const switchToSignUp = () => {
    setIsSignUp(true);
    setError("");
    const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power3.inOut" } });
    tl.to(leftForm.current, { x: -40, autoAlpha: 0, pointerEvents: "none" }, 0)
      .to(rightForm.current, { x: 0, autoAlpha: 1, pointerEvents: "auto" }, 0.15)
      .to(leftWrap.current, { width: "35%" }, 0)
      .to(rightWrap.current, { width: "65%" }, 0)
      .to(leftImg.current, { autoAlpha: 1 }, 0)
      .to(rightImg.current, { autoAlpha: 0 }, 0);
  };

  const switchToSignIn = () => {
    setIsSignUp(false);
    setError("");
    const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power3.inOut" } });
    tl.to(rightForm.current, { x: 40, autoAlpha: 0, pointerEvents: "none" }, 0)
      .to(leftForm.current, { x: 0, autoAlpha: 1, pointerEvents: "auto" }, 0.15)
      .to(leftWrap.current, { width: "65%" }, 0)
      .to(rightWrap.current, { width: "35%" }, 0)
      .to(leftImg.current, { autoAlpha: 0 }, 0)
      .to(rightImg.current, { autoAlpha: 1 }, 0);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    try {
      const fn = role === "doctor" ? api.doctorLogin : api.patientLogin;
      const data = await fn({ email: loginEmail, password: loginPassword });
      if (!data.success) { setError(data.message || "Login failed"); return; }
      const userObj = data.doctor || data.patient;
      saveAuth(data.token, userObj, role);
      navigate(role === "doctor" ? "/doctor" : "/UserDashboard");
    } catch (e) {
      setError("Network error. Is the backend running?");
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) { setError("Please fill all required fields"); return; }
    if (role === "patient" && !signupAge) { setError("Age is required"); return; }
    if (role === "doctor" && !signupSpec) { setError("Specialization is required"); return; }
    setLoading(true); setError("");
    try {
      const payload = role === "patient"
        ? { name: signupName, email: signupEmail, password: signupPassword, age: Number(signupAge), gender: signupGender }
        : { name: signupName, email: signupEmail, password: signupPassword, specialization: signupSpec, experience: Number(signupExp) || 0 };
      const fn = role === "doctor" ? api.doctorSignup : api.patientSignup;
      const data = await fn(payload);
      if (!data.success) { setError(data.message || "Signup failed"); return; }
      const userObj = data.doctor || data.patient;
      saveAuth(data.token, userObj, role);
      navigate(role === "doctor" ? "/doctor" : "/UserDashboard");
    } catch (e) {
      setError("Network error. Is the backend running?");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#725B95] to-[#5E4A80] p-6">
      <div ref={shellRef} className="relative w-full max-w-6xl h-[680px] rounded-3xl overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] bg-[#F8F8F8] border border-gray-200">
        <div className="absolute inset-0 flex">

          {/* LEFT PANEL */}
          <section ref={leftWrap} className="relative h-full overflow-hidden flex items-stretch">
            <img ref={leftImg} alt="left visual" className="absolute inset-0 w-full h-full object-cover"
              src="https://blog.1password.com/posts/2019/mental-health-week/header.png" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#E6CCEC]/50 to-[#E6CCEC]/30 pointer-events-none" />

            <div ref={leftForm} className="relative z-10 w-full flex flex-col justify-center px-12 py-10 backdrop-blur-sm">
              <h1 className="text-4xl font-bold text-[#5E4A80] mb-2">Sign In</h1>
              <p className="text-[#A89BB5] mb-6">Welcome back, login to continue!</p>

              {/* Role Toggle */}
              <div className="flex gap-2 mb-6 bg-[#f0ebfa] rounded-xl p-1 max-w-xs">
                {["patient", "doctor"].map((r) => (
                  <button key={r} onClick={() => { setRole(r); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${role === r ? "bg-[#7C6A9B] text-white shadow" : "text-[#7C6A9B]"}`}>
                    {r === "doctor" ? "🩺 Doctor" : "🧑 Patient"}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl mb-4">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3">
                  <Mail className="text-[#A89BB5] mr-3" size={18} />
                  <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                </div>
                <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3">
                  <Lock className="text-[#A89BB5] mr-3" size={18} />
                  <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                </div>
                <button onClick={handleLogin} disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#725B95] to-[#5E4A80] hover:from-[#5E4A80] hover:to-[#725B95] rounded-xl text-white font-semibold text-lg shadow-lg transition disabled:opacity-60">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                <p className="text-[#A89BB5] text-sm">
                  New here?{" "}
                  <button type="button" onClick={switchToSignUp} className="text-[#725B95] hover:text-[#5E4A80] underline underline-offset-4">
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section ref={rightWrap} className="relative h-full overflow-hidden flex items-stretch ml-auto">
            <img ref={rightImg} alt="right visual" className="absolute inset-0 w-full h-full object-cover"
              src="https://img.freepik.com/premium-photo/wondrous-minimalistic-illustration-portrait-woman-with-purple-flowers-concept-mental-health-care_454018-1357.jpg" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#E6CCEC]/50 to-[#725B95]/60 pointer-events-none" />

            <div ref={rightForm} className="relative z-10 w-full flex flex-col justify-center px-12 py-10 backdrop-blur-sm overflow-y-auto">
              <h2 className="text-4xl font-bold text-[#5E4A80] mb-2">Create Account</h2>
              <p className="text-[#A89BB5] mb-4">Join us and start your journey!</p>

              {/* Role Toggle */}
              <div className="flex gap-2 mb-4 bg-[#f0ebfa] rounded-xl p-1 max-w-xs">
                {["patient", "doctor"].map((r) => (
                  <button key={r} onClick={() => { setRole(r); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${role === r ? "bg-[#7C6A9B] text-white shadow" : "text-[#7C6A9B]"}`}>
                    {r === "doctor" ? "🩺 Doctor" : "🧑 Patient"}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl mb-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-3 w-full max-w-md">
                <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3">
                  <User className="text-[#A89BB5] mr-3" size={18} />
                  <input type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)}
                    className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                </div>
                <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3">
                  <Mail className="text-[#A89BB5] mr-3" size={18} />
                  <input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                    className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                </div>
                <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3">
                  <Lock className="text-[#A89BB5] mr-3" size={18} />
                  <input type="password" placeholder="Password (min 6 chars)" value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                    className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                </div>

                {role === "patient" ? (
                  <div className="flex gap-3">
                    <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3 flex-1">
                      <input type="number" placeholder="Age" value={signupAge} onChange={e => setSignupAge(e.target.value)}
                        className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                    </div>
                    <select value={signupGender} onChange={e => setSignupGender(e.target.value)}
                      className="bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3 text-sm text-[#5E4A80] outline-none flex-1">
                      <option value="other">Other</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3 flex-1">
                      <Stethoscope className="text-[#A89BB5] mr-2" size={16} />
                      <input type="text" placeholder="Specialization" value={signupSpec} onChange={e => setSignupSpec(e.target.value)}
                        className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                    </div>
                    <div className="flex items-center bg-white/90 border border-[#DCD0EB] rounded-xl px-4 py-3 w-24">
                      <input type="number" placeholder="Exp" value={signupExp} onChange={e => setSignupExp(e.target.value)}
                        className="bg-transparent outline-none text-[#5E4A80] w-full placeholder-[#A89BB5] text-sm" />
                    </div>
                  </div>
                )}

                <button onClick={handleSignup} disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#725B95] to-[#A89BB5] hover:from-[#5E4A80] hover:to-[#725B95] rounded-xl text-white font-semibold text-lg shadow-lg transition disabled:opacity-60">
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
                <button type="button" onClick={switchToSignIn} className="text-[#A89BB5] mt-2 underline underline-offset-4 hover:text-[#5E4A80] text-sm">
                  Back to Sign In
                </button>
              </div>
            </div>
          </section>
        </div>
        <div className="absolute inset-0 ring-1 ring-[#DCD0EB] rounded-3xl pointer-events-none" />
      </div>
    </div>
  );
}
