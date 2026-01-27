import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RedoList = () => {
  const [redoSchedules, setRedoSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRedoSchedules = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/redo/schedule');
        setRedoSchedules(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load redo schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchRedoSchedules();
  }, []);

  const handleRedoClick = (redoId) => {
    navigate(`/redo/${redoId}`);
  };

  const getScheduleTypeDisplay = (scheduleType) => {
    const typeMap = {
      'three_days': '3 Days',
      'seven_days': '7 Days', 
      'fifteen_days': '15 Days'
    };
    return typeMap[scheduleType] || scheduleType;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading redo schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Redo Tasks</h1>

          {redoSchedules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No redo tasks today 🎉 You're doing great!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {redoSchedules.map((redo) => (
                <div
                  key={redo.redo_id}
                  onClick={() => handleRedoClick(redo.redo_id)}
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-150 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {redo.question_text}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {getScheduleTypeDisplay(redo.schedule_type)}
                        </span>
                        <span>
                          Due: {new Date(redo.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedoList;