import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Profile = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/streak/current');
        setStreak(response.data.current_streak);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load streak data');
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔥</div>
        {streak > 0 ? (
          <>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {streak} Days Streak
            </div>
            <p className="text-gray-600 text-lg">
              Consistency beats motivation.
            </p>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              No active streak yet. Start today!
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;