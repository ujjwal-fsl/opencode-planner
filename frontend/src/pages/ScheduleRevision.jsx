import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ScheduleRevision = () => {
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    topic_id: '',
    difficulty: 'Easy'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/heatmap/topics');
        setTopics(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/api/revision/schedule', {
        topic_id: formData.topic_id,
        difficulty: formData.difficulty
      });
      navigate('/revision');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule revision');
      setSubmitting(false);
    }
  };

  const getTopicDisplayName = (topic) => {
    return `${topic.subject_name} → ${topic.chapter_name} → ${topic.topic_name}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Schedule New Revision</h1>

          <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-150">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Topic Dropdown */}
              <div>
                <label htmlFor="topic_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <select
                  id="topic_id"
                  name="topic_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.topic_id}
                  onChange={handleChange}
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.topic_id} value={topic.topic_id}>
                      {getTopicDisplayName(topic)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Dropdown */}
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Revision'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/revision')}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleRevision;