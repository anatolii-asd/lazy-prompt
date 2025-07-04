import React from 'react';
import { ArrowLeft, Copy, Sparkles } from 'lucide-react';
import { PreliminaryResultViewProps } from '../types';

const PreliminaryResultView: React.FC<PreliminaryResultViewProps> = ({
  userPrompt,
  preliminaryPrompt,
  currentRound,
  detectedLanguage,
  isGenerating,
  onContinue,
  onFinish,
  setCurrentView,
  wizardMessage,
  lazinessScore,
  qualityScore
}) => {
  const isUkrainian = detectedLanguage === 'uk';

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
            🎉 {isUkrainian ? `Попередній результат після раунду ${currentRound}!` : `Preliminary Result After Round ${currentRound}!`}
          </h2>
          <p className="text-xl text-gray-600">
            {isUkrainian ? 'Ваш промпт вже готовий до використання!' : 'Your prompt is ready to use!'}
          </p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto mt-4 border border-gray-200">
            <p className="text-gray-700 italic">"{wizardMessage}"</p>
          </div>
        </div>

        {/* Scores */}
        <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{isUkrainian ? 'Оцінка лінощів' : 'Laziness Score'}</span>
              <span className="text-2xl font-bold text-green-600">{lazinessScore}/10 🦥</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{isUkrainian ? 'Якість промпту' : 'Prompt Quality'}</span>
              <span className="text-2xl font-bold text-blue-600">{qualityScore}/10 ⭐</span>
            </div>
          </div>
        </div>

        {/* Preliminary Prompt */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
            {isUkrainian ? 'Ваш промпт' : 'Your Prompt'}
          </h3>
          <div className="bg-gray-50 rounded-2xl p-6 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto border-2 border-gray-200">
            {preliminaryPrompt}
          </div>
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => navigator.clipboard.writeText(preliminaryPrompt)}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              <Copy className="w-4 h-4" />
              <span>{isUkrainian ? 'Копіювати' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Choice Options */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
            {isUkrainian ? 'Що далі?' : 'What next?'}
          </h3>
          <p className="text-gray-600 text-center mb-6">
            {currentRound < 3 ? 
              (isUkrainian ? 
                `Ви можете продовжити з раундом ${currentRound + 1} для покращення промпту або зупинитися зараз.` : 
                `You can continue with round ${currentRound + 1} to improve the prompt or stop here.`)
              :
              (isUkrainian ? 
                'Це був останній раунд! Ви отримали найкращий можливий результат.' : 
                'This was the final round! You got the best possible result.')
            }
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={onFinish}
              className="p-6 rounded-xl border-2 transition-all hover:shadow-lg bg-green-50 hover:bg-green-100 border-green-300 text-green-800"
            >
              <div className="text-center">
                <span className="text-3xl mb-2 block">✅</span>
                <span className="text-lg font-semibold block mb-1">
                  {isUkrainian ? 'Використати цей промпт' : 'Use this prompt'}
                </span>
                <span className="text-sm text-green-600">
                  {isUkrainian ? 'Я задоволений результатом' : "I'm happy with this result"}
                </span>
              </div>
            </button>

            {currentRound < 3 && (
              <button
                onClick={onContinue}
                className="p-6 rounded-xl border-2 transition-all hover:shadow-lg bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800"
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block">🎯</span>
                  <span className="text-lg font-semibold block mb-1">
                    {isUkrainian ? `Продовжити з раундом ${currentRound + 1}` : `Continue to Round ${currentRound + 1}`}
                  </span>
                  <span className="text-sm text-blue-600">
                    {isUkrainian ? 'Покращити промпт далі' : 'Improve the prompt further'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isUkrainian ? 'Обробка...' : 'Processing...'}
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

export default PreliminaryResultView;