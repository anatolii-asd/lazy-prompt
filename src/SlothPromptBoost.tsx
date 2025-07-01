import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Zap, Copy, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { promptService, PromptWithVersions, EnhancePromptRequest, LazyTweak, RoundQuestion } from './lib/promptService';
import ProfileDropdown from './components/ProfileDropdown';
import PromptHistory from './components/PromptHistory';
import NotificationToast from './components/NotificationToast';

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
          WizardBoost
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
            🧙‍♂️ WizardBoost
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

          {/* How it works */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">How it works 🎯</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">1️⃣</div>
                <p className="text-sm text-gray-600">Answer 6 basic questions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">2️⃣</div>
                <p className="text-sm text-gray-600">Review & optionally refine</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">3️⃣</div>
                <p className="text-sm text-gray-600">Get your perfect prompt!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleGenerate}
            disabled={!userPrompt.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold py-4 px-12 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin mr-3">🧙‍♂️</div>
                Getting ready...
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
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
  userPrompt, 
  generatedPrompt, 
  wizardMessage, 
  selectedTweak, 
  setSelectedTweak, 
  handleTweakConfirm, 
  isGenerating, 
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
  user,
  availableTweaks
}: any) => {
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enhanced Prompt */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4">
              <h3 className="text-white text-xl font-bold flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Your Amazing Prompt ✨
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-2xl p-4 font-mono text-sm leading-relaxed mb-4 max-h-80 overflow-y-auto border-2 border-gray-200">
                {generatedPrompt}
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors font-medium shadow-md"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Magic! ✨</span>
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

          {/* Version History */}
          {savedPromptId && versionHistory.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl mt-6 p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                📚 Version History 
                <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {versionHistory.length} versions
                </span>
              </h4>
              
              {loadingVersions ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading versions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versionHistory.map((version, index) => (
                    <div key={version.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            Version {version.version}
                          </span>
                          {index === 0 && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(version.created_at)}</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Original Input:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            {truncateText(version.original_input, 120)}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Generated Prompt:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            {truncateText(version.generated_prompt, 120)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Tweaks */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-purple-500" />
              Magical Enhancements 🔧
            </h4>
            <div className="space-y-3">
              {(availableTweaks && availableTweaks.length > 0 ? availableTweaks : [
                { name: 'Make it funnier', emoji: '😄', description: 'Add humor and wit' },
                { name: 'Add more details', emoji: '📝', description: 'Include more specifics' },
                { name: 'Make it shorter', emoji: '✂️', description: 'Keep it concise' },
                { name: 'More professional', emoji: '👔', description: 'Formal tone' }
              ]).map((tweak: LazyTweak) => {
                const displayName = `${tweak.name} ${tweak.emoji}`;
                return (
                  <button
                    key={tweak.name}
                    onClick={() => setSelectedTweak(displayName)}
                    className={`w-full text-left p-3 rounded-xl transition-colors border-2 font-medium ${
                      selectedTweak === displayName
                        ? 'bg-purple-50 border-purple-300 text-purple-800'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{displayName}</div>
                    <div className="text-xs text-gray-500 mt-1">{tweak.description}</div>
                  </button>
                );
              })}
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
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">Wizard Stats 📊</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Wisdom Level</span>
                <span className="font-bold text-green-600">Legendary! 🧙‍♂️</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prompt Quality</span>
                <span className="font-bold text-blue-600">+500% ⚡</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Magic Used</span>
                <span className="font-bold text-purple-600">Infinite Power 🌟</span>
              </div>
            </div>
          </div>

          {/* Create Another */}
          <button 
            onClick={() => {
              setUserPrompt('');
              setCurrentRound(1);
              setRoundQuestions([]);
              setTopicAnswers({});
              setDetectedLanguage('en');
              setPreliminaryPrompt('');
              setPreliminaryRound(1);
              setPreliminaryScore({laziness: 0, quality: 0});
              setCurrentView('home');
            }}
            className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-lg font-bold rounded-2xl hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Seek More Wisdom! 🧙‍♂️✨
          </button>
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
  userPrompt,
  currentRound,
  roundQuestions,
  topicAnswers,
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


const SlothPromptBoost = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [wizardMessage, setWizardMessage] = useState("Let us weave magic into your words! 🧙‍♂️");
  const [selectedTweak, setSelectedTweak] = useState<string | null>(null);
  const [promptCount, setPromptCount] = useState(0);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });
  const [availableTweaks, setAvailableTweaks] = useState<LazyTweak[]>([]);
  
  // Three-round mode state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundQuestions, setRoundQuestions] = useState<RoundQuestion[]>([]);
  const [topicAnswers, setTopicAnswers] = useState<Record<string, string>>({});
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [preliminaryPrompt, setPreliminaryPrompt] = useState<string>('');
  const [preliminaryRound, setPreliminaryRound] = useState<number>(1);
  const [preliminaryScore, setPreliminaryScore] = useState<{laziness: number; quality: number}>({laziness: 0, quality: 0});
  
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

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleSavePrompt = async () => {
    if (!user || !generatedPrompt) return;

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
      await loadPromptCount(); // Refresh count
      showNotification('Prompt saved successfully! 🎉', 'success');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      showNotification('Failed to save prompt. Please try again.', 'error');
    } finally {
    }
  };

  const handleLoadPrompt = (prompt: PromptWithVersions) => {
    setUserPrompt(prompt.original_input);
    setGeneratedPrompt(prompt.generated_prompt);
    setSavedPromptId(prompt.parent_id || prompt.id);
    setCurrentView('results');
    showNotification('Prompt loaded successfully!', 'success');
  };


  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;
    
    // Start three-round questioning
    setIsGenerating(true);
    setWizardMessage("Let me ask you 6 smart questions to create the perfect prompt... 🎯");
    setCurrentRound(1);
    setTopicAnswers({});
    
    try {
      const request: EnhancePromptRequest = {
        user_input: userPrompt,
        mode: 'three_round',
        round: 1
      };

      const { data, error } = await promptService.enhancePrompt(request);
      
      if (error) {
        const errorMessage = typeof error.message === 'string' 
          ? error.message 
          : (error.message ? JSON.stringify(error.message) : 'Failed to generate questions');
        throw new Error(errorMessage);
      }

      if (data?.round_questions) {
        setRoundQuestions(data.round_questions);
        setDetectedLanguage(data.detected_language || 'en');
        setCurrentView('three-round');
        setWizardMessage("Round 1: Let's clarify the basics! 🎯");
      } else {
        throw new Error('No questions received');
      }
    } catch (error) {
      console.error('Failed to start questions:', error);
      showNotification('Failed to start questions. Please try again.', 'error');
      setWizardMessage("Hmm, even sloths need coffee sometimes. Try again? ☕");
    } finally {
      setIsGenerating(false);
    }
  };


  const handleTweakConfirm = () => {
    if (!selectedTweak) return;
    
    setIsGenerating(true);
    setWizardMessage(`Making it ${selectedTweak.toLowerCase()}... because you asked so nicely! 😊`);
    
    // Simulate API call for tweaking
    setTimeout(() => {
      let tweakedPrompt = generatedPrompt;
      
      if (selectedTweak.includes('funnier')) {
        tweakedPrompt += "\n\nAdditional note: Please incorporate humor and wit throughout your response. Use appropriate jokes, puns, or lighthearted examples to make the content engaging and memorable.";
      } else if (selectedTweak.includes('details')) {
        tweakedPrompt += "\n\nAdditional note: Provide extensive detail, examples, and explanations. Include step-by-step instructions, specific examples, and comprehensive coverage of the topic.";
      } else if (selectedTweak.includes('shorter')) {
        tweakedPrompt += "\n\nAdditional note: Keep your response concise and to the point. Focus on the most essential information and avoid unnecessary elaboration.";
      } else if (selectedTweak.includes('professional')) {
        tweakedPrompt += "\n\nAdditional note: Maintain a highly professional tone throughout. Use formal language, industry terminology, and structure your response in a business-appropriate format.";
      }
      
      setGeneratedPrompt(tweakedPrompt);
      setIsGenerating(false);
      setSelectedTweak(null);
      setWizardMessage("Boom! Your prompt just got even lazier! 🎉");
    }, 2000);
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
      showNotification('Failed to generate preliminary result. Please try again.', 'error');
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
        showNotification('Failed to continue. Please try again.', 'error');
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
    setAvailableTweaks([]);
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

      {/* Notification Toast */}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

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
          userPrompt={userPrompt}
          generatedPrompt={generatedPrompt}
          wizardMessage={wizardMessage}
          selectedTweak={selectedTweak}
          setSelectedTweak={setSelectedTweak}
          handleTweakConfirm={handleTweakConfirm}
          isGenerating={isGenerating}
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
          user={user}
          availableTweaks={availableTweaks}
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