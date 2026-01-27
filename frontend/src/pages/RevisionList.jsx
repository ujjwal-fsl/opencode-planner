import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RevisionList = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(null);
  const navigate = useNavigate();

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/revision/slots');
      setSlots(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revision slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleComplete = async (slotId) => {
    try {
      setCompleting(slotId);
      await api.post(`/api/revision/complete/${slotId}`);
      // Refetch slots to get updated list
      await fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete revision');
    } finally {
      setCompleting(null);
    }
  };

  const getSlotTypeDisplay = (slotType) => {
    const typeMap = {
      'first_revision': 'First Revision',
      'second_revision': 'Second Revision', 
      'third_revision': 'Third Revision'
    };
    return typeMap[slotType] || slotType;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revision slots...</p>
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
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Revision Schedule</h1>
            <button
              onClick={() => navigate('/revision/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center transition-all duration-150"
            >
              ➕ Schedule New Revision
            </button>
          </div>

          {slots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No revisions pending 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {slots.map((slot) => (
                <div key={slot.slot_id} className="bg-white rounded-lg shadow-sm p-4 transition-all duration-150 hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {slot.topic_name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {getSlotTypeDisplay(slot.slot_type)}
                        </span>
                        <span>
                          Scheduled: {new Date(slot.scheduled_for).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleComplete(slot.slot_id)}
                      disabled={completing === slot.slot_id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-150"
                    >
                      <span>✅</span>
                      <span>{completing === slot.slot_id ? 'Completing...' : 'Mark as Completed'}</span>
                    </button>
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

export default RevisionList;