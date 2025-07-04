import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { DynamicQuestionFormProps } from '../types';
import { QuestionItem } from '../../lib/promptService';
import SingleQuestionForm from './SingleQuestionForm';

const DynamicQuestionForm: React.FC<DynamicQuestionFormProps> = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  isSubmitting
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

export default DynamicQuestionForm;