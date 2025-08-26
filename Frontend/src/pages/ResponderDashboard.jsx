import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import api from "../api/axios";
import PriorityBadge from "../components/PriorityBadge.jsx";

// socket connection
const socket = io("http://localhost:8000/api/", { withCredentials: true });

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

function FlyToMarker({ position }) {
  const map = useMap();
  if (position) map.flyTo(position, 16);
  return null;
}

export default function ResponderDashboard() {
  const [user, setUser] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [responderLocation, setResponderLocation] = useState([12.9716, 77.5946]); // default BLR
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post("auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const res = await api.get("auth/check-auth", {
          withCredentials: true,
        });

        if (!res.data.isAuthenticated) {
          navigate("/login");
          return;
        }

        const currentUser = res.data.user;
        setUser(currentUser);

        if (currentUser.location?.coordinates) {
          // GeoJSON is [lng, lat] → Leaflet wants [lat, lng]
          setResponderLocation([
            currentUser.location.coordinates[1],
            currentUser.location.coordinates[0],
          ]);
        }

        // register socket
        socket.emit("registerResponder", currentUser._id);

        socket.on("newSOS", (payload) => {
          const next = payload?.sos ?? payload;
          setSosList((prev) => [next, ...prev]);
        });

        fetchAllSOS();
      } catch (err) {
        console.error(err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    const fetchAllSOS = async () => {
      try {
        const res = await api.get("sos", { withCredentials: true });
        setSosList(res.data.reverse());
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchAuthUser();

    return () => socket.off("newSOS");
  }, [navigate]);

  const handleMarkHandled = async (sosId) => {
    try {
      await api.put(
        `sos/update-status/${sosId}`,
        { status: "handled" },
        { withCredentials: true }
      );
      setSosList((prev) =>
        prev.map((s) => (s._id === sosId ? { ...s, status: "handled" } : s))
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-700 font-semibold">
            Loading responder dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const notHandled = sosList.filter((s) => s.status !== "handled");
  const handled = sosList.filter((s) => s.status === "handled");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
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
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Emergency Responder Dashboard
              </h1>
              <p className="text-sm text-red-100">Welcome, {user.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SOS List */}
        <div className="w-96 bg-white p-4 overflow-y-auto border-r border-gray-200">
          {/* Active Emergencies */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-red-700 flex items-center">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Active Emergencies
            </h2>
            {notHandled.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No active emergencies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notHandled.map((sos) => {
                  const distance = getDistanceFromLatLonInKm(
                    responderLocation[0],
                    responderLocation[1],
                    sos.location.coordinates[1],
                    sos.location.coordinates[0]
                  ).toFixed(2);

                  return (
                    <div
                      key={sos._id}
                      onClick={() =>
                        setSelectedSOS([
                          sos.location.coordinates[1],
                          sos.location.coordinates[0],
                        ])
                      }
                      className="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-red-700">
                            {sos.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(sos.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <PriorityBadge
                          tag={sos.priorityTag}
                          color={sos.priorityColor}
                          score={sos.priorityScore}
                        />
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {sos.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">
                          {distance} km away
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkHandled(sos._id);
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm flex items-center"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resolved Emergencies */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-700 flex items-center">
              Resolved Emergencies
            </h2>
            {handled.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No resolved emergencies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {handled.map((sos) => {
                  const distance = getDistanceFromLatLonInKm(
                    responderLocation[0],
                    responderLocation[1],
                    sos.location.coordinates[1],
                    sos.location.coordinates[0]
                  ).toFixed(2);

                  return (
                    <div
                      key={sos._id}
                      onClick={() =>
                        setSelectedSOS([
                          sos.location.coordinates[1],
                          sos.location.coordinates[0],
                        ])
                      }
                      className="bg-green-50 p-4 rounded-lg border border-green-200 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-green-700">
                            {sos.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(sos.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <PriorityBadge
                          tag={sos.priorityTag}
                          color={sos.priorityColor}
                          score={sos.priorityScore}
                        />
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {sos.description}
                      </p>
                      <p className="text-xs text-gray-600">{distance} km away</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={responderLocation}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* SOS Markers */}
            {sosList.map((sos) => (
              <Marker
                key={sos._id}
                position={[
                  sos.location.coordinates[1], // lat
                  sos.location.coordinates[0], // lng
                ]}
                icon={sos.status === "handled" ? greenIcon : redIcon}
                eventHandlers={{
                  click: () =>
                    setSelectedSOS([
                      sos.location.coordinates[1],
                      sos.location.coordinates[0],
                    ]),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <strong className="block mb-1">{sos.user.name}</strong>
                    <p className="text-sm mb-1">{sos.description}</p>
                    <p className="text-xs text-gray-600">
                      Status: {sos.status}
                    </p>
                    <div className="mt-1">
                      <PriorityBadge
                        tag={sos.priorityTag}
                        color={sos.priorityColor}
                        score={sos.priorityScore}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(sos.createdAt).toLocaleString()}
                    </p>
                    {sos.status !== "handled" && (
                      <button
                        onClick={() => handleMarkHandled(sos._id)}
                        className="mt-2 w-full bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Responder Marker */}
            <Marker position={responderLocation} icon={blueIcon}>
              <Popup>
                <div className="p-2">
                  <strong>Your Location</strong>
                  <p className="text-xs text-gray-600">Responder: {user.name}</p>
                </div>
              </Popup>
            </Marker>

            {selectedSOS && <FlyToMarker position={selectedSOS} />}
          </MapContainer>

          {/* Map Overlay Legend */}
          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-xs">Your Location</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs">Active Emergency</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs">Resolved Emergency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
