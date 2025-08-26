import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get(`auth/check-auth`, {
          withCredentials: true,
        });

        if (res.data.isAuthenticated) {
          const role = res.data.user.role;
          setRole(role);

          if (role === "admin") navigate("/admin");
          else if (role === "responder") navigate("/responder");
          else navigate("/user");
        }
      } catch (err) {
       
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, setRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "auth/login",
        { email, password },
        { withCredentials: true }
      );

      const role = res.data.user.role;
      setRole(role);

      if (role === "admin") navigate("/admin");
      else if (role === "responder") navigate("/responder");
      else navigate("/user");
    } catch (err) {
      alert("Login Failed");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-700 font-semibold">Checking session...</p>
        </div>
      </div>
    );

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
      <div className="absolute top-6 left-6 flex items-center">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h1 className="ml-3 text-2xl font-bold text-red-700">SOS EMERGENCY</h1>
      </div>
      
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-red-100 relative"
      >
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-red-800">Emergency Access</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">Secure login for emergency personnel</p>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="emergency@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          ACCESS EMERGENCY SYSTEM
        </button>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-red-600 hover:text-red-700 font-medium">
              Register now
            </a>
          </p>
        </div>
        <div className="mt-6 p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-700 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 inline-block mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
            Restricted access. Authorized personnel only.
          </p>
          
        </div>
      </form>
      
      <div className="absolute bottom-4 w-full text-center">
        <p className="text-xs text-gray-500">Emergency Response System © {new Date().getFullYear()}</p>
        
      </div>
      
    </div>
  );
}