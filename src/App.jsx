import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MyTrips from './pages/MyTrips';
import SavedTrips from './pages/SavedTrips';
import TripDetail from './pages/TripDetail';
import TripEditor from './pages/TripEditor';
import PublicTrip from './pages/PublicTrip';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { TripProvider } from './store/useStore';
import ProfileSetupPage from './pages/ProfileSetupPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Settings from './pages/Settings';
import MyProfile from './pages/MyProfile';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <TripProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          <Route path="/setup-profile" element={<ProfileSetupPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          <Route path="/saved" element={
            <ProtectedRoute>
              <SavedTrips />
            </ProtectedRoute>
          } />

          <Route path="/trip/:id" element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          } />

          <Route path="/trip/new" element={
            <ProtectedRoute>
              <TripEditor />
            </ProtectedRoute>
          } />

          <Route path="/trip/:id/edit" element={
            <ProtectedRoute>
              <TripEditor />
            </ProtectedRoute>
          } />

          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

          <Route path="/public/:id" element={<PublicTrip />} />


          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </TripProvider>
  );
}

export default App;
