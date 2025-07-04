import React, { forwardRef, useEffect, useRef } from 'react';
import { AudioRecorder } from './AudioRecorder';

interface AudioTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  enableAudioRecording?: boolean;
  audioRecorderClassName?: string;
}

export const AudioTextarea = forwardRef<HTMLTextAreaElement, AudioTextareaProps>(
  ({ 
    value, 
    onChange, 
    onValueChange,
    enableAudioRecording = true,
    audioRecorderClassName = '',
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const handleTranscriptionComplete = (newText: string) => {
      if (onValueChange) {
        onValueChange(newText);
      } else {
        // Create a synthetic event to maintain compatibility with existing onChange handlers
        const syntheticEvent = {
          target: { value: newText },
          currentTarget: { value: newText },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
    };

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
      adjustHeight();
    };

    return (
      <div className="relative overflow-hidden" style={{ WebkitTapHighlightColor: 'transparent' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`${className} pb-16 outline-none focus:outline-none !border-gray-300 focus:!border-wizard-primary-500 resize-none overflow-hidden`}
          style={{ 
            WebkitTapHighlightColor: 'transparent', 
            outline: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem'
          }}
          {...props}
        />
        {enableAudioRecording && (
          <AudioRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            currentText={value}
            className={audioRecorderClassName}
            isDisabled={disabled}
          />
        )}
      </div>
    );
  }
);

AudioTextarea.displayName = 'AudioTextarea';