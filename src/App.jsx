import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workstations from './pages/Workstations';
import Tickets from './pages/Tickets';
import Repairs from './pages/Repairs';
import Users from './pages/Users';
import Software from './pages/Software';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
};

const AdminRoute = ({ children }) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') {
      return <Navigate to="/" />;
    }
    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workstations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Workstations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tickets />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/repairs"
            element={
              <ProtectedRoute>
                <Layout>
                  <Repairs />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/software"
            element={
              <ProtectedRoute>
                <Layout>
                  <Software />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Layout>
                  <Users />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App; 