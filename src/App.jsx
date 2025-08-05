import {HashRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {LanguageProvider} from './contexts/LanguageContext';
import {PaymentProvider} from './contexts/PaymentContext';
import {PatientJourneyProvider} from './contexts/PatientJourneyContext';
import RequireAuth from './components/auth/RequireAuth';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProviderSignUp from './pages/ProviderSignUp';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import Unauthorized from './pages/Unauthorized';

// Lazy load heavy components for better performance
import { lazy, Suspense } from 'react';
import LoadingScreen from './components/common/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const Destinations = lazy(() => import('./pages/Destinations'));
const DestinationDetail = lazy(() => import('./components/DestinationDetail'));
const Treatments = lazy(() => import('./pages/Treatments'));
const TreatmentDetail = lazy(() => import('./components/TreatmentDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileForm = lazy(() => import('./components/ProfileForm'));
const UserProfileWithRole = lazy(() => import('./components/UserProfileWithRole'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const PatientJourney = lazy(() => import('./pages/PatientJourney'));

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
                      <Suspense fallback={<LoadingScreen />}>
                        <PatientJourney />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/destinations" element={
                  <RequireAuth>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Destinations />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/destinations/:id" element={
                  <RequireAuth>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <DestinationDetail />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/treatments" element={
                  <RequireAuth>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Treatments />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/treatments/:id" element={
                  <RequireAuth>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <TreatmentDetail />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/profile" element={
                  <RequireAuth>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <UserProfileWithRole />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/profile/edit" element={
                  <RequireAuth>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <ProfileForm />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/bookings" element={
                  <RequireAuth requiredPermissions={['bookings:read']}>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Bookings />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/payments" element={
                  <RequireAuth requiredPermissions={['bookings:read']}>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <PaymentsPage />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/journey" element={
                  <RequireAuth>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <PatientJourney />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                {/* Analytics requires specific permissions */}
                <Route path="/analytics" element={
                  <RequireAuth requiredPermissions={['analytics:read']}>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Analytics />
                      </Suspense>
                    </Layout>
                  </RequireAuth>
                } />
                
                <Route path="/search" element={
                  <RequireAuth>
                    <Suspense fallback={<LoadingScreen />}>
                      <SearchPage />
                    </Suspense>
                  </RequireAuth>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <RequireAuth requiredRoles={['admin']}>
                    <Layout>
                      <Suspense fallback={<LoadingScreen />}>
                        <AdminDashboard />
                      </Suspense>
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