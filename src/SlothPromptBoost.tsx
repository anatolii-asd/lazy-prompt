import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import { promptService, PromptWithVersions, EnhancePromptRequest, RoundQuestion, AnalyzePromptResponse } from './lib/promptService';
import ProfileDropdown from './components/ProfileDropdown';
import PromptHistory from './components/PromptHistory';

// Imported View Components
import HomeView from './components/views/HomeView';
import ResultsView from './components/views/ResultsView';
import ThreeRoundView from './components/views/ThreeRoundView';
import PreliminaryResultView from './components/views/PreliminaryResultView';
import IterativeFlowView from './components/views/IterativeFlowView';

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
  const [, setIterativeAnswers] = useState<Record<string, any>[]>([]);
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