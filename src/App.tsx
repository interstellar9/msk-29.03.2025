import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import ListingDetails from './pages/ListingDetails';
import CreateListing from './pages/CreateListing';
import CreateNews from './pages/CreateNews';
import Messages from './pages/Messages';
import Token from './pages/Token';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import Regulamin from './pages/Terms';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/company-profile" element={<CompanyProfile />} />
              <Route path="/listings/:id" element={<ListingDetails />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/create-news" element={<CreateNews />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/token" element={<Token />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<Regulamin />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
