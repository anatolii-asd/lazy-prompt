import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Zap, Brain, ChevronRight, Copy, Download, RefreshCw, Star, Heart, Lightbulb, Target, Rocket, Clock, Users, TrendingUp, Shield, Check, ArrowLeft, Play, Pause, Coffee, Moon, Smile } from 'lucide-react';

// Move constants outside component to prevent recreation
const lazinessLevels = [
  {
    id: 'super-lazy',
    name: 'Super Duper Lazy',
    icon: '😴',
    description: "I'm too lazy to even think about options",
    slothSays: "Perfect! Let me do ALL the work for you 💤"
  },
  {
    id: 'regular-lazy',
    name: 'Just Regular Lazy', 
    icon: '🛋️',
    description: "I can answer like 3 easy questions, maybe",
    slothSays: "Okay, I'll ask you 5 tiny questions. Super easy! 🍃"
  }
];

const slothQuotes = [
  "Why work hard when you can work smart? 🦥",
  "Slow and steady wins the prompt race! 🐌",
  "Being lazy is an art form, and you're an artist! 🎨",
  "Let me handle the thinking while you handle the relaxing 💤",
  "Efficiency is just organized laziness! ✨"
];

// Move HomeView outside main component
const HomeView = ({ 
  userPrompt, 
  setUserPrompt, 
  selectedLaziness, 
  setSelectedLaziness, 
  slothMessage, 
  setSlothMessage, 
  handleGenerate, 
  isGenerating, 
  promptTextareaRef, 
  randomQuote 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🦥 SlothBoost
          </h1>
          <p className="text-xl text-gray-600">The laziest way to create amazing prompts!</p>
        </div>

        {/* Sloth Speech Bubble */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8 relative max-w-2xl mx-auto">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full"></div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">{slothMessage}</p>
            <p className="text-sm text-gray-500 italic">
              "{randomQuote}"
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Prompt Input */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <Coffee className="w-5 h-5 mr-2 text-amber-500" />
                What do you want to create? (Keep it simple, I'm lazy too!)
              </label>
              <textarea
                ref={promptTextareaRef}
                value={userPrompt}
                onChange={(e) => {
                  setUserPrompt(e.target.value);
                }}
                placeholder="e.g., 'blog post about dogs' or 'email to my boss'"
                className="w-full h-24 p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none text-lg resize-none transition-all"
              />
            </div>

            {/* Laziness Level */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Moon className="w-5 h-5 mr-2 text-indigo-500" />
                How lazy are you feeling today?
              </label>
              <div className="space-y-3">
                {lazinessLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setSelectedLaziness(level.id);
                      setSlothMessage(level.slothSays);
                    }}
                    className={`w-full p-4 rounded-2xl border-3 transition-all text-left ${
                      selectedLaziness === level.id
                        ? 'border-green-400 bg-green-50 shadow-lg transform scale-102'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{level.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{level.name}</h3>
                        <p className="text-gray-600">{level.description}</p>
                      </div>
                      {selectedLaziness === level.id && (
                        <div className="ml-auto">
                          <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!userPrompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-2xl hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              <Zap className="w-6 h-6" />
              <span>Let's Be Lazy Together! 🦥</span>
            </button>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">😴</div>
            <div className="text-2xl font-bold text-green-600">50K+</div>
            <div className="text-gray-600">Lazy Humans Helped</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-blue-600">5 sec</div>
            <div className="text-gray-600">Average Lazy Time</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600">300%</div>
            <div className="text-gray-600">Better Results</div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Sloth is thinking... 💭</h3>
            <p className="text-gray-600 mb-4">{slothMessage}</p>
            
            <div className="flex justify-center space-x-2">
              {['💤', '😴', '🦥'].map((emoji, i) => (
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

// Move WorkspaceView outside main component
const WorkspaceView = ({ 
  userPrompt,
  selectedLaziness,
  selectedAnswers,
  setSelectedAnswers,
  customAnswers,
  setCustomAnswers,
  showCustomInput,
  setShowCustomInput,
  answeredQuestions,
  setAnsweredQuestions,
  handleAnswerSelect,
  handleCustomAnswer,
  handleCustomInputChange,
  handleWorkspaceGenerate,
  isGenerating,
  slothMessage,
  setCurrentView
}) => (
  <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
    <div className="max-w-3xl mx-auto pt-8">
      <button 
        onClick={() => setCurrentView('home')}
        className="mb-6 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Perfect! Let me handle this for you 🦥</h2>
      </div>

      {/* Sloth Analysis */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Here's what I detected:</h3>
          <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
            <p className="text-lg text-gray-700">
              <span className="font-semibold">Content Type:</span> Blog Post 📝
            </p>
            <p className="text-lg text-gray-700 mt-2">
              <span className="font-semibold">Topic:</span> "{userPrompt}"
            </p>
            <p className="text-lg text-gray-700 mt-2">
              <span className="font-semibold">Laziness Level:</span> {lazinessLevels.find(l => l.id === selectedLaziness)?.name} {lazinessLevels.find(l => l.id === selectedLaziness)?.icon}
            </p>
          </div>
        </div>

        {selectedLaziness === 'regular-lazy' && (
          <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200 mb-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-yellow-800 mb-4">Quick Questions (I promise it's easy!) 🛋️</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">1. How long should it be?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Short & Sweet', 'Medium Size', 'Long & Detailed'].map((option) => (
                      <button 
                        key={option}
                        onClick={() => handleAnswerSelect('length', option)}
                        className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                          selectedAnswers.length === option 
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                            : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleCustomAnswer('length')}
                      className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                        selectedAnswers.length === 'custom' 
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                          : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                      }`}
                    >
                      ✏️ Custom
                    </button>
                  </div>
                  {showCustomInput.length && (
                    <input
                      type="text"
                      placeholder="e.g., 500 words, super short, epic novel..."
                      value={customAnswers.length || ''}
                      onChange={(e) => handleCustomInputChange('length', e.target.value)}
                      className="w-full mt-3 p-4 border-2 border-yellow-300 rounded-xl focus:border-yellow-500 outline-none text-base"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">2. Who's it for?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['General People', 'Beginners', 'Experts'].map((option) => (
                      <button 
                        key={option}
                        onClick={() => handleAnswerSelect('audience', option)}
                        className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                          selectedAnswers.audience === option 
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                            : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleCustomAnswer('audience')}
                      className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                        selectedAnswers.audience === 'custom' 
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                          : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                    >
                      ✏️ Custom
                    </button>
                  </div>
                  {showCustomInput.audience && (
                    <input
                      type="text"
                      placeholder="e.g., college students, tech professionals, parents..."
                      value={customAnswers.audience || ''}
                      onChange={(e) => handleCustomInputChange('audience', e.target.value)}
                      className="w-full mt-3 p-4 border-2 border-yellow-300 rounded-xl focus:border-yellow-500 outline-none text-base"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">3. What tone?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Friendly', 'Professional', 'Fun & Casual'].map((option) => (
                      <button 
                        key={option}
                        onClick={() => handleAnswerSelect('tone', option)}
                        className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                          selectedAnswers.tone === option 
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                            : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleCustomAnswer('tone')}
                      className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                        selectedAnswers.tone === 'custom' 
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                          : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                      }`}
                    >
                      ✏️ Custom
                    </button>
                  </div>
                  {showCustomInput.tone && (
                    <input
                      type="text"
                      placeholder="e.g., sarcastic, academic, inspirational..."
                      value={customAnswers.tone || ''}
                      onChange={(e) => handleCustomInputChange('tone', e.target.value)}
                      className="w-full mt-3 p-4 border-2 border-yellow-300 rounded-xl focus:border-yellow-500 outline-none text-base"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">4. What style do you want?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Simple & Clear', 'Detailed & Rich', 'Creative & Unique'].map((option) => (
                      <button 
                        key={option}
                        onClick={() => handleAnswerSelect('style', option)}
                        className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                          selectedAnswers.style === option 
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                            : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleCustomAnswer('style')}
                      className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                        selectedAnswers.style === 'custom' 
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                          : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                      }`}
                    >
                      ✏️ Custom
                    </button>
                  </div>
                  {showCustomInput.style && (
                    <input
                      type="text"
                      placeholder="e.g., minimalist, storytelling, data-driven..."
                      value={customAnswers.style || ''}
                      onChange={(e) => handleCustomInputChange('style', e.target.value)}
                      className="w-full mt-3 p-4 border-2 border-yellow-300 rounded-xl focus:border-yellow-500 outline-none text-base"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">5. Any special focus?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['SEO Optimized', 'Easy to Read', 'Action-Oriented'].map((option) => (
                      <button 
                        key={option}
                        onClick={() => handleAnswerSelect('focus', option)}
                        className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                          selectedAnswers.focus === option 
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                            : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleCustomAnswer('focus')}
                      className={`p-4 border-2 rounded-xl transition-all text-base font-medium cursor-pointer ${
                        selectedAnswers.focus === 'custom' 
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-800' 
                          : 'bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                      }`}
                    >
                      ✏️ Custom
                    </button>
                  </div>
                  {showCustomInput.focus && (
                    <input
                      type="text"
                      placeholder="e.g., conversion-focused, educational, entertaining..."
                      value={customAnswers.focus || ''}
                      onChange={(e) => handleCustomInputChange('focus', e.target.value)}
                      className="w-full mt-3 p-4 border-2 border-yellow-300 rounded-xl focus:border-yellow-500 outline-none text-base"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleWorkspaceGenerate}
          disabled={selectedLaziness === 'regular-lazy' && answeredQuestions < 5}
          className={`w-full py-4 text-white text-xl font-bold rounded-2xl transform hover:scale-105 transition-all shadow-lg flex items-center justify-center space-x-2 ${
            selectedLaziness === 'regular-lazy' && answeredQuestions < 5
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600'
          }`}
        >
          <Sparkles className="w-6 h-6" />
          <span>
            {selectedLaziness === 'regular-lazy' && answeredQuestions < 5
              ? `Answer ${5 - answeredQuestions} more questions! 🦥` 
              : 'Work Your Sloth Magic! ✨'
            }
          </span>
        </button>
      </div>
    </div>

    {/* Loading Overlay */}
    {isGenerating && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Sloth is thinking... 💭</h3>
          <p className="text-gray-600 mb-4">{slothMessage}</p>
          
          <div className="flex justify-center space-x-2">
            {['💤', '😴', '🦥'].map((emoji, i) => (
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

// Move ResultsView outside main component
const ResultsView = ({ 
  userPrompt, 
  generatedPrompt, 
  slothMessage, 
  selectedTweak, 
  setSelectedTweak, 
  handleTweakConfirm, 
  isGenerating, 
  setCurrentView,
  setUserPrompt,
  setSelectedAnswers,
  setCustomAnswers,
  setShowCustomInput,
  setAnsweredQuestions
}) => (
  <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
    <div className="max-w-4xl mx-auto pt-8">
      <button 
        onClick={() => setCurrentView('home')}
        className="mb-6 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🦥 Ta-da! 🎉</h2>
        <p className="text-xl text-gray-600">Your lazy prompt just became a masterpiece!</p>
      </div>

      {/* Sloth Celebration */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-8 relative max-w-2xl mx-auto">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full"></div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-2">{slothMessage}</p>
          <p className="text-sm text-gray-500 italic">
            "We just turned 'meh' into 'WOW!' without breaking a sweat! 🦥✨"
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enhanced Prompt */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4">
              <h3 className="text-white text-xl font-bold flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Your Supercharged Prompt! ⚡
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-2xl p-4 font-mono text-sm leading-relaxed mb-4 max-h-80 overflow-y-auto border-2 border-gray-200">
                {generatedPrompt}
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors font-medium shadow-md"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Magic! ✨</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-md">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors font-medium shadow-md">
                  <Star className="w-4 h-4" />
                  <span>Save to Favorites</span>
                </button>
              </div>
            </div>
          </div>

          {/* Before/After */}
          <div className="bg-white rounded-3xl shadow-xl mt-6 p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Look at this transformation! 🦋</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-3">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Before (Meh... 😑)</span>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <p className="text-gray-700 text-center">{userPrompt}</p>
                </div>
              </div>
              <div>
                <div className="text-center mb-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">After (Amazing! 🤩)</span>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                  <p className="text-gray-700 text-center text-sm">
                    Professional prompt with persona, structure, requirements, and specific instructions...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Tweaks */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-purple-500" />
              Lazy Tweaks 🔧
            </h4>
            <div className="space-y-3">
              {['Make it funnier 😄', 'Add more details 📝', 'Make it shorter ✂️', 'More professional 👔'].map((tweak) => (
                <button
                  key={tweak}
                  onClick={() => setSelectedTweak(tweak)}
                  className={`w-full text-left p-3 rounded-xl transition-colors border-2 font-medium ${
                    selectedTweak === tweak
                      ? 'bg-purple-50 border-purple-300 text-purple-800'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700'
                  }`}
                >
                  <div className="text-sm">{tweak}</div>
                </button>
              ))}
            </div>
            
            {/* Confirmation Button */}
            {selectedTweak && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleTweakConfirm}
                  className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-600 transform hover:scale-105 transition-all shadow-md"
                >
                  Apply "{selectedTweak}" ✨
                </button>
                <button
                  onClick={() => setSelectedTweak(null)}
                  className="w-full mt-2 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">Sloth Stats 📊</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Laziness Score</span>
                <span className="font-bold text-green-600">Perfect! 🦥</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prompt Quality</span>
                <span className="font-bold text-blue-600">+500% ⚡</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Effort Used</span>
                <span className="font-bold text-purple-600">Nearly Zero 😴</span>
              </div>
            </div>
          </div>

          {/* Create Another */}
          <button 
            onClick={() => {
              setUserPrompt('');
              setSelectedAnswers({});
              setCustomAnswers({});
              setShowCustomInput({});
              setAnsweredQuestions(0);
              setCurrentView('home');
            }}
            className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-lg font-bold rounded-2xl hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Let's Be Lazy Again! 🦥✨
          </button>
        </div>
      </div>
    </div>

    {/* Loading Overlay */}
    {isGenerating && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Sloth is thinking... 💭</h3>
          <p className="text-gray-600 mb-4">{slothMessage}</p>
          
          <div className="flex justify-center space-x-2">
            {['💤', '😴', '🦥'].map((emoji, i) => (
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

const SlothPromptBoost = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedLaziness, setSelectedLaziness] = useState('super-lazy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [slothMood, setSlothMood] = useState('happy');
  const [slothMessage, setSlothMessage] = useState("Hey there, fellow lazy human! 🦥");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [customAnswers, setCustomAnswers] = useState({});
  const [showCustomInput, setShowCustomInput] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [selectedTweak, setSelectedTweak] = useState(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (currentView === 'home') {
      promptTextareaRef.current?.focus();
    }
  }, [currentView]);

  // Memoize the random quote to prevent re-renders
  const randomQuote = useMemo(() => {
    return slothQuotes[Math.floor(Math.random() * slothQuotes.length)];
  }, []); // Empty dependency array means it's calculated once

  // Handler functions
  const handleAnswerSelect = (questionId, answer) => {
    const wasAlreadyAnswered = !!selectedAnswers[questionId];
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    if (answer !== 'custom') {
      setShowCustomInput(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
    
    // Update answered questions count
    if (!wasAlreadyAnswered) {
      setAnsweredQuestions(prev => prev + 1);
    }
  };

  const handleCustomAnswer = (questionId) => {
    const wasAlreadyAnswered = !!selectedAnswers[questionId];
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: 'custom'
    }));
    setShowCustomInput(prev => ({
      ...prev,
      [questionId]: true
    }));
    
    // Update answered questions count
    if (!wasAlreadyAnswered) {
      setAnsweredQuestions(prev => prev + 1);
    }
  };

  const handleCustomInputChange = (questionId, value) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleGenerate = () => {
    if (!userPrompt.trim()) return;
    
    // Check laziness level to determine flow
    if (selectedLaziness === 'regular-lazy') {
      // Go to workspace view for questions
      setCurrentView('workspace');
      return;
    }
    
    // Super lazy users go directly to generation
    setIsGenerating(true);
    setSlothMood('sleepy');
    setSlothMessage("Zzz... let me work my lazy magic... 💤");
    
    setTimeout(() => {
      setGeneratedPrompt(`<persona>You are an expert content creator with deep knowledge in your field</persona>
<content_type>blog post</content_type>
<topic>${userPrompt.toLowerCase()}</topic>
<tone>engaging and informative</tone>
<audience>people interested in learning about this topic</audience>
<structure>
- Compelling introduction that hooks the reader
- 3-5 main sections with clear subheadings
- Practical examples and actionable insights
- Strong conclusion with key takeaways
</structure>
<requirements>
- Write in a conversational yet professional tone
- Include relevant statistics or facts when possible
- Make it scannable with bullet points and short paragraphs
- Aim for 1200-1500 words
- Include a call-to-action at the end
</requirements>`);
      setIsGenerating(false);
      setSlothMood('happy');
      setSlothMessage("Ta-da! 🎉 Look what we created while barely lifting a finger!");
      setCurrentView('results');
    }, 3000);
  };

  const handleWorkspaceGenerate = () => {
    if (!userPrompt.trim()) return;
    
    // Generate prompt with user's answers
    setIsGenerating(true);
    setSlothMood('sleepy');
    setSlothMessage("Zzz... let me work my lazy magic... 💤");
    
    setTimeout(() => {
      setGeneratedPrompt(`<persona>You are an expert content creator with deep knowledge in your field</persona>
<content_type>blog post</content_type>
<topic>${userPrompt.toLowerCase()}</topic>
<tone>engaging and informative</tone>
<audience>people interested in learning about this topic</audience>
<structure>
- Compelling introduction that hooks the reader
- 3-5 main sections with clear subheadings
- Practical examples and actionable insights
- Strong conclusion with key takeaways
</structure>
<requirements>
- Write in a conversational yet professional tone
- Include relevant statistics or facts when possible
- Make it scannable with bullet points and short paragraphs
- Aim for 1200-1500 words
- Include a call-to-action at the end
</requirements>`);
      setIsGenerating(false);
      setSlothMood('happy');
      setSlothMessage("Ta-da! 🎉 Look what we created while barely lifting a finger!");
      setCurrentView('results');
    }, 3000);
  };

  const handleTweakConfirm = () => {
    if (!selectedTweak) return;
    
    setIsGenerating(true);
    setSlothMessage(`Applying "${selectedTweak}" to your prompt... 🦥✨`);
    
    setTimeout(() => {
      // Here you would modify the prompt based on the selected tweak
      let tweakedPrompt = generatedPrompt;
      
      // Add tweak-specific modifications
      if (selectedTweak.includes('funnier')) {
        tweakedPrompt = tweakedPrompt.replace('<tone>engaging and informative</tone>', '<tone>humorous and entertaining</tone>');
      } else if (selectedTweak.includes('details')) {
        tweakedPrompt = tweakedPrompt.replace('3-5 main sections', '5-7 detailed sections with subsections');
      } else if (selectedTweak.includes('shorter')) {
        tweakedPrompt = tweakedPrompt.replace('1200-1500 words', '500-800 words');
      } else if (selectedTweak.includes('professional')) {
        tweakedPrompt = tweakedPrompt.replace('<tone>engaging and informative</tone>', '<tone>professional and authoritative</tone>');
      }
      
      setGeneratedPrompt(tweakedPrompt);
      setIsGenerating(false);
      setSelectedTweak(null);
      setSlothMessage("Boom! Your prompt just got even lazier! 🎉");
    }, 2000);
  };

  // Simple Emoji Progress Component (unused but kept for potential future use)
  const SimpleSlothProgress = ({ progress = 0 }) => {
    const answeredCount = Math.floor(progress * 5);
    
    const getSlothMood = () => {
      if (answeredCount === 0) return "🦥";
      if (answeredCount === 1) return "😊";
      if (answeredCount === 2) return "😋";
      if (answeredCount === 3) return "🤤";
      if (answeredCount === 4) return "😌";
      return "😴";
    };
    
    const getMessage = () => {
      if (answeredCount === 0) return "Ready to start!";
      if (answeredCount === 1) return "Great start!";
      if (answeredCount === 2) return "Getting there...";
      if (answeredCount === 3) return "Almost done!";
      if (answeredCount === 4) return "One more!";
      return "Perfect! All done!";
    };
    
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200 text-center">
        {/* Main sloth emoji */}
        <div className="text-6xl mb-3">
          {getSlothMood()}
        </div>
        
        {/* Progress dots with leaf emojis */}
        <div className="flex justify-center space-x-2 mb-3">
          {[...Array(5)].map((_, index) => (
            <span key={index} className="text-2xl">
              {index < answeredCount ? "🌿" : "🍃"}
            </span>
          ))}
        </div>
        
        {/* Progress text */}
        <p className="text-lg font-semibold text-gray-700 mb-1">
          {getMessage()}
        </p>
        <p className="text-sm text-gray-500">
          {answeredCount}/5 questions answered
        </p>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {currentView === 'home' && (
        <HomeView 
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          selectedLaziness={selectedLaziness}
          setSelectedLaziness={setSelectedLaziness}
          slothMessage={slothMessage}
          setSlothMessage={setSlothMessage}
          handleGenerate={handleGenerate}
          isGenerating={isGenerating}
          promptTextareaRef={promptTextareaRef}
          randomQuote={randomQuote}
        />
      )}
      {currentView === 'workspace' && (
        <WorkspaceView 
          userPrompt={userPrompt}
          selectedLaziness={selectedLaziness}
          selectedAnswers={selectedAnswers}
          setSelectedAnswers={setSelectedAnswers}
          customAnswers={customAnswers}
          setCustomAnswers={setCustomAnswers}
          showCustomInput={showCustomInput}
          setShowCustomInput={setShowCustomInput}
          answeredQuestions={answeredQuestions}
          setAnsweredQuestions={setAnsweredQuestions}
          handleAnswerSelect={handleAnswerSelect}
          handleCustomAnswer={handleCustomAnswer}
          handleCustomInputChange={handleCustomInputChange}
          handleWorkspaceGenerate={handleWorkspaceGenerate}
          isGenerating={isGenerating}
          slothMessage={slothMessage}
          setCurrentView={setCurrentView}
        />
      )}
      {currentView === 'results' && (
        <ResultsView 
          userPrompt={userPrompt}
          generatedPrompt={generatedPrompt}
          slothMessage={slothMessage}
          selectedTweak={selectedTweak}
          setSelectedTweak={setSelectedTweak}
          handleTweakConfirm={handleTweakConfirm}
          isGenerating={isGenerating}
          setCurrentView={setCurrentView}
          setUserPrompt={setUserPrompt}
          setSelectedAnswers={setSelectedAnswers}
          setCustomAnswers={setCustomAnswers}
          setShowCustomInput={setShowCustomInput}
          setAnsweredQuestions={setAnsweredQuestions}
        />
      )}
    </div>
  );
};

export default SlothPromptBoost;