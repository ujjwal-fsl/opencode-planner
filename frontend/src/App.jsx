import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MistakeList from './pages/MistakeList';
import AddMistake from './pages/AddMistake';
import RedoList from './pages/RedoList';
import RedoAttempt from './pages/RedoAttempt';
import HeatMap from './pages/HeatMap';
import RevisionList from './pages/RevisionList';
import ScheduleRevision from './pages/ScheduleRevision';
import ShuffleStart from './pages/ShuffleStart';
import ShuffleSession from './pages/ShuffleSession';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mistakes"
          element={
            <ProtectedRoute>
              <MistakeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mistakes/add"
          element={
            <ProtectedRoute>
              <AddMistake />
            </ProtectedRoute>
          }
        />
        <Route
          path="/redo"
          element={
            <ProtectedRoute>
              <RedoList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/redo/:redoId"
          element={
            <ProtectedRoute>
              <RedoAttempt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/heatmap"
          element={
            <ProtectedRoute>
              <HeatMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/revision"
          element={
            <ProtectedRoute>
              <RevisionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/revision/add"
          element={
            <ProtectedRoute>
              <ScheduleRevision />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shuffle"
          element={
            <ProtectedRoute>
              <ShuffleStart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shuffle/play"
          element={
            <ProtectedRoute>
              <ShuffleSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
