import { motion } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';

interface CompletionConfirmationProps {
  message: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const CompletionConfirmation = ({ 
  message, 
  onConfirm, 
  isLoading = false 
}: CompletionConfirmationProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center border-2 border-gray-100">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {message || "I've got everything I need! 🎉"}
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-lg text-gray-600">
            Time to work my lazy magic and create an amazing prompt for you! 
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <span className="text-4xl animate-pulse">🦥</span>
            <span className="text-sm font-medium">The sloth is ready to amaze you!</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold py-4 px-8 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin mr-3">🦥</div>
                Creating Your Masterpiece...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Sparkles className="w-6 h-6 mr-3" />
                Generate My Amazing Prompt! ✨
              </div>
            )}
          </motion.button>

          <p className="text-sm text-gray-500 mt-3">
            This will only take a moment of supreme laziness...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CompletionConfirmation;