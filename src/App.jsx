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

function App() {
  return (
    <TripProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          <Route path="/setup-profile" element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/my-trips" element={
            <ProtectedRoute>
              <MyTrips />
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

          <Route path="/about" element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          } />

          <Route path="/public/:id" element={<PublicTrip />} />
        </Routes>
      </Router>
    </TripProvider>
  );
}

export default App;
