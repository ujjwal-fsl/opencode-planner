import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const HeatMap = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHeatMapData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/heatmap/topics');
        setTopics(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load heat map data');
      } finally {
        setLoading(false);
      }
    };

    fetchHeatMapData();
  }, []);

  const getStrengthColor = (strengthLevel) => {
    switch (strengthLevel) {
      case 'Weak':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Strong':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupTopics = (topics) => {
    const grouped = {};
    
    topics.forEach(topic => {
      const subject = topic.subject_name || 'Unknown Subject';
      const chapter = topic.chapter_name || 'Unknown Chapter';
      
      if (!grouped[subject]) {
        grouped[subject] = {};
      }
      if (!grouped[subject][chapter]) {
        grouped[subject][chapter] = [];
      }
      
      grouped[subject][chapter].push(topic);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading heat map...</p>
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

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Topic Heat Map</h1>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No heat map data yet. Add mistakes and attempt redos to see insights 📊
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedTopics = groupTopics(topics);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Topic Heat Map</h1>

          {/* Legend */}
          <div className="mb-8 flex items-center space-x-6">
            <span className="text-sm font-medium text-gray-700">Legend:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-sm text-gray-600">Weak</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm text-gray-600">Strong</span>
            </div>
          </div>

          {/* Heat Map */}
          <div className="space-y-4">
            {Object.entries(groupedTopics).map(([subject, chapters]) => (
              <div key={subject} className="bg-white rounded-lg shadow-sm transition-all duration-150 hover:shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">{subject}</h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {Object.entries(chapters).map(([chapter, chapterTopics]) => (
                    <div key={chapter} className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">{chapter}</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {chapterTopics.map((topic) => (
                          <div
                            key={topic.topic_id}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium ${getStrengthColor(topic.strength_level)}`}
                          >
                            {topic.topic_name}
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
      </div>
    </div>
  );
};

export default HeatMap;