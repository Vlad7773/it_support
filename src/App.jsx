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

// Тимчасові компоненти для інших сторінок
const Reports = () => <div className="text-white">Сторінка звітів</div>;
const Settings = () => <div className="text-white">Сторінка налаштувань</div>;

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
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
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/workstations"
            element={
              <Layout>
                <Workstations />
              </Layout>
            }
          />
          <Route
            path="/tickets"
            element={
              <Layout>
                <Tickets />
              </Layout>
            }
          />
          <Route
            path="/repairs"
            element={
              <Layout>
                <Repairs />
              </Layout>
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