import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, ArrowLeft } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { promptService, PromptWithVersions, EnhancePromptRequest, RoundQuestion, AnalyzePromptResponse, QuestionItem } from './lib/promptService';
import ProfileDropdown from './components/ProfileDropdown';
import PromptHistory from './components/PromptHistory';

const wizardQuotes = [
  "Why struggle when magic can guide your way? 🧙‍♂️",
  "Every great prompt begins with a wise question! ✨",
  "Let my wisdom transform your thoughts into power! 🔮",
  "I shall conjure the perfect words for you! 📜",
  "Ancient knowledge meets modern brilliance! 🌟"
];

// Header component for the app
const Header = ({ promptCount, onShowHistory }: { promptCount: number; onShowHistory: () => void }) => (
  <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
    <div className="max-w-4xl mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🧙‍♂️</span>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Prompt Wizard III
        </h1>
      </div>
      <ProfileDropdown promptCount={promptCount} onShowHistory={onShowHistory} />
    </div>
  </div>
);

// Move HomeView outside main component
const HomeView = ({ 
  userPrompt, 
  setUserPrompt, 
  handleGenerate, 
  isGenerating, 
  promptTextareaRef, 
  randomQuote 
}: any) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧙‍♂️ Prompt Wizard III
          </h1>
          <p className="text-xl text-gray-600 mb-4">Where wisdom meets your creative prompts</p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-gray-200">
            <p className="text-gray-700 italic">"{randomQuote}"</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <Sparkles className="w-7 h-7 mr-3 text-yellow-500" />
              What's your prompt idea?
            </h2>
            
            <textarea
              ref={promptTextareaRef}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Type something like: 'help me write an email' or 'create a workout plan' or literally anything..."
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-700 placeholder-gray-400"
            />
            
            <div className="mt-4 text-sm text-gray-500 text-center">
              💡 Pro tip: We'll ask you smart questions to make your prompt perfect!
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleGenerate}
            disabled={!userPrompt.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-12 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin mr-3">🧙‍♂️</div>
                Getting ready...
              </div>
            ) : (
              <div className="flex items-center">
                <div className="mr-2 sm:mr-3 text-xl sm:text-2xl">🧙‍♂️</div>
                Start Creating My Prompt! ✨
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// Move ResultsView outside main component
const ResultsView = ({ 
  generatedPrompt,
  setGeneratedPrompt,
  wizardMessage, 
  isGenerating,
  isImproving,
  setCurrentView,
  setUserPrompt,
  setCurrentRound,
  setRoundQuestions,
  setTopicAnswers,
  setDetectedLanguage,
  setPreliminaryPrompt,
  setPreliminaryRound,
  setPreliminaryScore,
  savedPromptId,
  setSavedPromptId,
  user,
  handleSavePrompt,
  handleContinueImprovement,
  currentIteration,
  setCurrentIteration,
  improvedVersions,
  setImprovedVersions,
  versionHistory,
  setVersionHistory,
  isSaving,
  showSaveSuccess,
  setShowSaveSuccess,
  showCopySuccess,
  setShowCopySuccess,
  setAnalysisResult,
  setUserAnswers,
  setIterativeAnswers,
  setCurrentIterationAnswers,
  setShowingQuestions
}: any) => {
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [isVersionHistoryExpanded, setIsVersionHistoryExpanded] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const toggleVersionExpansion = (versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  // Load version history when component mounts or savedPromptId changes
  useEffect(() => {
    const loadVersionHistory = async () => {
      console.log('Loading version history for savedPromptId:', savedPromptId);
      if (!savedPromptId || !user) return;
      
      setLoadingVersions(true);
      try {
        const { data, error } = await promptService.getPromptVersions(savedPromptId);
        if (error) throw error;
        console.log('Version history loaded:', data);
        setVersionHistory(data || []);
      } catch (err) {
        console.error('Failed to load version history:', err);
      } finally {
        setLoadingVersions(false);
      }
    };

    loadVersionHistory();
  }, [savedPromptId, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Calculate iteration number based on improvedVersions from parent
  const iterationNumber = improvedVersions && improvedVersions.length > 0 ? 
    improvedVersions.length + 1 : 
    (savedPromptId && versionHistory.length > 0 ? versionHistory.length : 1);

  return (
  <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 pt-20">
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => setCurrentView('home')}
        className="mb-6 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🧙‍♂️ Behold! 🎉</h2>
        <p className="text-xl text-gray-600">Your prompt has been enchanted with wisdom!</p>
        <p className="text-lg text-gray-500 mt-2">Iteration {iterationNumber}</p>
      </div>

      {/* Wizard Celebration */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-8 relative max-w-2xl mx-auto">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full"></div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-2">{wizardMessage}</p>
          <p className="text-sm text-gray-500 italic">
            "Witness the transformation of ordinary words into extraordinary magic! 🧙‍♂️✨"
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Enhanced Prompt */}
        <div>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4">
              <h3 className="text-white text-xl font-bold flex items-center">
                🔮Your Enchanted Prompt💫
              </h3>
            </div>
            <div className="p-6">
              {/* Editable prompt area */}
              <textarea
                value={generatedPrompt}
                onChange={(e) => {
                  setGeneratedPrompt(e.target.value);
                  setShowSaveSuccess(false);
                }}
                className="w-full bg-gray-50 rounded-2xl p-4 font-mono text-sm leading-relaxed mb-4 min-h-[300px] max-h-[500px] resize-y border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                placeholder="Your magical prompt will appear here..."
              />
              
              {/* Copy and Save buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={async () => {
                    await navigator.clipboard.writeText(generatedPrompt);
                    setShowCopySuccess(true);
                    setTimeout(() => {
                      setShowCopySuccess(false);
                    }, 2500);
                  }}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium shadow-md transition-all duration-300 ${
                    showCopySuccess 
                      ? 'bg-green-600 text-white transform scale-105' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {showCopySuccess ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>✅ Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={handleSavePrompt}
                  disabled={!user || !generatedPrompt || isSaving}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    showSaveSuccess 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <span>
                    {isSaving ? 'Saving...' : showSaveSuccess ? '✨ Saved!' : 'Save'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Improve Further Button */}
          <div className="bg-white rounded-3xl shadow-xl mt-6 p-6">
            <button 
              onClick={handleContinueImprovement}
              disabled={isImproving || currentIteration >= 5}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-12 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {currentIteration >= 5 ? (
                'Maximum Iterations Reached'
              ) : isImproving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-3">🧙‍♂️</div>
                  Improving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="mr-2 sm:mr-3 text-xl sm:text-2xl">🧙‍♂️</div>
                  Improve Further ✨
                </div>
              )}
            </button>
          </div>
          
          {/* Start New Prompt Button */}
          <div className="bg-white rounded-3xl shadow-xl mt-6 p-6">
            <button 
              onClick={() => {
                // Clear all state before redirecting to home
                setUserPrompt('');
                setCurrentRound(1);
                setRoundQuestions([]);
                setTopicAnswers({});
                setDetectedLanguage('en');
                setPreliminaryPrompt('');
                setPreliminaryRound(1);
                setPreliminaryScore({laziness: 0, quality: 0});
                setGeneratedPrompt('');
                setVersionHistory([]);
                setShowSaveSuccess(false);
                setShowCopySuccess(false);
                
                // Clear saved prompt and iterative improvement state
                setSavedPromptId(null);
                setAnalysisResult(null);
                setUserAnswers({});
                setImprovedVersions([]);
                setCurrentIteration(0);
                setIterativeAnswers([]);
                setCurrentIterationAnswers({});
                setShowingQuestions(true);
                
                // Redirect to home
                setCurrentView('home');
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all font-medium shadow-md"
            >
              🐦‍🔥Start Over 🧚‍♀️
            </button>
          </div>


          {/* Version History */}
          {savedPromptId && versionHistory.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl mt-6 overflow-hidden">
              <button
                onClick={() => setIsVersionHistoryExpanded(!isVersionHistoryExpanded)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-xl font-bold text-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    📜 Version History 
                    <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {versionHistory.length} versions
                    </span>
                  </div>
                  <div className={`transform transition-transform ${isVersionHistoryExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </h4>
              </button>
              
              <AnimatePresence>
                {isVersionHistoryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-gray-100">
                  {loadingVersions ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading versions...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-4">
                      {versionHistory.map((version, index) => (
                    <div key={version.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleVersionExpansion(version.id)}
                        className="w-full p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium">
                              Version {version.version}
                            </span>
                            {version.version === Math.max(...versionHistory.map(v => v.version)) && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{formatDate(version.created_at)}</span>
                            <div className={`transform transition-transform ${expandedVersions.has(version.id) ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedVersions.has(version.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="p-4 bg-gray-50">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Generated Prompt:</h5>
                              <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                                {version.generated_prompt}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                    </div>
                  )}
                </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Loading Overlay */}
    {isGenerating && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Sloth is thinking... 💭</h3>
          <p className="text-gray-600 mb-4">{wizardMessage}</p>
          
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

// Preliminary Result View component
const PreliminaryResultView = ({
  userPrompt: _userPrompt,
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
}: {
  userPrompt: string;
  preliminaryPrompt: string;
  currentRound: number;
  detectedLanguage: string;
  isGenerating: boolean;
  onContinue: () => void;
  onFinish: () => void;
  setCurrentView: (view: string) => void;
  wizardMessage: string;
  lazinessScore: number;
  qualityScore: number;
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

// Three Round View component
const ThreeRoundView = ({
  userPrompt: _userPrompt,
  currentRound,
  roundQuestions,
  topicAnswers: _topicAnswers,
  detectedLanguage,
  isGenerating,
  onRoundComplete,
  setCurrentView,
  wizardMessage
}: {
  userPrompt: string;
  currentRound: number;
  roundQuestions: RoundQuestion[];
  topicAnswers: Record<string, string>;
  detectedLanguage: string;
  isGenerating: boolean;
  onRoundComplete: (answers: Record<string, string>) => void;
  setCurrentView: (view: string) => void;
  wizardMessage: string;
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAnswer, setCustomAnswer] = useState('');

  // Reset question index when round changes or questions change
  React.useEffect(() => {
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

// Simple diff viewer component
const DiffViewer = ({ originalText, newText }: { originalText: string; newText: string }) => {
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <h4 className="font-semibold text-gray-700 mb-2">Changes Made:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-red-600 font-medium mb-1">Previous Version</div>
          <div className="bg-red-50 border border-red-200 rounded p-2 text-sm whitespace-pre-wrap">
            {originalText}
          </div>
        </div>
        <div>
          <div className="text-sm text-green-600 font-medium mb-1">Improved Version</div>
          <div className="bg-green-50 border border-green-200 rounded p-2 text-sm whitespace-pre-wrap">
            {newText}
          </div>
        </div>
      </div>
    </div>
  );
};

// Single question component with sliding animations
const SingleQuestionForm = ({ 
  question,
  questionKey,
  answer,
  questionNumber,
  totalQuestions,
  onAnswerChange,
  onConfirm,
  onSkip,
  isSubmitting
}: {
  question: QuestionItem;
  questionKey: string;
  answer: any;
  questionNumber: number;
  totalQuestions: number;
  onAnswerChange: (answer: any) => void;
  onConfirm: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}) => {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    setLocalAnswer(answer || '');
    // Check if the current answer is a custom value (not in filtered options)
    if (question.type === 'select' && question.options && answer) {
      const filteredOptions = question.options.filter(option => {
        const lowerOption = option.toLowerCase().trim();
        return !lowerOption.includes('other') && 
               !lowerOption.includes('custom') &&
               lowerOption !== 'інше' && 
               lowerOption !== 'власний варіант';
      });
      
      if (!filteredOptions.includes(answer)) {
        setShowCustomInput(true);
        setCustomValue(answer);
      } else {
        setShowCustomInput(false);
        setCustomValue('');
      }
    } else {
      setShowCustomInput(false);
      setCustomValue('');
    }
  }, [answer, question]);

  const handleLocalChange = (value: any) => {
    if (value === '__custom__') {
      setShowCustomInput(true);
      setLocalAnswer('');
    } else {
      setShowCustomInput(false);
      setCustomValue('');
      setLocalAnswer(value);
      onAnswerChange(value);
    }
  };

  const handleCustomInputChange = (value: string) => {
    setCustomValue(value);
    setLocalAnswer(value);
    onAnswerChange(value);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < questionNumber ? 'bg-purple-600' : 
                  i === questionNumber - 1 ? 'bg-purple-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h3>
        
        {question.type === 'textarea' && (
          <textarea
            value={localAnswer}
            onChange={(e) => handleLocalChange(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[120px] text-gray-700"
            placeholder="Enter your answer..."
          />
        )}
        
        {question.type === 'text' && (
          <input
            type="text"
            value={localAnswer}
            onChange={(e) => handleLocalChange(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
            placeholder="Enter your answer..."
          />
        )}
        
        {question.type === 'select' && question.options && (
          <div className="space-y-3">
            {question.options
              .filter(option => {
                // Filter out any variation of "other" or "custom" options
                const lowerOption = option.toLowerCase().trim();
                return !lowerOption.includes('other') && 
                       !lowerOption.includes('custom') &&
                       lowerOption !== 'інше' && // Ukrainian for "other"
                       lowerOption !== 'власний варіант'; // Ukrainian for "custom option"
              })
              .map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={questionKey}
                  value={option}
                  checked={localAnswer === option && !showCustomInput}
                  onChange={(e) => handleLocalChange(e.target.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
            
            {/* Custom option */}
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name={questionKey}
                value="__custom__"
                checked={showCustomInput}
                onChange={(e) => handleLocalChange(e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">✨ Custom answer</span>
            </label>
            
            {/* Custom input field */}
            {showCustomInput && (
              <div className="ml-7 mt-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => handleCustomInputChange(e.target.value)}
                  placeholder="Enter your custom answer..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onSkip}
            disabled={isSubmitting}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Skip Question
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Confirm Answer'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Dynamic question form component with one-by-one display
const DynamicQuestionForm = ({ 
  questions, 
  answers, 
  onAnswerChange, 
  onSubmit, 
  isSubmitting 
}: {
  questions: Record<string, QuestionItem[]>;
  answers: Record<string, any>;
  onAnswerChange: (questionKey: string, answer: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => {
  const allQuestions = [
    ...questions.goals || [],
    ...questions.context || [],
    ...questions.specificity || [],
    ...questions.format || []
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const getQuestionKey = (question: QuestionItem, index: number) => 
    `question_${index}_${question.question.substring(0, 20).replace(/\s+/g, '_')}`;

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentQuestionKey = currentQuestion ? getQuestionKey(currentQuestion, currentQuestionIndex) : '';
  const currentAnswer = answers[currentQuestionKey] || '';

  const handleAnswerChange = (answer: any) => {
    onAnswerChange(currentQuestionKey, answer);
  };

  const handleConfirm = () => {
    if (currentQuestion) {
      setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
      
      if (currentQuestionIndex < allQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered, proceed to improvement
        onSubmit();
      }
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question, proceed to improvement even if skipped
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No questions available</p>
        <button
          onClick={onSubmit}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-lg"
        >
          Continue
        </button>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        <div className="text-sm text-gray-500">
          {answeredQuestions.size} of {allQuestions.length} questions answered
        </div>
      </div>

      {/* Question display with animation */}
      <AnimatePresence mode="wait">
        <SingleQuestionForm
          key={currentQuestionIndex}
          question={currentQuestion}
          questionKey={currentQuestionKey}
          answer={currentAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={allQuestions.length}
          onAnswerChange={handleAnswerChange}
          onConfirm={handleConfirm}
          onSkip={handleSkip}
          isSubmitting={isSubmitting && isLastQuestion}
        />
      </AnimatePresence>

      {/* Summary of answers */}
      {answeredQuestions.size > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Answered Questions:</h4>
          <div className="text-sm text-gray-600">
            {Array.from(answeredQuestions).map(index => {
              const q = allQuestions[index];
              const qKey = getQuestionKey(q, index);
              const ans = answers[qKey];
              return ans ? (
                <div key={index} className="mb-1">
                  <span className="font-medium">Q{index + 1}:</span> {typeof ans === 'string' && ans.length > 50 ? ans.substring(0, 50) + '...' : ans}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// New iterative improvement flow view
const IterativeFlowView = ({
  userPrompt,
  analysisResult,
  userAnswers,
  improvedVersions,
  currentIteration,
  isLoadingAnalysis,
  isImproving,
  onAnswerChange,
  onImprovePrompt,
  onContinueImprovement,
  setCurrentView,
  setGeneratedPrompt,
  showingQuestions,
  currentIterationAnswers
}: {
  userPrompt: string;
  analysisResult: AnalyzePromptResponse | null;
  userAnswers: Record<string, any>;
  improvedVersions: string[];
  currentIteration: number;
  isLoadingAnalysis: boolean;
  isImproving: boolean;
  onAnswerChange: (questionKey: string, answer: any) => void;
  onImprovePrompt: () => void;
  onContinueImprovement: () => void;
  setCurrentView: (view: string) => void;
  setGeneratedPrompt: (prompt: string) => void;
  showingQuestions: boolean;
  currentIterationAnswers: Record<string, any>;
}) => {
  if (isLoadingAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Your Prompt</h2>
            <p className="text-gray-600">The wizard is examining your prompt and preparing questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Unable to analyze your prompt. Please try again.</p>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPrompt = improvedVersions.length > 0 ? improvedVersions[improvedVersions.length - 1] : userPrompt;
  const maxIterations = 5;
  const canContinue = currentIteration < maxIterations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4 pt-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="text-sm text-gray-500">
              Iteration {currentIteration} of {maxIterations}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🧙‍♂️ The Wizard's Enhancement Chamber
          </h1>
          <p className="text-gray-600 italic mb-3">
            "Answer my mystical inquiries, and I shall weave your words into legendary prompts!"
          </p>
          
          {/* Simple Stats Labels */}
          {analysisResult && (
            <div className="flex gap-4 text-sm">
              <div className="text-gray-700">
                <span className="font-semibold">Prompt Score:</span> <span className="text-purple-600 font-bold">{analysisResult.score}/100</span>
              </div>
              <div className="text-gray-700">
                <span className="font-semibold">Prompt Rank:</span> <span className="text-blue-600 font-bold">{analysisResult.score_label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Questions Form */}
        {showingQuestions && analysisResult.suggested_questions && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {currentIteration === 0 
                ? "Answer these questions to improve your prompt" 
                : `Iteration ${currentIteration + 1}: Answer questions for further improvement`
              }
            </h2>
            <DynamicQuestionForm
              questions={analysisResult.suggested_questions}
              answers={currentIteration === 0 ? userAnswers : currentIterationAnswers}
              onAnswerChange={onAnswerChange}
              onSubmit={onImprovePrompt}
              isSubmitting={isImproving}
            />
          </div>
        )}

        {/* Improvement Controls */}
        {currentIteration > 0 && !showingQuestions && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Continue Improving</h2>
            {canContinue ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your prompt has been improved! You can continue refining it with additional iterations.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={onContinueImprovement}
                    disabled={isImproving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    {isImproving ? 'Improving...' : 'Improve More'}
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedPrompt(currentPrompt);
                      setCurrentView('results');
                    }}
                    className="bg-gray-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-700"
                  >
                    Finish & Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  You've reached the maximum number of iterations ({maxIterations}). Further improvement is not possible.
                </p>
                <button
                  onClick={() => {
                    setGeneratedPrompt(currentPrompt);
                    setCurrentView('results');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700"
                >
                  Finish & Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


const SlothPromptBoost = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [wizardMessage, setWizardMessage] = useState("Let us weave magic into your words! 🧙‍♂️");
  const [promptCount, setPromptCount] = useState(0);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  // Three-round mode state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundQuestions, setRoundQuestions] = useState<RoundQuestion[]>([]);
  const [topicAnswers, setTopicAnswers] = useState<Record<string, string>>({});
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [preliminaryPrompt, setPreliminaryPrompt] = useState<string>('');
  const [preliminaryRound, setPreliminaryRound] = useState<number>(1);
  const [preliminaryScore, setPreliminaryScore] = useState<{laziness: number; quality: number}>({laziness: 0, quality: 0});
  
  // Iterative improvement mode state
  const [analysisResult, setAnalysisResult] = useState<AnalyzePromptResponse | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [improvedVersions, setImprovedVersions] = useState<string[]>([]);
  const [currentIteration, setCurrentIteration] = useState<number>(0);
  const [_iterativeAnswers, setIterativeAnswers] = useState<Record<string, any>[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [showingQuestions, setShowingQuestions] = useState<boolean>(true);
  const [currentIterationAnswers, setCurrentIterationAnswers] = useState<Record<string, any>>({});
  
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load prompt count on mount
  useEffect(() => {
    if (user) {
      loadPromptCount();
    }
  }, [user]);

  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (currentView === 'home') {
      promptTextareaRef.current?.focus();
    }
  }, [currentView]);

  // Auto-save prompt when reaching results view
  useEffect(() => {
    if (currentView === 'results' && user && generatedPrompt && !savedPromptId) {
      handleSavePrompt();
    }
  }, [currentView, user, generatedPrompt, savedPromptId]);

  // Memoize the random quote to prevent re-renders
  const randomQuote = useMemo(() => {
    return wizardQuotes[Math.floor(Math.random() * wizardQuotes.length)];
  }, []); // Empty dependency array means it's calculated once

  const loadPromptCount = async () => {
    if (!user) return;
    try {
      const { count } = await promptService.getPromptCount(user);
      setPromptCount(count);
    } catch (error) {
      console.error('Failed to load prompt count:', error);
    }
  };


  const handleSavePrompt = async () => {
    if (!user || !generatedPrompt) return;

    // Check if the current prompt is different from the latest saved version
    if (versionHistory.length > 0) {
      const latestVersion = versionHistory.reduce((latest, current) => 
        current.version > latest.version ? current : latest
      );
      
      if (latestVersion.generated_prompt === generatedPrompt) {
        console.log('No changes detected - prompt is identical to latest version');
        return;
      }
    }

    setIsSaving(true);
    
    try {
      const promptData = {
        originalInput: userPrompt,
        generatedPrompt,
        lazinessLevel: 'regular' as const,
        questionsData: Object.keys(topicAnswers).length > 0 ? {
          topicAnswers
        } : null,
        parentId: savedPromptId, // For refinements
        version: savedPromptId ? undefined : 1 // Will be calculated by service for refinements
      };

      const { data, error } = await promptService.savePrompt(user, promptData);
      
      if (error) throw error;

      // For version history, use parent_id if it exists (for refinements), otherwise use the prompt's own id (for new prompts)
      const promptId = data?.parent_id || data?.id || null;
      setSavedPromptId(promptId);
      console.log('Saved prompt with ID:', promptId, 'Data:', data);
      
      // Trigger success animation
      setIsSaving(false);
      setShowSaveSuccess(true);
      
      // Reload version history
      if (promptId) {
        const { data: versions } = await promptService.getPromptVersions(promptId);
        if (versions) {
          setVersionHistory(versions);
        }
      }
      
      await loadPromptCount(); // Refresh count
      
    } catch (error) {
      console.error('Failed to save prompt:', error);
      setIsSaving(false);
    }
  };

  const handleLoadPrompt = (prompt: PromptWithVersions) => {
    setUserPrompt(prompt.original_input);
    setGeneratedPrompt(prompt.generated_prompt);
    setSavedPromptId(prompt.parent_id || prompt.id);
    setCurrentView('results');
  };


  // New iterative improvement flow handlers
  const handleAnswerChange = (questionKey: string, answer: any) => {
    if (currentIteration === 0) {
      setUserAnswers(prev => ({ ...prev, [questionKey]: answer }));
    } else {
      setCurrentIterationAnswers(prev => ({ ...prev, [questionKey]: answer }));
    }
  };

  const handleImprovePrompt = async () => {
    if (!userPrompt.trim()) return;
    
    setIsImproving(true);
    setWizardMessage("Creating an improved version of your prompt... ✨");
    
    try {
      const answersToUse = currentIteration === 0 ? userAnswers : currentIterationAnswers;
      
      // Build questions_and_answers array with full question text
      const questionsAndAnswers: Array<{question: string, answer: string}> = [];
      
      if (analysisResult?.suggested_questions) {
        const allQuestions = [
          ...analysisResult.suggested_questions.goals || [],
          ...analysisResult.suggested_questions.context || [],
          ...analysisResult.suggested_questions.specificity || [],
          ...analysisResult.suggested_questions.format || []
        ];
        
        allQuestions.forEach((questionObj, index) => {
          const questionKey = `question_${index}_${questionObj.question.substring(0, 20).replace(/\s+/g, '_')}`;
          if (answersToUse[questionKey]) {
            questionsAndAnswers.push({
              question: questionObj.question,
              answer: String(answersToUse[questionKey])
            });
          }
        });
      }
      
      const request = {
        prompt_to_improve: userPrompt,
        questions_and_answers: questionsAndAnswers
      };

      const { data, error } = await promptService.improvePrompt(request);
      
      if (error) {
        throw new Error(error.message || 'Failed to improve prompt');
      }

      if (data?.improved_prompt) {
        setImprovedVersions(prev => [...prev, data.improved_prompt]);
        setCurrentIteration(prev => prev + 1);
        setIterativeAnswers(prev => [...prev, answersToUse]);
        setCurrentIterationAnswers({}); // Reset for next iteration
        setGeneratedPrompt(data.improved_prompt); // Set the improved prompt as generated
        setWizardMessage("Your prompt has been improved! ✨");
        
        // Auto-save the improved prompt to database
        if (user) {
          try {
            const promptData = {
              originalInput: userPrompt,
              generatedPrompt: data.improved_prompt,
              lazinessLevel: 'regular' as const,
              questionsData: null,
              parentId: savedPromptId,
              version: undefined // Will be calculated by service
            };

            const { data: saveData, error: saveError } = await promptService.savePrompt(user, promptData);
            
            if (!saveError && saveData) {
              // Update savedPromptId if this is the first save
              const promptId = saveData.parent_id || saveData.id || null;
              if (!savedPromptId) {
                setSavedPromptId(promptId);
              }
              
              // Refresh version history
              if (promptId) {
                const { data: versions } = await promptService.getPromptVersions(promptId);
                if (versions) {
                  setVersionHistory(versions);
                }
              }
            }
          } catch (saveError) {
            console.error('Failed to auto-save improved prompt:', saveError);
          }
        }
        
        setCurrentView('results'); // Go directly to results page
      } else {
        throw new Error('No improved prompt received');
      }
    } catch (error) {
      console.error('Failed to improve prompt:', error);
      setWizardMessage("Something went wrong with the improvement. Try again? 🔮");
    } finally {
      setIsImproving(false);
    }
  };

  const handleContinueImprovement = async () => {
    if (currentIteration >= 5) return;
    
    setIsImproving(true);
    setIsLoadingAnalysis(true);
    setWizardMessage(`Analyzing your improved prompt for iteration ${currentIteration + 1}... 🔍`);
    
    try {
      // Get the latest version from database
      let currentPrompt = userPrompt;
      
      if (savedPromptId) {
        const { data: versions } = await promptService.getPromptVersions(savedPromptId);
        if (versions && versions.length > 0) {
          // Find the version with the highest version number
          const latestVersion = versions.reduce((latest, current) => 
            current.version > latest.version ? current : latest
          );
          currentPrompt = latestVersion.generated_prompt;
        }
      } else if (improvedVersions.length > 0) {
        // Fallback to in-memory versions if no saved ID
        currentPrompt = improvedVersions[improvedVersions.length - 1];
      }
      
      // Analyze the current improved prompt to get new questions
      const { data, error } = await promptService.analyzePrompt({ prompt: currentPrompt });
      
      if (error) {
        throw new Error(error.message || 'Failed to analyze improved prompt');
      }

      if (data) {
        setAnalysisResult(data);
        setShowingQuestions(true);
        setCurrentIterationAnswers({});
        setCurrentView('iterative'); // Switch back to iterative view
        setWizardMessage(`Iteration ${currentIteration + 1}: Answer new questions based on your improved prompt! 📝`);
        setIsImproving(false);
      } else {
        throw new Error('No analysis data received for improved prompt');
      }
    } catch (error) {
      console.error('Failed to analyze improved prompt:', error);
      setWizardMessage("Failed to generate new questions. Try again? 🧙‍♂️");
    } finally {
      setIsLoadingAnalysis(false);
      setIsImproving(false);
    }
  };

  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;
    
    // Start iterative improvement flow
    setIsGenerating(true);
    setIsLoadingAnalysis(true);
    setWizardMessage("Analyzing your prompt and preparing questions... 🔍");
    
    // Reset state for new session
    setAnalysisResult(null);
    setUserAnswers({});
    setImprovedVersions([]);
    setCurrentIteration(0);
    setIterativeAnswers([]);
    setShowingQuestions(true);
    setCurrentIterationAnswers({});
    
    try {
      const { data, error } = await promptService.analyzePrompt({ prompt: userPrompt });
      
      if (error) {
        throw new Error(error.message || 'Failed to analyze prompt');
      }

      if (data) {
        setAnalysisResult(data);
        setCurrentView('iterative');
        setWizardMessage("Analysis complete! Answer the questions to improve your prompt. 📝");
      } else {
        throw new Error('No analysis data received');
      }
    } catch (error) {
      console.error('Failed to analyze prompt:', error);
      setWizardMessage("Analysis failed. Let's try again? 🧙‍♂️");
    } finally {
      setIsGenerating(false);
      setIsLoadingAnalysis(false);
    }
  };




  const handleRoundComplete = async (answers: Record<string, string>) => {
    const updatedAnswers = { ...topicAnswers, ...answers };
    setTopicAnswers(updatedAnswers);
    
    // First, generate preliminary prompt to show to user
    setIsGenerating(true);
    setWizardMessage(`Generating your preliminary prompt... 🎨`);
    
    try {
      const preliminaryRequest: EnhancePromptRequest = {
        user_input: userPrompt,
        mode: 'three_round',
        round: currentRound,
        topic_answers: updatedAnswers,
        user_language: detectedLanguage,
        generate_preliminary: true
      };

      const { data: preliminaryData, error: preliminaryError } = await promptService.enhancePrompt(preliminaryRequest);
      
      if (preliminaryError) {
        const errorMessage = typeof preliminaryError.message === 'string' 
          ? preliminaryError.message 
          : (preliminaryError.message ? JSON.stringify(preliminaryError.message) : 'Failed to generate preliminary prompt');
        throw new Error(errorMessage);
      }

      if (preliminaryData?.preliminary_prompt) {
        // Show preliminary result view
        setCurrentView('preliminary-result');
        setPreliminaryPrompt(preliminaryData.preliminary_prompt);
        setPreliminaryRound(currentRound);
        setPreliminaryScore({
          laziness: preliminaryData.laziness_score,
          quality: preliminaryData.prompt_quality
        });
      }
    } catch (error) {
      console.error('Failed to generate preliminary prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueToNextRound = async () => {
    if (currentRound < 3) {
      // Move to next round
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setIsGenerating(true);
      setWizardMessage(`Round ${nextRound}: Let's get more specific! 🎯`);
      
      try {
        const request: EnhancePromptRequest = {
          user_input: userPrompt,
          mode: 'three_round',
          round: nextRound,
          topic_answers: topicAnswers,
          user_language: detectedLanguage
        };

        const { data, error } = await promptService.enhancePrompt(request);
        
        if (error) {
          const errorMessage = typeof error.message === 'string' 
            ? error.message 
            : (error.message ? JSON.stringify(error.message) : 'Failed to generate next round questions');
          throw new Error(errorMessage);
        }

        if (data?.round_questions) {
          setRoundQuestions(data.round_questions);
          setCurrentView('three-round');
          setWizardMessage(`Round ${nextRound}: ${nextRound === 2 ? 'Getting deeper!' : 'Final details!'} 🎯`);
        } else {
          throw new Error('No questions received');
        }
      } catch (error) {
        console.error('Failed to get next round questions:', error);
      } finally {
        setIsGenerating(false);
      }
    } else {
      handleFinishWithPreliminary();
    }
  };

  const handleFinishWithPreliminary = () => {
    // Use the preliminary prompt as the final result
    setGeneratedPrompt(preliminaryPrompt);
    setCurrentView('results');
    setSavedPromptId(null);
    setWizardMessage(`Great! Your prompt is ready after ${preliminaryRound} round${preliminaryRound > 1 ? 's' : ''}! 🎉
    
Laziness Score: ${preliminaryScore.laziness}/10 | Quality: ${preliminaryScore.quality}/10`);
  };


  return (
    <div className="font-sans">
      {/* Header - only show when not in history view */}
      {currentView !== 'history' && (
        <Header 
          promptCount={promptCount} 
          onShowHistory={() => setCurrentView('history')} 
        />
      )}


      {currentView === 'home' && (
        <HomeView 
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          handleGenerate={handleGenerate}
          isGenerating={isGenerating}
          promptTextareaRef={promptTextareaRef}
          randomQuote={randomQuote}
        />
      )}
      {currentView === 'results' && (
        <ResultsView 
          generatedPrompt={generatedPrompt}
          setGeneratedPrompt={setGeneratedPrompt}
          wizardMessage={wizardMessage}
          isGenerating={isGenerating}
          isImproving={isImproving}
          setCurrentView={setCurrentView}
          setUserPrompt={setUserPrompt}
          setCurrentRound={setCurrentRound}
          setRoundQuestions={setRoundQuestions}
          setTopicAnswers={setTopicAnswers}
          setDetectedLanguage={setDetectedLanguage}
          setPreliminaryPrompt={setPreliminaryPrompt}
          setPreliminaryRound={setPreliminaryRound}
          setPreliminaryScore={setPreliminaryScore}
          savedPromptId={savedPromptId}
          setSavedPromptId={setSavedPromptId}
          user={user}
          handleSavePrompt={handleSavePrompt}
          handleContinueImprovement={handleContinueImprovement}
          currentIteration={currentIteration}
          setCurrentIteration={setCurrentIteration}
          improvedVersions={improvedVersions}
          setImprovedVersions={setImprovedVersions}
          versionHistory={versionHistory}
          setVersionHistory={setVersionHistory}
          isSaving={isSaving}
          showSaveSuccess={showSaveSuccess}
          setShowSaveSuccess={setShowSaveSuccess}
          showCopySuccess={showCopySuccess}
          setShowCopySuccess={setShowCopySuccess}
          setAnalysisResult={setAnalysisResult}
          setUserAnswers={setUserAnswers}
          setIterativeAnswers={setIterativeAnswers}
          setCurrentIterationAnswers={setCurrentIterationAnswers}
          setShowingQuestions={setShowingQuestions}
        />
      )}
      {currentView === 'three-round' && (
        <ThreeRoundView
          userPrompt={userPrompt}
          currentRound={currentRound}
          roundQuestions={roundQuestions}
          topicAnswers={topicAnswers}
          detectedLanguage={detectedLanguage}
          isGenerating={isGenerating}
          onRoundComplete={handleRoundComplete}
          setCurrentView={setCurrentView}
          wizardMessage={wizardMessage}
        />
      )}
      {currentView === 'preliminary-result' && (
        <PreliminaryResultView
          userPrompt={userPrompt}
          preliminaryPrompt={preliminaryPrompt}
          currentRound={preliminaryRound}
          detectedLanguage={detectedLanguage}
          isGenerating={isGenerating}
          onContinue={handleContinueToNextRound}
          onFinish={handleFinishWithPreliminary}
          setCurrentView={setCurrentView}
          wizardMessage={wizardMessage}
          lazinessScore={preliminaryScore.laziness}
          qualityScore={preliminaryScore.quality}
        />
      )}
      {currentView === 'iterative' && (
        <IterativeFlowView
          userPrompt={userPrompt}
          analysisResult={analysisResult}
          userAnswers={userAnswers}
          improvedVersions={improvedVersions}
          currentIteration={currentIteration}
          isLoadingAnalysis={isLoadingAnalysis}
          isImproving={isImproving}
          onAnswerChange={handleAnswerChange}
          onImprovePrompt={handleImprovePrompt}
          onContinueImprovement={handleContinueImprovement}
          setCurrentView={setCurrentView}
          setGeneratedPrompt={setGeneratedPrompt}
          showingQuestions={showingQuestions}
          currentIterationAnswers={currentIterationAnswers}
          versionHistory={versionHistory}
          setVersionHistory={setVersionHistory}
          isSaving={isSaving}
          showSaveSuccess={showSaveSuccess}
          setShowSaveSuccess={setShowSaveSuccess}
          showCopySuccess={showCopySuccess}
          setShowCopySuccess={setShowCopySuccess}
        />
      )}
      {currentView === 'history' && (
        <PromptHistory
          onBack={() => setCurrentView('home')}
          onLoadPrompt={handleLoadPrompt}
        />
      )}
    </div>
  );
};

export default SlothPromptBoost;