# Feature: Native Browser Audio Recording & Transcription for All Textareas

**Type:** New Feature Enhancement  
**Priority:** High  
**Estimated Complexity:** Medium

## Overview
Implement native browser-based audio recording and transcription functionality that automatically enhances ALL textarea elements in the application. Users can record their voice using a microphone button positioned in the right lower corner of every textarea, with transcribed text inserted at their cursor position using their current interface language.

## Requirements

### Functional Requirements
- Universal enhancement of all textarea components with audio recording capability
- Microphone button positioned in right lower corner of every textarea
- Real-time visual feedback using color transitions (Gray → Red → Green → Blue)
- Speech recognition using user's current i18n language setting (en/uk)
- Text insertion at cursor position for natural editing workflow
- Browser compatibility detection with user warnings for unsupported browsers
- Toast notifications for success/error feedback

### Technical Requirements  
- Web Speech API integration for native browser audio processing
- Integration with existing i18n system for language detection
- Consistent styling with current Tailwind CSS design system
- TypeScript implementation with proper type safety
- React component architecture following existing patterns

## User Stories

### Primary User Story
**As a** user of the LazyPrompt application  
**I want** to record my voice in any textarea field  
**So that** I can input text hands-free and improve my productivity

### Additional User Stories
- **As a** multilingual user **I want** transcription in my current interface language **so that** the text matches my language preference
- **As a** user **I want** clear visual feedback during recording **so that** I know the system is working properly
- **As a** user **I want** transcribed text inserted at my cursor position **so that** I can edit naturally and maintain my workflow

## Implementation Plan

### Phase 1: Core Audio Infrastructure
- [ ] Create `AudioRecordingContext` for managing global audio state
- [ ] Implement `useAudioRecording` hook with Web Speech API integration
- [ ] Add browser compatibility detection utility
- [ ] Create audio permission request handling

### Phase 2: UI Components
- [ ] Design and implement `AudioRecordingButton` component
- [ ] Add color transition states using Framer Motion
- [ ] Position microphone button in textarea right lower corner
- [ ] Implement toast notification system for feedback

### Phase 3: Textarea Enhancement
- [ ] Create `EnhancedTextarea` wrapper component
- [ ] Update `HomeView.tsx` textarea implementation
- [ ] Update `SingleQuestionForm.tsx` textarea implementation
- [ ] Ensure cursor position preservation and text insertion

### Phase 4: Integration & Testing
- [ ] Integrate with existing i18n language detection
- [ ] Add audio-related translations to locale files
- [ ] Implement error handling and user feedback
- [ ] Test cross-browser compatibility

## Technical Specifications

### API Integration
#### Web Speech API Usage
- `SpeechRecognition` for audio-to-text conversion
- Language detection from `AuthContext.language` state
- Continuous recognition with interim results
- Error handling for permissions and unsupported browsers

### Component Architecture
#### New Components
- `AudioRecordingButton` - Microphone button with state management
- `AudioRecordingContext` - Global audio state provider
- `ToastNotification` - Success/error feedback system
- `EnhancedTextarea` - Textarea wrapper with audio capabilities

#### Modified Components
- `HomeView.tsx:37` - Main prompt textarea enhancement
- `SingleQuestionForm.tsx:98` - Dynamic form textarea enhancement

### State Management
```typescript
interface AudioRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  isTranscribing: boolean;
  error: string | null;
  transcript: string;
  language: 'en' | 'uk';
}
```

### Visual States
```typescript
enum AudioButtonState {
  IDLE = 'gray',      // Ready to record
  RECORDING = 'red',  // Currently recording
  PROCESSING = 'green', // Processing audio
  TRANSCRIBING = 'blue' // Converting to text
}
```

## Integration Points

### Existing Systems
- **i18n System:** Leverages `AuthContext.language` for speech recognition language
- **Styling System:** Uses existing Tailwind CSS wizard-* color tokens
- **Animation System:** Integrates with Framer Motion for smooth transitions
- **Component Architecture:** Follows existing React TypeScript patterns

### Browser Compatibility
- **Supported:** Chrome 25+, Edge 79+, Safari 14.1+
- **Limited:** Firefox (requires manual enablement)
- **Fallback:** Toast notification with browser upgrade suggestion

## Security Considerations
- Microphone permission request handling
- No audio data storage or transmission
- Client-side processing only using Web Speech API
- Privacy-first approach with user consent

## Testing Requirements

### Unit Tests
- `AudioRecordingButton` component state management
- `useAudioRecording` hook functionality
- Browser compatibility detection utility
- Text insertion at cursor position logic

### Integration Tests
- Full recording workflow (record → transcribe → insert)
- Language switching with transcription language update
- Error handling for permission denied scenarios
- Cross-browser compatibility testing

### User Acceptance Tests
- Users can successfully record and transcribe audio in main prompt textarea
- Users can record audio in dynamic question form textareas
- Transcription uses correct language based on interface language
- Visual feedback provides clear indication of recording states

## Internationalization Updates

### English Translations (`en.json`)
```json
{
  "audio": {
    "record": "Record audio",
    "recording": "Recording...",
    "processing": "Processing audio...",
    "transcribing": "Transcribing...",
    "success": "Audio transcribed successfully",
    "error": "Audio recording failed",
    "unsupported": "Audio recording not supported in this browser",
    "permission_denied": "Microphone permission denied"
  }
}
```

### Ukrainian Translations (`uk.json`)
```json
{
  "audio": {
    "record": "Записати аудіо",
    "recording": "Записується...",
    "processing": "Обробка аудіо...",
    "transcribing": "Транскрибується...",
    "success": "Аудіо успішно транскрибовано",
    "error": "Помилка запису аудіо",
    "unsupported": "Запис аудіо не підтримується в цьому браузері",
    "permission_denied": "Доступ до мікрофону заборонено"
  }
}
```

## Definition of Done
- [ ] All functional requirements implemented and tested
- [ ] Universal enhancement applied to all textarea components
- [ ] Web Speech API integration working with language detection
- [ ] Visual feedback states implemented with color transitions
- [ ] Toast notifications working for all scenarios
- [ ] Browser compatibility detection and warnings implemented
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests covering full workflow
- [ ] Cross-browser testing completed
- [ ] Internationalization strings added for both languages
- [ ] Code review completed and approved
- [ ] User acceptance testing passed
- [ ] Documentation updated

## Technical Dependencies
- Web Speech API (native browser support)
- Existing Framer Motion for animations
- Existing Lucide React icons for microphone icon
- Existing i18n system for language detection
- Existing Tailwind CSS for styling

## Questions & Assumptions

### Decisions Made During Discussion
1. **Universal Enhancement:** All textareas will automatically include audio recording capability
2. **UI Positioning:** Microphone button in right lower corner of every textarea
3. **Visual Feedback:** Color transitions to indicate recording states
4. **Language Detection:** Use current i18n language setting for transcription
5. **Browser Support:** Web Speech API only with warnings for unsupported browsers
6. **Error Handling:** Toast notifications for user feedback
7. **Text Behavior:** Insert transcribed text at cursor position

### Assumptions Made
- Users primarily use modern browsers (Chrome, Edge, Safari)
- Audio recording sessions will be relatively short (< 2 minutes)
- Network connectivity not required (client-side processing only)
- Users will grant microphone permissions when prompted

---
**Created through interactive discussion with AI assistance**  
**Discussion Date:** 2025-07-04  
**Estimated Effort:** 2-3 weeks for full implementation