import { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaSignInAlt, 
  FaUserPlus, 
  FaMapMarkerAlt, 
  FaBell, 
  FaUsers, 
  FaExclamationCircle, 
  FaPhoneAlt, 
  FaUser, 
  FaUserMd,
  FaEnvelope
} from 'react-icons/fa';


const EmergencyResponseHomepage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Navigation */}
      <nav className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <span className="text-xl font-bold">Emergency Response System</span>
              </div>
            </div>
            
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-red-700 mb-4">Emergency Response System</h1>
              <p className="text-lg text-gray-700 mb-8">A reliable platform for emergency alerts and rapid response coordination. Get help when you need it most.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <a href="/login" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center">
                  <FaSignInAlt className="mr-2" /> Login
                </a>
                <a href="/register" className="bg-white hover:bg-gray-100 text-red-600 border border-red-600 font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center">
                  <FaUserPlus className="mr-2" /> Register
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-red-500 rounded-full emergency-pulse flex items-center justify-center">
                  <div className="w-56 h-56 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-red-700 rounded-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <FaExclamationTriangle className="text-5xl mb-2 mx-auto" />
                        <p className="text-xl font-bold">SOS</p>
                        <p className="text-sm mt-1">Emergency Alert</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-red-700 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card bg-red-50 p-6 rounded-lg shadow-md transition duration-300">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Location Detection</h3>
              <p className="text-gray-600">Our system automatically detects your location for faster emergency response.</p>
            </div>
            <div className="feature-card bg-red-50 p-6 rounded-lg shadow-md transition duration-300">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaBell className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Instant Alerts</h3>
              <p className="text-gray-600">Send emergency alerts with just one click to notify responders immediately.</p>
            </div>
            <div className="feature-card bg-red-50 p-6 rounded-lg shadow-md transition duration-300">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Responder Network</h3>
              <p className="text-gray-600">Connect with trained emergency responders in your area for quick assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Actions */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Immediate Help?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">If you're experiencing an emergency, our responders are ready to assist you.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="/login" className="bg-white text-red-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition duration-300 text-lg flex items-center justify-center">
              <FaExclamationCircle className="mr-2" /> Send Emergency Alert
            </a>
            <a href="tel:911" className="border-2 border-white hover:bg-red-700 font-bold py-4 px-8 rounded-lg transition duration-300 text-lg flex items-center justify-center">
              <FaPhoneAlt className="mr-2" /> Call Emergency Line
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-red-700 mb-12">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <FaUser className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-red-600 text-sm">Emergency User</p>
                </div>
              </div>
              <p className="text-gray-600">"This system helped me during a medical emergency. The response time was incredible, and the responders were at my location within minutes."</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <FaUserMd className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Dr. Michael Chen</h4>
                  <p className="text-red-600 text-sm">Emergency Responder</p>
                </div>
              </div>
              <p className="text-gray-600">"As a responder, this platform allows me to quickly receive alerts and coordinate with other responders. The location accuracy has been vital."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-red-700 mb-6">Join Our Emergency Response Network</h2>
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto">Register today to become part of our emergency response community, either as a user or a responder.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="/register" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg flex items-center justify-center">
              <FaUserPlus className="mr-2" /> Register as User
            </a>
            <a href="/register" className="bg-white hover:bg-gray-100 text-red-600 border border-red-600 font-bold py-3 px-8 rounded-lg transition duration-300 text-lg flex items-center justify-center">
              <FaUserPlus className="mr-2" /> Register as Responder
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      

      <style jsx>{`
        .emergency-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.2);
        }
        
        .hero-pattern {
          background-color: #fef2f2;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default EmergencyResponseHomepage;