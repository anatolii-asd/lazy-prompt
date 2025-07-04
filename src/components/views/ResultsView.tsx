import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy } from 'lucide-react';
import { ResultsViewProps } from '../types';
import { promptService } from '../../lib/promptService';

const ResultsView: React.FC<ResultsViewProps> = ({
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
}) => {
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


  // Calculate iteration number based on improvedVersions from parent
  const iterationNumber = improvedVersions && improvedVersions.length > 0 ? 
    improvedVersions.length + 1 : 
    (savedPromptId && versionHistory.length > 0 ? versionHistory.length : 1);

  return (
  <div className="min-h-screen bg-forest-gradient p-4 pt-20 relative forest-sparkles">
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => setCurrentView('home')}
        className="mb-6 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-wizard-enchanted-shadow mb-2">🧙‍♂️ Behold! 🎉</h2>
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
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-wizard-forest-mist animate-magical-glow relative z-10">
          <h3 className="text-2xl font-bold text-wizard-enchanted-shadow mb-6 flex items-center justify-center">
            🔮Your Enchanted Prompt💫
          </h3>
          
          {/* Editable prompt area */}
          <textarea
            value={generatedPrompt}
            onChange={(e) => {
              setGeneratedPrompt(e.target.value);
              setShowSaveSuccess(false);
            }}
            className="w-full h-40 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-wizard-primary focus:ring-4 focus:ring-wizard-forest-mist outline-none transition-all text-gray-700 placeholder-gray-400 mb-4"
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
                      ? 'bg-wizard-primary-dark text-white transform scale-105' 
                      : 'bg-wizard-primary text-white hover:bg-wizard-primary-dark'
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
                      ? 'bg-wizard-primary-light text-white transform scale-105' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span>
                    {isSaving ? 'Saving...' : showSaveSuccess ? '✨ Saved!' : 'Save'}
                  </span>
                </button>
              </div>
        </div>
          
        {/* Improve Further Button */}
          <div className="bg-white rounded-3xl shadow-xl mt-6 p-6">
            <button 
              onClick={handleContinueImprovement}
              disabled={isImproving || currentIteration >= 5}
              className="w-full bg-emerald-magic text-white text-base sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-12 rounded-2xl hover:bg-wizard-primary-dark transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              🌱 Start Over 🌲
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
                    <span className="ml-2 text-sm bg-wizard-forest-mist text-wizard-primary-dark px-2 py-1 rounded-full">
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
                    <div className="px-6 pb-6 border-t border-wizard-forest-mist">
                  {loadingVersions ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-wizard-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading versions...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-4">
                      {versionHistory.map((version) => (
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
                              <span className="bg-wizard-forest-mist text-wizard-primary-dark px-2 py-1 rounded-full text-xs font-medium">
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
                            className="overflow-hidden border-t border-wizard-forest-mist"
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

      {/* Loading Overlay */}
      {isGenerating && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl animate-magical-glow border-2 border-wizard-forest-mist">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Wizard is casting... 💭</h3>
          <p className="text-gray-600 mb-4">{wizardMessage}</p>
          
          <div className="flex justify-center space-x-2">
            {['🌲', '✨', '🧙‍♂️'].map((emoji, i) => (
              <div
                key={i}
                className={`text-2xl transition-all duration-500 animate-forest-sway ${
                  Math.floor(Date.now() / 500) % 3 === i ? 'animate-sparkle' : 'opacity-50'
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

export default ResultsView;