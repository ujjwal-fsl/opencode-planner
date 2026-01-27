import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RedoAttempt = () => {
  const { redoId } = useParams();
  const [redoItem, setRedoItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRedoItem = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/redo/schedule');
        const item = response.data.find(redo => redo.redo_id === redoId);
        
        if (!item) {
          setError('Redo item not found');
        } else {
          setRedoItem(item);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load redo item');
      } finally {
        setLoading(false);
      }
    };

    fetchRedoItem();
  }, [redoId]);

  const handleAttempt = async (isCorrect) => {
    if (!redoItem) return;

    try {
      setSubmitting(true);
      await api.post('/api/redo/attempt', {
        redo_id: redoId,
        is_correct: isCorrect
      });
      navigate('/redo');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attempt');
      setSubmitting(false);
    }
  };

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

  if (error || !redoItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => navigate('/redo')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-150"
            >
              Back to Redo List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm p-8 transition-all duration-150 hover:shadow-md">
            <h1 className="text-xl font-semibold mb-3 text-center">Redo Attempt</h1>
            
            {/* Question */}
            <div className="mb-12">
              <p className="text-xl font-medium text-gray-900 text-center leading-relaxed">
                {redoItem.question_text}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => handleAttempt(true)}
                disabled={submitting}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-150"
              >
                <span>✅</span>
                <span>I got it right</span>
              </button>
              
              <button
                onClick={() => handleAttempt(false)}
                disabled={submitting}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-150"
              >
                <span>❌</span>
                <span>I got it wrong</span>
              </button>
            </div>

            {submitting && (
              <div className="text-center mt-4">
                <p className="text-gray-600">Submitting...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedoAttempt;