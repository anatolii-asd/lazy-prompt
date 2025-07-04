import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SingleQuestionFormProps } from '../types';

const SingleQuestionForm: React.FC<SingleQuestionFormProps> = ({
  question,
  questionKey,
  answer,
  questionNumber,
  totalQuestions,
  onAnswerChange,
  onConfirm,
  onSkip,
  isSubmitting
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
                  i < questionNumber ? 'bg-wizard-primary-600' : 
                  i === questionNumber - 1 ? 'bg-wizard-primary-400' : 'bg-gray-200'
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
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wizard-primary-500 focus:border-transparent resize-y min-h-[120px] text-gray-700"
            placeholder="Enter your answer..."
          />
        )}
        
        {question.type === 'text' && (
          <input
            type="text"
            value={localAnswer}
            onChange={(e) => handleLocalChange(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wizard-primary-500 focus:border-transparent text-gray-700"
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
                  className="text-wizard-primary-600 focus:ring-wizard-primary-500"
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
                className="text-wizard-primary-600 focus:ring-wizard-primary-500"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wizard-primary-500 focus:border-transparent text-gray-700"
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
            className="flex-1 bg-emerald-magic text-white py-3 px-6 rounded-lg font-medium hover:bg-wizard-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

export default SingleQuestionForm;