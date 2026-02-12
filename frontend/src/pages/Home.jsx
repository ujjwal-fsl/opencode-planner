import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Home = () => {
  const [redoToday, setRedoToday] = useState([]);
  const [revisionToday, setRevisionToday] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/home');
        // STRICT FIX: Extract data from response.data.data
        const homeData = response.data?.data;
        
        setRedoToday(homeData?.redo_today || []);
        setRevisionToday(homeData?.revision_today || []);
        setCurrentStreak(homeData?.current_streak || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load home data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <p className="text-red-600">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          {/* Current Streak */}
          <div className="bg-white rounded-lg shadow-sm p-4 transition-all duration-150 hover:shadow-md">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              🔥 Current Streak
            </h2>
            <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
          </div>

          {/* Redo Today */}
          <div className="bg-white rounded-lg shadow-sm p-4 transition-all duration-150 hover:shadow-md">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              🔁 Redo Today
            </h2>
            {redoToday?.length === 0 ? (
              <p className="text-gray-500">No redo tasks today 🎉 You're doing great!</p>
            ) : (
              <div className="space-y-3">
                {redoToday?.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                    <p className="font-medium text-gray-900">{item.question_text}</p>
                    <p className="text-sm text-gray-600">Type: {item.schedule_type}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(item.due_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision Today */}
          <div className="bg-white rounded-lg shadow-sm p-4 transition-all duration-150 hover:shadow-md">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              📆 Revision Today
            </h2>
            {revisionToday?.length === 0 ? (
              <p className="text-gray-500">No revisions scheduled today 📚 Take a break or add new ones.</p>
            ) : (
              <div className="space-y-3">
                {revisionToday?.map((item, index) => (
                  <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                    <p className="font-medium text-gray-900">{item.topic_name}</p>
                    <p className="text-sm text-gray-600">Type: {item.slot_type}</p>
                    <p className="text-sm text-gray-600">Scheduled: {new Date(item.scheduled_for).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;