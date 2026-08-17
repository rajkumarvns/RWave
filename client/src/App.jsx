import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import { useTheme } from "./context/ThemeContext";
import SiteHeader from "./components/SiteHeader";

function App() {
  const { authUser } = useAuth();
  // Call useTheme to ensure the side-effect sets the body class, 
  // even if we don't strictly use the `theme` variable here.
  useTheme(); 

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300 flex flex-col">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/settings" element={authUser ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!authUser ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPassword /> : <Navigate to="/" />} />
      </Routes>
      <Toaster position="top-center" toastOptions={{ 
        duration: 3000,
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155'
        }
      }} />
    </div>
  );
}

export default App;