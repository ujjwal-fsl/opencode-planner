import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ShuffleSession = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load questions from sessionStorage
    const storedQuestions = sessionStorage.getItem('shuffleQuestions');
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);
      setLoading(false);
    } else {
      // No questions found, redirect to start
      navigate('/shuffle');
    }
  }, [navigate]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (isCorrect) => {
    if (!currentQuestion || submitting) return;

    try {
      setSubmitting(true);
      
      // If question source is "mistake", call redo attempt API
      if (currentQuestion.source === 'mistake' && currentQuestion.mistake_id) {
        await api.post('/api/redo/attempt', {
          redo_id: currentQuestion.mistake_id,
          is_correct: isCorrect
        });
      }
      
      // Move to next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Session completed
        setCompleted(true);
        sessionStorage.removeItem('shuffleQuestions');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
      sessionStorage.removeItem('shuffleQuestions');
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

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white rounded-lg shadow-sm p-8 transition-all duration-150">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Shuffle practice completed 🎉
          </h2>
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 flex items-center space-x-2 mx-auto transition-all duration-150"
          >
            <span>⬅️</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No question available</p>
          <button
            onClick={() => navigate('/shuffle')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-150"
          >
            Back to Shuffle Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Question Counter */}
          <div className="text-center mb-8">
            <p className="text-lg font-medium text-gray-600">
              Question {currentIndex + 1} / {questions.length}
            </p>
          </div>

          {/* Question Box */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 transition-all duration-150 hover:shadow-md">
            <p className="text-xl font-medium text-gray-900 text-center leading-relaxed">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-center mb-6">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            {currentQuestion.source === 'mistake' ? (
              <>
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={submitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-150"
                >
                  <span>✅</span>
                  <span>I got it right</span>
                </button>
                
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={submitting}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-150"
                >
                  <span>❌</span>
                  <span>I got it wrong</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-150"
              >
                <span>Next Question</span>
                <span>→</span>
              </button>
            )}
          </div>

          {submitting && (
            <div className="text-center mt-4">
              <p className="text-gray-600">Submitting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShuffleSession;