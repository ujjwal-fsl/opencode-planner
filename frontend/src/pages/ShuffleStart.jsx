import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ShuffleStart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noQuestions, setNoQuestions] = useState(false);
  const navigate = useNavigate();

  const handleStartShuffle = async () => {
    try {
      setLoading(true);
      setError('');
      setNoQuestions(false);
      
      const response = await api.get('/api/shuffle/questions');
      
      if (response.data.length === 0) {
        setNoQuestions(true);
        return;
      }
      
      // Store questions in sessionStorage for the session page
      sessionStorage.setItem('shuffleQuestions', JSON.stringify(response.data));
      navigate('/shuffle/play');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start shuffle practice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shuffle Practice</h1>
        
        {noQuestions ? (
          <div className="bg-white rounded-lg shadow-sm p-8 transition-all duration-150">
            <p className="text-gray-600 text-lg mb-6">
              No questions available for shuffle practice yet.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-150"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 transition-all duration-150">
            <p className="text-gray-600 mb-8">
              Practice with randomly selected questions from your mistakes and self-added questions.
            </p>
            
            {error && (
              <div className="text-red-600 text-sm mb-6">{error}</div>
            )}
            
            <button
              onClick={handleStartShuffle}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium flex items-center space-x-2 mx-auto transition-all duration-150"
            >
              <span>▶️</span>
              <span>{loading ? 'Loading...' : 'Start Shuffle Practice'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShuffleStart;