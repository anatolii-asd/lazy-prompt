import React, { forwardRef } from 'react';
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

    return (
      <div className="relative overflow-hidden rounded-2xl">
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${className} pb-16`}
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