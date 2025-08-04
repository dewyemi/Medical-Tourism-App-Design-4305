import React from 'react';
import {HashRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {LanguageProvider} from './contexts/LanguageContext';
import {PaymentProvider} from './contexts/PaymentContext';
import {PatientJourneyProvider} from './contexts/PatientJourneyContext';
import RequireAuth from './components/auth/RequireAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './components/DestinationDetail';
import Treatments from './pages/Treatments';
import TreatmentDetail from './components/TreatmentDetail';
import Profile from './pages/Profile';
import ProfileForm from './components/ProfileForm';
import UserProfileWithRole from './components/UserProfileWithRole';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProviderSignUp from './pages/ProviderSignUp';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import SearchPage from './pages/SearchPage';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/admin/AdminDashboard';
import PaymentsPage from './pages/PaymentsPage';
import PatientJourney from './pages/PatientJourney';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <PaymentProvider>
            <PatientJourneyProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/provider-signup" element={<ProviderSignUp />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes - basic user access */}
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <Layout>
                      <PatientJourney />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/destinations" element={
                  <RequireAuth>
                    <Layout>
                      <Destinations />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/destinations/:id" element={
                  <RequireAuth>
                    <Layout>
                      <DestinationDetail />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/treatments" element={
                  <RequireAuth>
                    <Layout>
                      <Treatments />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/treatments/:id" element={
                  <RequireAuth>
                    <Layout>
                      <TreatmentDetail />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/profile" element={
                  <RequireAuth>
                    <Layout>
                      <UserProfileWithRole />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/profile/edit" element={
                  <RequireAuth>
                    <Layout>
                      <ProfileForm />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/bookings" element={
                  <RequireAuth requiredPermissions={['bookings:read']}>
                    <Layout>
                      <Bookings />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/payments" element={
                  <RequireAuth requiredPermissions={['bookings:read']}>
                    <Layout>
                      <PaymentsPage />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/journey" element={
                  <RequireAuth>
                    <Layout>
                      <PatientJourney />
                    </Layout>
                  </RequireAuth>
                } />
                
                {/* Analytics requires specific permissions */}
                <Route path="/analytics" element={
                  <RequireAuth requiredPermissions={['analytics:read']}>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/search" element={
                  <RequireAuth>
                    <SearchPage />
                  </RequireAuth>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <RequireAuth requiredRoles={['admin']}>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </RequireAuth>
                } />
              </Routes>
            </PatientJourneyProvider>
          </PaymentProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;