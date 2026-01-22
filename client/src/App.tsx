import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ArtBuilderPage from './pages/ArtBuilderPage';
import BiblePresenterPage from './pages/BiblePresenterPage';
import SettingsPage from './pages/SettingsPage';
import PresentationPage from './pages/PresentationPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/bible" replace />} />
        <Route path="/bible" element={<BiblePresenterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/art-builder" element={<ArtBuilderPage />} />
        <Route path="/presentation" element={<PresentationPage />} />
      </Route>
    </Routes>
  );
};

export default App;
