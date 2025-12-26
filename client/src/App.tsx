import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import PresentationPage from './pages/PresentationPage';
import BiblePresenterPage from './pages/BiblePresenterPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/bible" replace />} />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/bible" element={<BiblePresenterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;

