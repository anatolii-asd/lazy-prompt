import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { translate } from '../../lib/translations';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  currentText: string;
  className?: string;
  isDisabled?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
  currentText,
  className = '',
  isDisabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAudioSupported, setIsAudioSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { language } = useAuth();

  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'en' ? 'en-US' : 'uk-UA';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setIsProcessing(true);
        setTimeout(() => {
          const newText = currentText + (currentText ? ' ' : '') + finalTranscript;
          onTranscriptionComplete(newText);
          setIsProcessing(false);
        }, 500);
      }
    };

    recognition.onerror = () => {
      setError(translate(language, 'audio.recordingError'));
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };
  }, [language, currentText, onTranscriptionComplete]);

  // Check browser compatibility on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsAudioSupported(true);
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    }
  }, [setupRecognition]);

  const startRecording = () => {
    if (!recognitionRef.current || isDisabled) return;
    
    try {
      recognitionRef.current.start();
    } catch {
      setError(translate(language, 'audio.startError'));
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  const cancelRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsRecording(false);
    setIsProcessing(false);
  };

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'uk-UA';
    }
  }, [language]);

  if (!isAudioSupported) {
    return null; // Hide component if not supported
  }

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {!isRecording && !isProcessing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={startRecording}
            disabled={isDisabled}
            className="absolute bottom-2 right-2 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-wizard-primary disabled:opacity-50 disabled:cursor-not-allowed"
            title={translate(language, 'audio.startRecording')}
          >
            <Mic className="w-5 h-5 text-gray-600 hover:text-wizard-primary" />
          </motion.button>
        )}

        {(isRecording || isProcessing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-14 bg-wizard-forest-mist border-2 border-wizard-primary rounded-2xl px-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <MicOff className={`w-5 h-5 ${isProcessing ? 'text-wizard-accent' : 'text-wizard-primary'}`} />
                </motion.div>
                <span className="text-sm font-medium text-wizard-primary">
                  {isProcessing ? translate(language, 'audio.processing') : translate(language, 'audio.listening')}
                </span>
              </div>
              
              {/* Waveform Animation */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1 bg-current ${isProcessing ? 'text-wizard-accent' : 'text-wizard-primary'}`}
                    animate={{
                      height: [4, 16, 4],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="px-3 py-1 rounded-lg bg-wizard-primary text-white text-sm font-medium hover:bg-wizard-primary/90 transition-colors"
              >
                <Check className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelRecording}
                className="px-3 py-1 rounded-lg bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};