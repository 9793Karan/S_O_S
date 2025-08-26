import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ type: "Point", coordinates: [e.latlng.lng, e.latlng.lat] });
    },
  });

  return location ? (
    <Marker
      position={[location.coordinates[1], location.coordinates[0]]}
      icon={blueIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setLocation({ type: "Point", coordinates: [pos.lng, pos.lat] });
        },
      }}
    />
  ) : null;
}

export default function Register() {
  const [role, setRole] = useState("user");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: null,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({
          ...prev,
          location: { type: "Point", coordinates: [longitude, latitude] },
        }));
        setLoadingLocation(false);
      },
      (err) => {
        alert("Failed to fetch location: " + err.message);
        setLoadingLocation(false);
      }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "auth/register",
        { ...form, role },
        { withCredentials: true }
      );
      alert("Registration Successful");
    } catch (err) {
      alert("Registration Failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg mr-3">
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
          <h1 className="text-2xl font-bold text-red-700">Emergency Response System</h1>
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
              Full Name
            </label>
            <input 
              id="name"
              name="name" 
              placeholder="Enter your full name" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <input 
              id="email"
              name="email" 
              type="email" 
              placeholder="Enter your email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input 
              id="password"
              name="password" 
              type="password" 
              placeholder="Create a secure password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input 
              id="phone"
              name="phone" 
              type="text" 
              placeholder="Enter your phone number" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="role">
              Account Type
            </label>
            <select 
              id="role"
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="user">Emergency User</option>
              <option value="responder">Emergency Responder</option>
            </select>
          </div>

          {role === "responder" && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                Responder Location
              </h3>
              
              <div className="mb-3">
                <input
                  name="location"
                  value={form.location ? `${form.location.coordinates[1].toFixed(4)}, ${form.location.coordinates[0].toFixed(4)}` : ""}
                  readOnly
                  placeholder="Your location coordinates will appear here"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
                />
              </div>
              
              <button
                type="button"
                onClick={detectLocation}
                disabled={loadingLocation}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center mb-3"
              >
                {loadingLocation ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                    </svg>
                    Detect My Location
                  </>
                )}
              </button>

              {form.location && (
                <div className="rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={[form.location.coordinates[1], form.location.coordinates[0]]}
                    zoom={15}
                    style={{ height: "200px", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker location={form.location} setLocation={(loc) => setForm({ ...form, location: loc })} />
                  </MapContainer>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Click on the map or drag the marker to adjust your location if needed
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-bold text-lg"
          >
            Create Account
          </button>
        </form>

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
            Your data is secure and will only be used for emergency response purposes.
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-red-600 hover:text-red-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}