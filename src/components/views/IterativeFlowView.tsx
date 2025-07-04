import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { IterativeFlowViewProps } from '../types';
import DynamicQuestionForm from '../forms/DynamicQuestionForm';

const IterativeFlowView: React.FC<IterativeFlowViewProps> = ({
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
}) => {
  if (isLoadingAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-forest-gradient p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-wizard-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-wizard-enchanted-shadow mb-2">Analyzing Your Prompt</h2>
            <p className="text-gray-600">The wizard is examining your prompt and preparing questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-forest-gradient p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-wizard-enchanted-shadow mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Unable to analyze your prompt. Please try again.</p>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-wizard-primary text-white px-6 py-2 rounded-lg hover:bg-wizard-primary-dark"
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
    <div className="min-h-screen bg-gradient-to-br bg-forest-gradient p-4 pt-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-wizard-enchanted-shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="text-sm text-gray-500">
              Iteration {currentIteration} of {maxIterations}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-wizard-enchanted-shadow mb-2">
            🧙‍♂️ The Wizard's Enhancement Chamber
          </h1>
          <p className="text-gray-600 italic mb-3">
            "Answer my mystical inquiries, and I shall weave your words into legendary prompts!"
          </p>
          
          {/* Simple Stats Labels */}
          {analysisResult && (
            <div className="flex gap-4 text-sm">
              <div className="text-gray-700">
                <span className="font-semibold">Prompt Score:</span> <span className="text-wizard-primary font-bold">{analysisResult.score}/100</span>
              </div>
              <div className="text-gray-700">
                <span className="font-semibold">Prompt Rank:</span> <span className="text-wizard-accent font-bold">{analysisResult.score_label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Questions Form */}
        {showingQuestions && analysisResult.suggested_questions && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-wizard-enchanted-shadow mb-4">
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
            <h2 className="text-lg font-semibold text-wizard-enchanted-shadow mb-4">Continue Improving</h2>
            {canContinue ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your prompt has been improved! You can continue refining it with additional iterations.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={onContinueImprovement}
                    disabled={isImproving}
                    className="bg-emerald-magic text-white py-2 px-6 rounded-lg font-medium hover:from-wizard-primary-700 hover:to-wizard-accent-700 disabled:opacity-50"
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
                  className="bg-emerald-magic text-white py-2 px-6 rounded-lg font-medium hover:from-wizard-primary-700 hover:to-wizard-accent-700"
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

export default IterativeFlowView;