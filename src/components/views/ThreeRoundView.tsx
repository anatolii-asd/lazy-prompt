import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ThreeRoundViewProps } from '../types';

const ThreeRoundView: React.FC<ThreeRoundViewProps> = ({
  userPrompt,
  currentRound,
  roundQuestions,
  topicAnswers,
  detectedLanguage,
  isGenerating,
  onRoundComplete,
  setCurrentView,
  wizardMessage
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAnswer, setCustomAnswer] = useState('');

  // Reset question index when round changes or questions change
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setCurrentAnswers({});
    setShowCustomInput(false);
    setCustomAnswer('');
  }, [currentRound, roundQuestions]);

  const currentQuestion = roundQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === roundQuestions.length - 1;
  const isUkrainian = detectedLanguage === 'uk';

  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;
    
    const updatedAnswers = {
      ...currentAnswers,
      [currentQuestion.topic]: answer
    };
    setCurrentAnswers(updatedAnswers);
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (isLastQuestion) {
        // Submit all answers for this round
        onRoundComplete(updatedAnswers);
        setCurrentAnswers({});
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      setShowCustomInput(false);
      setCustomAnswer('');
    }, 500);
  };

  const handleCustomAnswerSubmit = () => {
    if (!currentQuestion || !customAnswer.trim()) return;
    handleAnswerSelect(customAnswer.trim());
  };

  const handleCustomInputToggle = () => {
    setShowCustomInput(!showCustomInput);
    setCustomAnswer('');
  };

  if (!currentQuestion) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => setCurrentView('home')}
          className="mb-6 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 {isUkrainian ? `Раунд ${currentRound} з 3` : `Round ${currentRound} of 3`}
          </h2>
          <p className="text-xl text-gray-600">
            {isUkrainian ? 'Одне питання за раз!' : 'One question at a time!'}
          </p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto mt-4 border border-gray-200">
            <p className="text-gray-700 italic">"{wizardMessage}"</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2, 3].map((round) => (
              <div
                key={round}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                  round < currentRound ? 'bg-green-500' : 
                  round === currentRound ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                {round < currentRound ? '✓' : round}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-2 mb-2">
            {roundQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < currentQuestionIndex ? 'bg-green-500' : 
                  index === currentQuestionIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-600">
            {isUkrainian ? `Питання ${currentQuestionIndex + 1} з ${roundQuestions.length}` : 
             `Question ${currentQuestionIndex + 1} of ${roundQuestions.length}`}
          </p>
        </div>

        {/* Current Question */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              {currentQuestion.topic === 'output_format' ? (isUkrainian ? 'Формат виводу' : 'Output Format') : 
               currentQuestion.topic === 'goal' ? (isUkrainian ? 'Мета' : 'Goal') :
               currentQuestion.topic === 'role' ? (isUkrainian ? 'Роль' : 'Role') :
               currentQuestion.topic === 'context' ? (isUkrainian ? 'Контекст' : 'Context') :
               currentQuestion.topic === 'warning' ? (isUkrainian ? 'Попередження' : 'Warning') :
               currentQuestion.topic === 'example' ? (isUkrainian ? 'Приклади' : 'Examples') :
               currentQuestion.topic}
            </h3>
            <p className="text-xl text-gray-700 mb-6 text-center">{currentQuestion.question}</p>
            
            {/* Answer Options */}
            <div className="space-y-4 mb-6">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.text}
                  onClick={() => handleAnswerSelect(option.text)}
                  className="w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700"
                >
                  <span className="text-2xl mr-3">{option.emoji}</span>
                  <span className="text-lg">{option.text}</span>
                </button>
              ))}
            </div>

            {/* Custom Answer Option */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleCustomInputToggle}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showCustomInput
                    ? 'bg-purple-50 border-purple-300 text-purple-800'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700'
                }`}
              >
                <span className="text-2xl mr-3">✨</span>
                <span className="text-lg">
                  {isUkrainian ? 'Власна відповідь' : 'Custom answer'}
                </span>
              </button>

              {showCustomInput && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder={isUkrainian ? 'Введіть свою відповідь...' : 'Enter your custom answer...'}
                    className="w-full p-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomAnswerSubmit()}
                    autoFocus
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCustomAnswerSubmit}
                      disabled={!customAnswer.trim()}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUkrainian ? 'Підтвердити' : 'Submit'}
                    </button>
                    <button
                      onClick={handleCustomInputToggle}
                      className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      {isUkrainian ? 'Скасувати' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isUkrainian ? 'Чарівник розмірковує... 💭' : 'The Wizard is contemplating... 💭'}
            </h3>
            <p className="text-gray-600 mb-4">{wizardMessage}</p>
            
            <div className="flex justify-center space-x-2">
              {['✨', '🔮', '🧙‍♂️'].map((emoji, i) => (
                <div
                  key={i}
                  className={`text-2xl transition-all duration-500 ${
                    Math.floor(Date.now() / 500) % 3 === i ? 'animate-bounce' : 'opacity-50'
                  }`}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeRoundView;