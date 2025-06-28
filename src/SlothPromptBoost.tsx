import { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Zap, Copy, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { promptService, PromptWithVersions } from './lib/promptService';
import ProfileDropdown from './components/ProfileDropdown';
import PromptHistory from './components/PromptHistory';
import NotificationToast from './components/NotificationToast';

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

// Header component for the app
const Header = ({ promptCount, onShowHistory }: { promptCount: number; onShowHistory: () => void }) => (
  <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
    <div className="max-w-4xl mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🦥</span>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          SlothBoost
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
  selectedLaziness, 
  setSelectedLaziness, 
  slothMessage, 
  setSlothMessage, 
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
            🦥 SlothBoost
          </h1>
          <p className="text-xl text-gray-600 mb-4">The laziest way to create amazing prompts</p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-gray-200">
            <p className="text-gray-700 italic">"{randomQuote}"</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Prompt Input */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Sparkles className="w-7 h-7 mr-3 text-yellow-500" />
                What's your lazy prompt idea?
              </h2>
              
              <textarea
                ref={promptTextareaRef}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Type something like: 'help me write an email' or 'create a workout plan' or literally anything..."
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-700 placeholder-gray-400"
              />
              
              <div className="mt-4 text-sm text-gray-500 text-center">
                💡 Pro tip: The vaguer, the lazier, the better! We'll handle the details.
              </div>
            </div>
          </div>

          {/* Right Column - Laziness Level */}
          <div>
            <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-500" />
                Pick Your Laziness Level
              </h3>
              
              <div className="space-y-4">
                {lazinessLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setSelectedLaziness(level.id);
                      setSlothMessage(level.slothSays);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedLaziness === level.id
                        ? 'bg-purple-50 border-purple-300 shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{level.icon}</span>
                      <span className="font-semibold text-gray-800">{level.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sloth Response */}
        {slothMessage && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg relative border border-gray-200">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full border border-gray-200"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full border border-gray-200"></div>
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-2">{slothMessage}</p>
                <div className="text-4xl">🦥</div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleGenerate}
            disabled={!userPrompt.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold py-4 px-12 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin mr-3">🦥</div>
                Being Supremely Lazy...
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
                Make It Amazing (Lazily)! ✨
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkspaceView = ({ 
  selectedAnswers, 
  customAnswers, 
  showCustomInput, 
  answeredQuestions, 
  handleAnswerSelect, 
  handleCustomAnswer, 
  handleCustomInputChange, 
  handleWorkspaceGenerate, 
  isGenerating, 
  slothMessage, 
  setCurrentView 
}: any) => {
  const questions = [
    {
      id: 'audience',
      question: "Who's this for? 🎯",
      options: ['My boss 💼', 'My team 👥', 'General public 🌍', 'Just me 😊'],
      placeholder: 'e.g., college students, dog owners, etc.'
    },
    {
      id: 'tone',
      question: "What vibe are we going for? 🎭",
      options: ['Professional 👔', 'Casual & fun 🎉', 'Serious & formal 📋', 'Creative & quirky 🎨'],
      placeholder: 'e.g., friendly but authoritative, humorous, etc.'
    },
    {
      id: 'length',
      question: "How long should this be? 📏",
      options: ['Short & sweet 🍬', 'Medium length 📄', 'Detailed & thorough 📚', 'Whatever works 🤷'],
      placeholder: 'e.g., 2 paragraphs, bullet points, one page, etc.'
    },
    {
      id: 'goal',
      question: "What's the main goal here? 🎯",
      options: ['Inform & educate 📖', 'Persuade & convince 💪', 'Entertain & engage 🎭', 'Solve a problem 🔧'],
      placeholder: 'e.g., get people to sign up, explain a concept, etc.'
    },
    {
      id: 'extra',
      question: "Anything else we should know? 🤔",
      options: ['Include examples 💡', 'Add call-to-action 📢', 'Make it SEO-friendly 🔍', 'Keep it simple 🌿'],
      placeholder: 'e.g., mention our company values, include pricing, etc.'
    }
  ];

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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🦥 5 Lazy Questions</h2>
          <p className="text-xl text-gray-600">Answer these and we'll do the heavy lifting!</p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto mt-4 border border-gray-200">
            <p className="text-gray-700 italic">"{slothMessage}"</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < answeredQuestions ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-600 mt-2">
            {answeredQuestions}/5 questions answered
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{q.question}</h3>
              
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {q.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(q.id, option)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${
                      selectedAnswers[q.id] === option
                        ? 'bg-purple-50 border-purple-300 text-purple-800'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCustomAnswer(q.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-colors ${
                  selectedAnswers[q.id] === 'custom'
                    ? 'bg-purple-50 border-purple-300 text-purple-800'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700'
                }`}
              >
                ✨ Something else (custom)
              </button>

              {showCustomInput[q.id] && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customAnswers[q.id] || ''}
                    onChange={(e) => handleCustomInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full p-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleWorkspaceGenerate}
            disabled={answeredQuestions < 3 || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold py-4 px-12 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin mr-3">🦥</div>
                Crafting Your Masterpiece...
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
                Create My Amazing Prompt! ✨
              </div>
            )}
          </button>
          {answeredQuestions < 3 && (
            <p className="text-sm text-gray-500 mt-2">Answer at least 3 questions to continue</p>
          )}
        </div>
      </div>
    </div>
  );
};

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
  setAnsweredQuestions,
  savedPromptId,
  user
}: any) => {
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Load version history when component mounts or savedPromptId changes
  useEffect(() => {
    const loadVersionHistory = async () => {
      if (!savedPromptId || !user) return;
      
      setLoadingVersions(true);
      try {
        const { data, error } = await promptService.getPromptVersions(savedPromptId);
        if (error) throw error;
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
          {versionHistory.length > 1 && (
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
};

const SlothPromptBoost = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedLaziness, setSelectedLaziness] = useState('super-lazy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [slothMessage, setSlothMessage] = useState("Hey there, fellow lazy human! 🦥");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [selectedTweak, setSelectedTweak] = useState<string | null>(null);
  const [promptCount, setPromptCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });
  
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
    return slothQuotes[Math.floor(Math.random() * slothQuotes.length)];
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

    setSaving(true);
    try {
      const promptData = {
        originalInput: userPrompt,
        generatedPrompt,
        lazinessLevel: selectedLaziness === 'super-lazy' ? 'super_duper' as const : 'regular' as const,
        questionsData: Object.keys(selectedAnswers).length > 0 ? {
          selectedAnswers,
          customAnswers
        } : null,
        parentId: savedPromptId, // For refinements
        version: savedPromptId ? undefined : 1 // Will be calculated by service for refinements
      };

      const { data, error } = await promptService.savePrompt(user, promptData);
      
      if (error) throw error;

      setSavedPromptId(data?.parent_id || data?.id || null);
      await loadPromptCount(); // Refresh count
      showNotification('Prompt saved successfully! 🎉', 'success');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      showNotification('Failed to save prompt. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPrompt = (prompt: PromptWithVersions) => {
    setUserPrompt(prompt.original_input);
    setGeneratedPrompt(prompt.generated_prompt);
    setSelectedLaziness(prompt.laziness_level === 'super_duper' ? 'super-lazy' : 'regular-lazy');
    setSavedPromptId(prompt.parent_id || prompt.id);
    
    // Load questions data if available
    if (prompt.questions_data) {
      setSelectedAnswers(prompt.questions_data.selectedAnswers || {});
      setCustomAnswers(prompt.questions_data.customAnswers || {});
    }
    
    setCurrentView('results');
    showNotification('Prompt loaded successfully!', 'success');
  };

  // Handler functions
  const handleAnswerSelect = (questionId: string, answer: string) => {
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

  const handleCustomAnswer = (questionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: 'custom'
    }));
    setShowCustomInput(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  const handleCustomInputChange = (questionId: string, value: string) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleGenerate = () => {
    if (!userPrompt.trim()) return;
    
    // Check laziness level to determine flow
    if (selectedLaziness === 'regular-lazy') {
      // Go to workspace for 5 questions
      setCurrentView('workspace');
      return;
    }
    
    // Super lazy mode - generate directly
    setIsGenerating(true);
    setSavedPromptId(null); // Reset for new prompt
    setSlothMessage("Sprinkling some lazy magic... ✨");
    
    // Simulate API call
    setTimeout(() => {
      const mockPrompt = `You are a professional ${userPrompt.includes('email') ? 'email' : 'content'} expert. Your task is to create a ${userPrompt.toLowerCase()}. 

Please follow these guidelines:
- Be clear and concise
- Use a professional yet approachable tone
- Include specific examples where relevant
- Structure the content logically
- Ensure the output meets the user's specific needs

Context: ${userPrompt}

Please provide a comprehensive and well-structured response that addresses all aspects of the request.`;
      
      setGeneratedPrompt(mockPrompt);
      setCurrentView('results');
      setIsGenerating(false);
      setSlothMessage("Boom! Your lazy input just became a masterpiece! 🎉");
    }, 3000);
  };

  const handleWorkspaceGenerate = () => {
    if (answeredQuestions < 3) return;
    
    setIsGenerating(true);
    setSavedPromptId(null); // Reset for new prompt
    setSlothMessage("Combining your answers with our lazy genius... 🧠");
    
    // Simulate API call with answers
    setTimeout(() => {
      const answers = Object.entries(selectedAnswers).map(([key, value]) => {
        if (value === 'custom') {
          return `${key}: ${customAnswers[key] || ''}`;
        }
        return `${key}: ${value}`;
      }).join('\n');
      
      const mockPrompt = `You are a professional content expert. Create a ${userPrompt.toLowerCase()} based on these specific requirements:

${answers}

Please ensure your response:
- Addresses the specific audience and tone requirements
- Follows the desired length and format
- Achieves the stated goal effectively
- Incorporates any additional requirements mentioned

Context: ${userPrompt}

Provide a comprehensive, well-structured response that meets all the specified criteria.`;
      
      setGeneratedPrompt(mockPrompt);
      setCurrentView('results');
      setIsGenerating(false);
      setSlothMessage("Your custom masterpiece is ready! We really outdid ourselves this time! 🏆");
    }, 4000);
  };

  const handleTweakConfirm = () => {
    if (!selectedTweak) return;
    
    setIsGenerating(true);
    setSlothMessage(`Making it ${selectedTweak.toLowerCase()}... because you asked so nicely! 😊`);
    
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
      setSlothMessage("Boom! Your prompt just got even lazier! 🎉");
    }, 2000);
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
          savedPromptId={savedPromptId}
          user={user}
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