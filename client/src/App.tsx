import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ArtBuilderPage from './pages/ArtBuilderPage';
import BiblePresenterPage from './pages/BiblePresenterPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/bible" replace />} />
        <Route path="/bible" element={<BiblePresenterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/art-builder" element={<ArtBuilderPage />} />
      </Route>
    </Routes>
  );
};

export default App;

