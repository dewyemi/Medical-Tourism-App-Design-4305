import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './components/DestinationDetail';
import Treatments from './pages/Treatments';
import TreatmentDetail from './components/TreatmentDetail';
import Profile from './pages/Profile';
import ProfileForm from './components/ProfileForm';
import Bookings from './pages/Bookings';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/destinations" element={
            <ProtectedRoute>
              <Layout>
                <Destinations />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/destinations/:id" element={
            <ProtectedRoute>
              <Layout>
                <DestinationDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/treatments" element={
            <ProtectedRoute>
              <Layout>
                <Treatments />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/treatments/:id" element={
            <ProtectedRoute>
              <Layout>
                <TreatmentDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <Layout>
                <ProfileForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Layout>
                <Bookings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;