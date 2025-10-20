import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import React from "react";
import HospitalSearch from "./components/HospitalSearch";
import AppointmentBookingForm from "./components/AppointmentBookingForm";
import ReviewsSection from "./components/ReviewsSection";
import Profile from "./pages/Profile";
import Appointments from "./pages/Appointments";
import Settings from "./pages/Settings";
import MapView from "./pages/MapView";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthLoading from "./components/AuthLoading";
import DashboardIndicator from "./components/DashboardIndicator";
import StorageTest from "./components/StorageTest";
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { isInitializing, isAuthenticated, user } = useAuth();

  // Show loading screen while validating token
  if (isInitializing) {
    return <AuthLoading />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <DashboardIndicator />
        <Routes>
          {/* Public routes - Home page with its own navbar */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          
          {/* Auth routes - Login and Register with auth styling */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with app navbar and sidebar */}
          <Route path="/*" element={
            <>
              <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
              <div className="flex-1 w-full">
                <div className="relative">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <main className={`main-shift ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    <Routes>

                      <Route element={<ProtectedRoute roles={["patient", "doctor", "admin"]} />}> 
                        <Route path="/dashboard" element={<Dashboard />} />
                      </Route>
                      <Route path="/search" element={<HospitalSearch />} />
                      <Route path="/reviews" element={<ReviewsSection />} />
                      <Route element={<ProtectedRoute roles={["patient"]} />}> 
                        <Route path="/book" element={<AppointmentBookingForm />} />
                      </Route>
                      <Route element={<ProtectedRoute roles={["patient", "doctor", "admin"]} />}> 
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/appointments" element={<Appointments />} />
                        <Route path="/settings" element={<Settings />} />
                      </Route>
                      <Route element={<ProtectedRoute roles={["patient"]} />}> 
                        <Route path="/patient-dashboard" element={<PatientDashboard />} />
                        <Route path="/map" element={<MapView />} />
                      </Route>
                      <Route element={<ProtectedRoute roles={["doctor"]} />}> 
                        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                      </Route>
                    </Routes>
                  </main>
                </div>
              </div>
              <Footer />
            </>
          } />
        </Routes>
        <StorageTest />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
