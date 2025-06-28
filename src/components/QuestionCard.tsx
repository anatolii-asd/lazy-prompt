import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuestionOption {
  text: string;
  emoji: string;
}

interface QuestionCardProps {
  question: string;
  options: QuestionOption[];
  allowCustom: boolean;
  onAnswer: (answer: string, customText?: string) => void;
  isLoading?: boolean;
}

const QuestionCard = ({ 
  question, 
  options, 
  allowCustom, 
  onAnswer, 
  isLoading = false 
}: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleOptionSelect = (optionText: string) => {
    setSelectedOption(optionText);
    setShowCustomInput(false);
    setCustomText('');
    onAnswer(optionText);
  };

  const handleCustomSelect = () => {
    setSelectedOption('custom');
    setShowCustomInput(true);
  };

  const handleCustomSubmit = () => {
    if (customText.trim()) {
      onAnswer(selectedOption === 'custom' ? 'Custom answer' : selectedOption || '', customText);
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 max-w-2xl mx-auto"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6">{question}</h3>
      
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {options.map((option) => (
          <motion.button
            key={option.text}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOptionSelect(option.text)}
            disabled={isLoading}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedOption === option.text
                ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{option.emoji}</span>
              <span className="font-medium">{option.text}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {allowCustom && (
        <>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCustomSelect}
            disabled={isLoading}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedOption === 'custom'
                ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300 text-gray-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">✨</span>
              <span className="font-medium">Something else (I'll type it)</span>
            </div>
          </motion.button>

          {showCustomInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder="Type your custom answer..."
                  className="flex-1 p-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none"
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customText.trim() || isLoading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Submit
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Be as specific or creative as you want! 🎨
              </p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default QuestionCard;