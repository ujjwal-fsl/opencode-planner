import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AddMistake = () => {
  const [formData, setFormData] = useState({
    subject: '',
    chapter: '',
    topic: '',
    question_text: '',
    mistake_type: 'Concept',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mistakeTypes = ['Concept', 'Calculation', 'Misread', 'Trap'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/mistakes', formData);
      navigate('/mistakes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add mistake');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Mistake</h1>

          <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-150">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              {/* Chapter */}
              <div>
                <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter
                </label>
                <input
                  type="text"
                  id="chapter"
                  name="chapter"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.chapter}
                  onChange={handleChange}
                />
              </div>

              {/* Topic */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.topic}
                  onChange={handleChange}
                />
              </div>

              {/* Question Text */}
              <div>
                <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  id="question_text"
                  name="question_text"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.question_text}
                  onChange={handleChange}
                />
              </div>

              {/* Mistake Type */}
              <div>
                <label htmlFor="mistake_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Mistake Type
                </label>
                <select
                  id="mistake_type"
                  name="mistake_type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.mistake_type}
                  onChange={handleChange}
                >
                  {mistakeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes about this mistake..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {loading ? 'Adding...' : 'Add Mistake'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/mistakes')}
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

export default AddMistake;