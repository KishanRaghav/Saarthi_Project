const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "https://saarthi-project-1.onrender.com/api";
const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  return data;
};

export const api = {
  // Auth
  patientSignup: (data) =>
    fetch(`${BASE}/auth/patient/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
  patientLogin: (data) =>
    fetch(`${BASE}/auth/patient/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
  doctorSignup: (data) =>
    fetch(`${BASE}/auth/doctor/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
  doctorLogin: (data) =>
    fetch(`${BASE}/auth/doctor/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),

  // Doctors (public)
  getDoctors: () =>
    fetch(`${BASE}/doctors`).then(handleResponse),

  // Patient routes
  getMyProfile: () =>
    fetch(`${BASE}/patients/profile`, { headers: authHeaders() }).then(handleResponse),
  updateMyProfile: (data) =>
    fetch(`${BASE}/patients/profile/update`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getMyAppointments: (status) =>
    fetch(`${BASE}/patients/appointments${status ? `?status=${status}` : ''}`, { headers: authHeaders() }).then(handleResponse),
  bookAppointment: (data) =>
    fetch(`${BASE}/patients/appointment`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  cancelAppointment: (id) =>
    fetch(`${BASE}/patients/appointment/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),

  // Doctor routes
  getDoctorProfile: () =>
    fetch(`${BASE}/doctors/profile`, { headers: authHeaders() }).then(handleResponse),
  getDoctorAppointments: (status) =>
    fetch(`${BASE}/doctors/appointments${status ? `?status=${status}` : ''}`, { headers: authHeaders() }).then(handleResponse),
  updateAppointmentStatus: (id, status) =>
    fetch(`${BASE}/doctors/appointment/${id}/status`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  addPrescription: (id, data) =>
    fetch(`${BASE}/doctors/appointment/${id}/prescription`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse),
};

// Auth helpers
export const saveAuth = (token, user, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('role', role);
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

export const getRole = () => localStorage.getItem('role');

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

export const isLoggedIn = () => !!getToken();
