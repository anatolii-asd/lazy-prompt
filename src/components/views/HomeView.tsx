import React from 'react';
import { Sparkles } from 'lucide-react';
import { HomeViewProps } from '../types';

const HomeView: React.FC<HomeViewProps> = ({
  userPrompt,
  setUserPrompt,
  handleGenerate,
  isGenerating,
  promptTextareaRef,
  randomQuote
}) => {
  return (
    <div className="min-h-screen bg-forest-gradient p-4 pt-20 relative forest-sparkles">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="hidden sm:block text-4xl font-bold text-wizard-enchanted-shadow mb-2">
            🧙‍♂️ Prompt Wizard III
          </h1>
          <p className="hidden sm:block text-xl text-gray-600 mb-4">Where wisdom meets your creative prompts</p>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-gray-200">
            <p className="text-gray-700 italic">"{randomQuote}"</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-wizard-forest-mist animate-magical-glow relative z-10">
            <h2 className="text-2xl font-bold text-wizard-enchanted-shadow mb-6 flex items-center justify-center">
              <Sparkles className="w-7 h-7 mr-3 text-yellow-500" />
              What's your prompt idea?
            </h2>
            
            <textarea
              ref={promptTextareaRef}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Type something like: 'help me write an email' or 'create a workout plan' or literally anything..."
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-wizard-primary focus:ring-4 focus:ring-wizard-forest-mist outline-none transition-all text-gray-700 placeholder-gray-400"
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
            className="bg-emerald-magic text-white text-base sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-12 rounded-2xl hover:bg-wizard-primary-dark transform hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

export default HomeView;