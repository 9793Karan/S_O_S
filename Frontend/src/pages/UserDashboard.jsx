import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../utils/AuthContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../api/axios";

const socket = io("https://s-o-s.onrender.com/api/", { withCredentials: true });

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function FlyToMarker({ position }) {
  const map = useMap();
  if (position) map.flyTo(position, 16);
  return null;
}

// Haversine formula to calculate distance in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function UserDashboard() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const { user, setRole } = useAuth();
  const navigate = useNavigate();

  // Auto-detect user location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ type: "Point", coordinates: [longitude, latitude] });
        setLoadingLocation(false);
      },
      (err) => {
        console.log("Geolocation error:", err.message);
        setLoadingLocation(false);
      }
    );
  }, []);

  // Fetch previous SOS
  const fetchSOS = async () => {
    try {
      const res = await api.get("sos", { withCredentials: true });
      setSosList(res.data.reverse()); // latest first
    } catch (err) {
      console.log("Failed to fetch SOS", err.message);
    }
  };

  useEffect(() => {
    fetchSOS();
    
    // Listen for new SOS events if user is a responder
    if (user && user.role === "responder") {
      socket.on("newSOS", (sos) => setSosList((prev) => [sos, ...prev]));
    }
    
    return () => {
      if (user && user.role === "responder") {
        socket.off("newSOS");
      }
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return alert("Location not detected");

    setLoading(true);
    try {
      await api.post(
        "sos/create",
        { description, location },
        { withCredentials: true }
      );
      setDescription("");
      fetchSOS(); // refresh previous SOS
      alert("SOS Sent Successfully!");
    } catch (err) {
      alert("Failed to create SOS: " + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHandled = async (sosId) => {
    try {
      await api.put(
        `sos/update-status/${sosId}`,
        { status: "handled" },
        { withCredentials: true }
      );
      setSosList((prev) => prev.map((s) => (s._id === sosId ? { ...s, status: "handled" } : s)));
    } catch (err) {
      console.error(err.message);
    }
  };

  const logout = async () => {
    try {
      await api.post("auth/logout", {}, { withCredentials: true });
      setRole(null);
      navigate("/login");
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loadingLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-700 font-semibold">Detecting your location...</p>
        </div>
      </div>
    );
  }

  const notHandled = sosList.filter((s) => s.status !== "handled");
  const handled = sosList.filter((s) => s.status === "handled");

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-red-600" 
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
            <h1 className="text-2xl font-bold">Emergency SOS Dashboard</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-4 font-medium">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-red-100">
          {/* SOS Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 inline-block mr-2" 
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
              Send Emergency Alert
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Emergency Description
                </label>
                <textarea
                  placeholder="Please describe your emergency situation in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center font-bold text-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    SENDING EMERGENCY ALERT...
                  </>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 mr-2" 
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
                    SEND EMERGENCY SOS
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map showing only current location */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2 text-red-600" 
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
              Your Current Location
            </h2>
            <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
              <MapContainer
                center={location ? [location.coordinates[1], location.coordinates[0]] : [12.9716, 77.5946]}
                zoom={15}
                style={{ height: "300px", width: "100%" }}
                onClick={(e) => setLocation({ type: "Point", coordinates: [e.latlng.lng, e.latlng.lat] })}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {location && (
                  <Marker
                    position={[location.coordinates[1], location.coordinates[0]]}
                    icon={blueIcon}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const pos = marker.getLatLng();
                        setLocation({ type: "Point", coordinates: [pos.lng, pos.lat] });
                      },
                    }}
                  >
                    <Popup>Your Current SOS Location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Click on the map or drag the marker to adjust your location if needed
            </p>
          </div>

          {/* SOS List for responders */}
          {user && user.role === "responder" && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                Active Emergency Requests
              </h2>
              
              {notHandled.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mx-auto text-gray-400 mb-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <p className="text-gray-500">No active emergency requests at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notHandled.map((sos) => {
                    const distance = location ? getDistanceFromLatLonInKm(
                      location.coordinates[1],
                      location.coordinates[0],
                      sos.location.coordinates[1],
                      sos.location.coordinates[0]
                    ).toFixed(2) : "N/A";

                    return (
                      <div
                        key={sos._id}
                        className="bg-red-50 rounded-xl p-4 border border-red-200 hover:shadow-md transition cursor-pointer"
                        onClick={() => setSelectedSOS([sos.location.coordinates[1], sos.location.coordinates[0]])}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-red-600">{sos.user.name}</h3>
                          <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                            {sos.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{sos.description}</p>
                        <p className="text-sm text-gray-500 mb-2">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                          </svg>
                          {sos.location.coordinates[1].toFixed(4)}, {sos.location.coordinates[0].toFixed(4)}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                          {new Date(sos.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-gray-700">Distance: {distance} km</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkHandled(sos._id);
                          }}
                          className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                            />
                          </svg>
                          Mark as Handled
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Previous SOS Cards with responder info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
              Your Emergency Requests
            </h2>
            
            {sosList.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto text-gray-400 mb-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-gray-500">No emergency requests submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sosList.map((sos) => (
                  <div
                    key={sos._id}
                    className={`rounded-xl p-4 shadow-md transition duration-300 ${
                      sos.status === 'handled' ? 'bg-green-50 border border-green-200' : 
                      sos.status === 'in-progress' ? 'bg-yellow-50 border border-yellow-200' : 
                      'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg text-red-600 flex items-center">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        {new Date(sos.createdAt).toLocaleString()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sos.status === 'handled' ? 'bg-green-200 text-green-800' : 
                        sos.status === 'in-progress' ? 'bg-yellow-200 text-yellow-800' : 
                        'bg-red-200 text-red-800'
                      }`}>
                        {sos.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{sos.description}</p>
                    <p className="text-sm text-gray-500 mb-2">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                      </svg>
                      Location: {sos.location.coordinates[1].toFixed(4)}, {sos.location.coordinates[0].toFixed(4)}
                    </p>
                    {sos.status === "handled" && sos.responder && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-green-700 mb-1 flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                            />
                          </svg>
                          Handled by Emergency Responder:
                        </p>
                        <p className="text-sm text-gray-700 ml-4">{sos.responder.name}</p>
                        <p className="text-sm text-gray-500 ml-4">{sos.responder.email}</p>
                        <p className="text-sm text-gray-500 ml-4">{sos.responder.phone}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 pb-4">
          <p>Emergency Response System © {new Date().getFullYear()}</p>
          <p className="mt-1">If this is a real emergency, please call local emergency services immediately</p>
        </div>
      </div>
    </div>
  );
}
