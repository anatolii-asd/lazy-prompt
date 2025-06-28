# Feature: Iterative Question-Based Prompt Refinement

**Type:** Enhancement
**Priority:** High
**Estimated Complexity:** Medium

## Overview
Transform the current "Regular Lazy" mode from showing 5 questions at once to an intelligent, iterative questioning system where questions are generated one at a time based on user responses, with AI determining when enough context has been gathered.

## Requirements
### Functional Requirements
- Generate one question at a time using Gemini API based on conversation context
- AI determines when sufficient information has been gathered (no fixed question count)
- Each question presents 4 predefined options plus an optional custom text field
- Hidden template selection remains unchanged (user never sees the template)
- Smooth sliding card transitions between questions
- Explicit confirmation when AI is ready to generate the final prompt
- Maintain the lazy, sloth-themed personality throughout

### Technical Requirements  
- Stateless API calls with full conversation history
- Modify Edge Function to support iterative question generation
- Implement new question response structure with optional text field
- Create sliding card animations using existing Framer Motion
- Preserve existing loading animations and sloth messages
- Ensure mobile responsiveness for new UI components

## User Stories
### Primary User Story
**As a** lazy user  
**I want** to answer one simple question at a time  
**So that** I don't feel overwhelmed and can provide better context gradually

### Additional User Stories
- **As a** lazy user, **I want** the AI to know when to stop asking questions **so that** I get my prompt as quickly as possible
- **As a** lazy user, **I want** to provide custom answers when the options don't fit **so that** my prompt is more accurate
- **As a** lazy user, **I want** smooth transitions between questions **so that** the experience feels polished and engaging

## Implementation Plan
### Phase 1: Backend Implementation
- [ ] Modify `enhance-prompt` Edge Function to support single question generation
- [ ] Add conversation context parameter to track previous Q&As
- [ ] Implement AI logic to determine when enough context is gathered
- [ ] Update response structure to include continuation flag
- [ ] Add custom field support to question structure

### Phase 2: Frontend Implementation
- [ ] Create new `QuestionCard` component with optional text field
- [ ] Implement sliding card animation container
- [ ] Update state management for iterative flow
- [ ] Add conversation history tracking
- [ ] Implement confirmation screen when AI has enough context
- [ ] Update view transitions for smooth flow

### Phase 3: Integration & Testing
- [ ] Connect frontend to updated Edge Function endpoints
- [ ] Test various prompt types for appropriate question depth
- [ ] Verify loading states between questions
- [ ] Ensure graceful handling of API errors
- [ ] Test mobile responsiveness of new components
- [ ] Validate that generated prompts maintain quality

## Technical Specifications
### API Changes
#### Modified Endpoints
- `POST /enhance-prompt` - Add support for iterative mode
  ```typescript
  interface IterativeRequest {
    user_input: string
    mode: 'iterative'  // New mode
    conversation_history?: {
      question: string
      answer: string
      custom_text?: string
    }[]
  }
  
  interface IterativeResponse {
    question?: {
      question: string
      options: Array<{text: string, emoji: string}>
      allow_custom: boolean
    }
    is_complete: boolean
    completion_message?: string
    enhanced_prompt?: string
    lazy_tweaks?: LazyTweak[]
    laziness_score?: number
    prompt_quality?: number
    template_used?: string
  }
  ```

### Frontend Components
#### New Components
- `QuestionCard` - Displays single question with options and optional text field
- `QuestionFlow` - Container managing sliding animations and question progression
- `CompletionConfirmation` - Celebration screen when AI has enough context

#### Modified Components
- `SlothPromptBoost` - Add iterative mode handling and state management
- Remove static question display logic for regular lazy mode

### State Management
```typescript
interface IterativeState {
  currentQuestion: Question | null
  conversationHistory: ConversationEntry[]
  isLoadingQuestion: boolean
  isComplete: boolean
  completionMessage: string
}
```

## Integration Points
### Existing Systems
- **Gemini API:** Extended to support context-aware single question generation
- **Template System:** Unchanged - still selects template based on initial input
- **Lazy Tweaks:** Generated after all questions are answered
- **Loading Animations:** Reuse existing sloth loading overlay

### Prompting Strategy
Modify Gemini prompts to:
1. Generate contextual questions based on conversation history
2. Evaluate after each answer if more information is needed
3. Return completion signal when sufficient context exists

## Security Considerations
- Validate conversation history size to prevent abuse
- Implement rate limiting for iterative API calls
- Sanitize custom text field inputs
- Ensure conversation history doesn't exceed token limits

## Testing Requirements
### Unit Tests
- Question generation with various contexts
- Completion detection logic
- Custom field validation
- Animation transitions

### Integration Tests
- Full iterative flow from start to completion
- Error handling during question sequence
- State recovery after connection issues

### User Acceptance Tests
- Test with various prompt types (creative, technical, business)
- Verify appropriate question depth for different scenarios
- Confirm smooth UI transitions and loading states

## Documentation Updates
- [ ] Update user guide for new iterative mode
- [ ] Document new API parameters
- [ ] Add examples of conversation flows
- [ ] Update component documentation

## Definition of Done
- [ ] Iterative questioning works smoothly with one question at a time
- [ ] AI successfully determines when to stop asking questions
- [ ] Custom text field integrates seamlessly with predefined options
- [ ] Sliding animations feel smooth and natural
- [ ] Loading states maintain personality with sloth messages
- [ ] Confirmation screen builds anticipation before final generation
- [ ] All existing features continue to work (Super Lazy mode, lazy tweaks)
- [ ] Mobile experience is fully responsive
- [ ] Tests pass and documentation is updated

## Questions & Assumptions
### Answered During Discussion
- Generate one question at a time (not pre-generated)
- AI determines completion (not fixed question count)
- Optional text field below options (not mandatory)
- Stateless API calls with full history
- Sliding card UI (not chat-like or accordion)
- Full loading overlay between questions
- Explicit confirmation when ready to generate

### Outstanding Questions
- Specific prompt engineering for completion detection
- Maximum conversation length limits
- Handling of very brief vs very detailed user inputs

### Assumptions Made
- Users prefer depth over speed in Regular Lazy mode
- Sliding animations perform well on all devices
- Gemini API can handle iterative calls efficiently
- Current template selection logic remains optimal

---
**Created through interactive discussion with AI assistance**
**Discussion Date:** 2025-01-28
**Estimated Effort:** 3-5 days of development