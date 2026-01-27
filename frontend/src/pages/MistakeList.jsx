import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MistakeList = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/mistakes');
        setMistakes(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load mistakes');
      } finally {
        setLoading(false);
      }
    };

    fetchMistakes();
  }, []);

  const groupMistakes = (mistakes) => {
    const grouped = {};
    
    mistakes.forEach(mistake => {
      const subject = mistake.subject || 'Unknown Subject';
      const chapter = mistake.chapter || 'Unknown Chapter';
      const topic = mistake.topic || 'Unknown Topic';
      
      if (!grouped[subject]) {
        grouped[subject] = {};
      }
      if (!grouped[subject][chapter]) {
        grouped[subject][chapter] = {};
      }
      if (!grouped[subject][chapter][topic]) {
        grouped[subject][chapter][topic] = [];
      }
      
      grouped[subject][chapter][topic].push(mistake);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mistakes...</p>
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

  const groupedMistakes = groupMistakes(mistakes);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mistake Vault</h1>
            <button
              onClick={() => navigate('/mistakes/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center transition-all duration-150"
            >
              ➕ Add New Mistake
            </button>
          </div>

          {mistakes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No mistakes added yet. Start by adding your first one ✍️
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMistakes).map(([subject, chapters]) => (
                <div key={subject} className="bg-white rounded-lg shadow-sm transition-all duration-150 hover:shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">{subject}</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {Object.entries(chapters).map(([chapter, topics]) => (
                      <div key={chapter} className="ml-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">{chapter}</h3>
                        
                        <div className="ml-4 space-y-3">
                          {Object.entries(topics).map(([topic, topicMistakes]) => (
                            <div key={topic} className="ml-4">
                              <h4 className="text-md font-medium text-gray-700 mb-2">{topic}</h4>
                              
                              <div className="space-y-2">
                                {topicMistakes.map((mistake, index) => (
                                  <div key={mistake.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="font-medium text-gray-900 mb-2">{mistake.question_text}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {mistake.mistake_type}
                                      </span>
                                      {mistake.notes && (
                                        <span className="text-gray-500">Notes: {mistake.notes}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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

export default MistakeList;