import { AnalyzePromptResponse, RoundQuestion, QuestionItem } from '../lib/promptService';

export interface HomeViewProps {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  handleGenerate: () => void;
  isGenerating: boolean;
  promptTextareaRef: React.RefObject<HTMLTextAreaElement>;
  randomQuote: string;
  language: string;
}

export interface ResultsViewProps {
  generatedPrompt: string;
  setGeneratedPrompt: (prompt: string) => void;
  wizardMessage: string;
  isGenerating: boolean;
  isImproving: boolean;
  setCurrentView: (view: string) => void;
  setUserPrompt: (prompt: string) => void;
  setCurrentRound: (round: number) => void;
  setRoundQuestions: (questions: RoundQuestion[]) => void;
  setTopicAnswers: (answers: Record<string, string>) => void;
  setDetectedLanguage: (lang: string) => void;
  setPreliminaryPrompt: (prompt: string) => void;
  setPreliminaryRound: (round: number) => void;
  setPreliminaryScore: (score: {laziness: number; quality: number}) => void;
  savedPromptId: string | null;
  setSavedPromptId: (id: string | null) => void;
  user: any;
  handleSavePrompt: () => void;
  handleContinueImprovement: () => void;
  currentIteration: number;
  setCurrentIteration: (iteration: number) => void;
  improvedVersions: string[];
  setImprovedVersions: (versions: string[]) => void;
  versionHistory: any[];
  setVersionHistory: (history: any[]) => void;
  isSaving: boolean;
  showSaveSuccess: boolean;
  setShowSaveSuccess: (show: boolean) => void;
  showCopySuccess: boolean;
  setShowCopySuccess: (show: boolean) => void;
  setAnalysisResult: (result: AnalyzePromptResponse | null) => void;
  setUserAnswers: (answers: Record<string, any>) => void;
  setIterativeAnswers: (answers: Record<string, any>[]) => void;
  setCurrentIterationAnswers: (answers: Record<string, any>) => void;
  setShowingQuestions: (showing: boolean) => void;
  language: string;
}

export interface PreliminaryResultViewProps {
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
}

export interface ThreeRoundViewProps {
  userPrompt: string;
  currentRound: number;
  roundQuestions: RoundQuestion[];
  topicAnswers: Record<string, string>;
  detectedLanguage: string;
  isGenerating: boolean;
  onRoundComplete: (answers: Record<string, string>) => void;
  setCurrentView: (view: string) => void;
  wizardMessage: string;
}

export interface DiffViewerProps {
  originalText: string;
  newText: string;
}

export interface SingleQuestionFormProps {
  question: QuestionItem;
  questionKey: string;
  answer: any;
  questionNumber: number;
  totalQuestions: number;
  onAnswerChange: (answer: any) => void;
  onConfirm: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
  language: string;
}

export interface DynamicQuestionFormProps {
  questions: Record<string, QuestionItem[]>;
  answers: Record<string, any>;
  onAnswerChange: (questionKey: string, answer: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  language: string;
}

export interface IterativeFlowViewProps {
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
  language: string;
}