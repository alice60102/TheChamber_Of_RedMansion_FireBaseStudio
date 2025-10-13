# QA Module Improvement 02 - UI/UX Enhancement Task Plan

> **Document Version**: 1.0
> **Last Updated**: 2025-10-08
> **Author**: Development Team
> **Priority**: High

## Overview

This document outlines the improvement tasks for the QA Module based on 13 specific UI/UX issues identified during user testing. The improvements focus on enhancing user experience, visual design, citation system, conversation management, and performance optimization.

### Related Issues Summary

| Issue ID | Category | Description | Priority |
|----------|----------|-------------|----------|
| #1 | UI Layout | User blue bubble too long | High |
| #2 | UX Flow | AI avatar should appear immediately on query submit | High |
| #3 | Interaction | Send button should become stop button during streaming | High |
| #4 | Thinking Process | Thinking text needs smaller size, indentation, and proper collapse | High |
| #5 | Feature | Add copy button below completed messages | Medium |
| #6 | Citation | Replace [1] with domain badges and hover tooltips | High |
| #7 | UX Flow | Enable free scrolling during AI response | High |
| #8 | State Management | Conversation history cleared when panel reopens | High |
| #9 | UI Polish | Suggestion button hover needs pink background | Low |
| #10 | UI Polish | Submit button needs circular design with bold arrow | Medium |
| #11 | Title Management | Dynamic title based on first query | Medium |
| #12 | Performance | AI response speed verification | High |
| #13 | Context | Selected text not included in query context | High |

---

## Phase 1: Message Bubble & Layout Refinements

### [X] **Task 1.1**: Fix User Message Bubble Width Constraint
- **Task Name**: Implement User Message Bubble Max-Width
- **Work Description**:
    - **Why**: User's blue message bubbles are too long (spanning entire width), reducing readability and breaking messaging app UX pattern
    - **How**:
        1. Add max-width constraint to user message bubbles (70-80% of container width)
        2. Ensure proper word-wrapping for long messages
        3. Maintain right-alignment for user messages
        4. Test with various message lengths (short, medium, long, multi-line)
- **Resources Required**:
    - **Materials**: Tailwind CSS utilities, responsive breakpoints configuration
    - **Personnel**: Frontend developer (2-3 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/ConversationFlow.tsx` lines 166-230 (MessageBubble component)
        - Reference image: `temp/qa_module_problem04.jpg`
        - Tailwind max-width utilities documentation
- **Deliverables**:
    - [x] Updated ConversationFlow.tsx with max-width constraint
    - [x] Responsive testing across mobile, tablet, desktop
    - [x] Visual QA confirming proper bubble sizing
- **Dependencies**: None
- **Constraints**: Must maintain messaging app UX pattern, preserve accessibility
- **Completion Status**: ✅ Completed (2025-10-08)
- **Notes**: Consider different max-width for mobile (90%) vs desktop (70%)

### [x] **Task 1.2**: Redesign Submit Button to Circular with Bold Arrow
- **Task Name**: Implement Circular Submit Button Design
- **Work Description**:
    - **Why**: Current submit button doesn't match the design specification; needs circular shape with bold arrow icon
    - **How**:
        1. Update button styling to circular shape (rounded-full)
        2. Replace arrow icon with bolder variant (ArrowUp or Send icon with increased stroke width)
        3. Ensure proper icon centering in circular button
        4. Add appropriate padding and sizing (e.g., w-10 h-10)
        5. Implement proper disabled/active states
- **Resources Required**:
    - **Materials**: Lucide React icons (ArrowUp, Send), Tailwind CSS
    - **Personnel**: Frontend developer (1-2 hours)
    - **Reference Codes/docs**:
        - `src/app/(main)/read-book/page.tsx` (search for submit/send button implementation)
        - Reference image: `temp/btn_reference.jpg`
        - Lucide React icon library
- **Deliverables**:
    - [x] Updated submit button component with circular design
    - [x] Bold arrow icon implementation (strokeWidth 2.5)
    - [x] Hover and active state styling (scale 105%/95%)
    - [x] Disabled state visual indication
- **Dependencies**: Task 1.3 (Send/Stop button toggle)
- **Constraints**: Must maintain accessibility (proper touch target size ≥44px)
- **Completion Status**: ✅ Completed (2025-10-08)
- **Notes**: Ensure icon stroke-width is 2.5 or 3 for "bold" appearance

### [x] **Task 1.3**: Implement All Suggestion Button Hover Effects
- **Task Name**: Add Pink Background Hover State for Suggestion Buttons, remainning e.g. 第一回的主要宗旨所在?、賈寶玉的玉有甚麼意涵?、林黛玉為何是絳珠仙草?
- **Work Description**:
    - **Why**: Suggestion buttons need visual feedback on hover to improve interactivity
    - **How**:
        1. Add hover:bg-pink-100/dark:hover:bg-pink-950 to suggestion buttons
        2. Keep text color unchanged (no transition to black)
        3. Add smooth transition (transition-colors duration-200)
        4. Test hover state in both light and dark themes
- **Resources Required**:
    - **Materials**: Tailwind CSS hover utilities, pink color palette
    - **Personnel**: Frontend developer (30 minutes)
    - **Reference Codes/docs**:
        - `src/app/(main)/read-book/page.tsx` (suggested questions UI section)
        - Tailwind CSS hover state documentation
- **Deliverables**:
    - [x] Updated suggestion button styling with pink hover background
    - [x] Theme-aware hover states (light/dark mode)
    - [x] Smooth transition implementation (200ms)
- **Dependencies**: None
- **Constraints**: Text color must remain unchanged on hover
- **Completion Status**: ✅ Completed (2025-10-08)
- **Notes**: Use pink-100 for light theme, pink-950 for dark theme

---

## Phase 2: AI Response Flow Enhancement ✅ COMPLETED

### [x] **Task 2.1**: Show AI Avatar Immediately on Query Submission
- **Task Name**: Implement Immediate AI Avatar Display
- **Work Description**:
    - **Why**: Users perceive lag/freezing when AI avatar appears together with response; avatar should appear immediately to indicate processing
    - **How**:
        1. Create AI message placeholder immediately when user submits query
        2. Display AI avatar with loading skeleton or "thinking" indicator
        3. Stream thinking process and answer into the existing message bubble
        4. Ensure smooth transition from placeholder to content
- **Resources Required**:
    - **Materials**: Skeleton components, loading states
    - **Personnel**: Frontend developer (2-3 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/ConversationFlow.tsx` lines 135-151 (MessageAvatar)
        - `src/components/ui/skeleton.tsx`
        - `src/app/(main)/read-book/page.tsx` (message state management)
- **Deliverables**:
    - [x] AI message placeholder created on query submit
    - [x] Avatar displayed immediately with loading state
    - [x] Smooth content streaming into placeholder (loading skeleton)
    - [x] No visual jumps or layout shifts
- **Dependencies**: None
- **Constraints**: Must maintain smooth UX without flickering
- **Completion Status**: ✅ Completed (2025-10-08)
- **Notes**: Consider adding subtle pulse animation to avatar during loading

### [x] **Task 2.2**: Implement Send/Stop Button Toggle During Streaming
- **Task Name**: Add Streaming Control with Button State Toggle
- **Work Description**:
    - **Why**: Users need ability to stop long-running AI responses; submit button should transform to stop button during streaming
    - **How**:
        1. Track streaming state in component (isStreaming boolean)
        2. Toggle button between Send (ArrowUp) and Stop (Square/X) icon based on state
        3. Implement stop functionality to abort streaming request
        4. Disable input field during streaming (readonly or disabled state)
        5. Re-enable input and restore send button when streaming completes/stops
- **Resources Required**:
    - **Materials**: AbortController for request cancellation, state management
    - **Personnel**: Frontend developer (3-4 hours)
    - **Reference Codes/docs**:
        - `src/app/(main)/read-book/page.tsx` (handleSubmitQuestion function)
        - `src/app/api/perplexity-qa-stream/route.ts` (streaming implementation)
        - AbortController MDN documentation
- **Deliverables**:
    - [x] Send/Stop button toggle implementation (ArrowUp/Square icons)
    - [x] AbortController integration for streaming cancellation
    - [x] Input field disabled state during streaming
    - [x] Proper cleanup on abort
    - [x] Error handling for stopped requests (AbortError detection)
- **Dependencies**: Task 2.1 (AI avatar display)
- **Constraints**: Must gracefully handle aborted requests without errors
- **Completion Status**: ✅ Completed (2025-10-08)
- **Notes**: Consider keeping partial response visible when user stops streaming

### [x] **Task 2.3**: Enable Free Scrolling During AI Response
- **Task Name**: Implement Independent Scroll Control
- **Work Description**:
    - **Why**: Users are currently locked to auto-scroll during AI streaming; they should be able to review previous messages freely
    - **How**:
        1. Detect user scroll intent (manual scroll vs auto-scroll)
        2. Disable auto-scroll when user manually scrolls up
        3. Show "scroll to bottom" button when auto-scroll is disabled
        4. Re-enable auto-scroll when user clicks "scroll to bottom" or scrolls near bottom
        5. Ensure smooth scrolling experience without jarring jumps
- **Resources Required**:
    - **Materials**: Scroll detection logic, intersection observer API
    - **Personnel**: Frontend developer (3-4 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/ConversationFlow.tsx` lines 268-273 (auto-scroll logic)
        - Intersection Observer API documentation
        - React scroll handling best practices
- **Deliverables**:
    - [x] Scroll intent detection implementation (handleScrollIntent)
    - [x] Conditional auto-scroll logic (autoScrollEnabled state)
    - [x] "Scroll to bottom" floating button with unread count badge
    - [x] Smooth scroll restoration
    - [x] No layout thrashing during streaming
- **Dependencies**: None
- **Constraints**: Must not interfere with normal scroll behavior
- **Completion Status**: ✅ Completed (2025-10-08)
- **Notes**: Consider showing unread message count on scroll-to-bottom button

---

## Phase 3: Thinking Process Optimization

### [ ] **Task 3.1**: Reduce Thinking Text Size and Add Indentation
- **Task Name**: Implement Thinking Process Visual Hierarchy
- **Work Description**:
    - **Why**: Thinking process text is currently same size as answer; needs to be smaller and indented to show it's secondary information
    - **How**:
        1. Reduce thinking text size to text-xs or text-sm (12px or 14px)
        2. Add left border and padding for visual indentation (border-l-2 pl-4)
        3. Apply muted color (text-muted-foreground)
        4. Ensure italic styling (italic or font-style-italic)
        5. Test readability at smaller size
- **Resources Required**:
    - **Materials**: Tailwind typography utilities
    - **Personnel**: Frontend developer (1-2 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/ThinkingProcessIndicator.tsx` lines 195-209
        - `src/components/ui/AIMessageBubble.tsx` lines 104-117
        - Reference image: `temp/qa_module_example.jpg`
- **Deliverables**:
    - [ ] Updated thinking text styling (smaller, indented)
    - [ ] Visual hierarchy clearly distinguishes thinking from answer
    - [ ] Accessibility maintained (minimum readable font size)
- **Dependencies**: None
- **Constraints**: Must remain readable; minimum 12px font size
- **Completion Status**: ⏳ Pending
- **Notes**: Consider using border-l-blue-500/30 for subtle visual cue

### [ ] **Task 3.2**: Fix Thinking Process Collapse Functionality
- **Task Name**: Implement Proper Collapsible Thinking Section
- **Work Description**:
    - **Why**: Current implementation has bug where collapsing shows previous AI response's thinking content instead of current one
    - **How**:
        1. Debug state management for thinking process collapse/expand
        2. Ensure each AI message maintains its own thinking process state
        3. Fix reference to correct thinking content when collapsing
        4. Implement per-message collapse state (not global)
        5. Add collapse/expand animation (smooth height transition)
- **Resources Required**:
    - **Materials**: React state management, animation utilities
    - **Personnel**: Frontend developer (2-3 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/AIMessageBubble.tsx` lines 68-74, 105-117
        - `src/components/ui/ThinkingProcessIndicator.tsx` lines 111-129
        - React useState and useEffect hooks documentation
- **Deliverables**:
    - [ ] Fixed collapse/expand state management
    - [ ] Per-message thinking process state isolation
    - [ ] Smooth collapse/expand animation
    - [ ] Bug verification and testing
- **Dependencies**: Task 3.1 (thinking text styling)
- **Constraints**: Must not affect other messages' thinking state
- **Completion Status**: ⏳ Pending
- **Notes**: Consider using message ID as key for thinking state

### [ ] **Task 3.3**: Implement Collapsible Header Design
- **Task Name**: Create "Thought for X seconds" Collapsible Header
- **Work Description**:
    - **Why**: Thinking process needs clear visual header showing duration and collapse state
    - **How**:
        1. Calculate thinking duration (time between query submit and response start)
        2. Display "Thought for X seconds" header above thinking content
        3. Add chevron icon indicating collapse state (ChevronDown/ChevronRight)
        4. Make entire header clickable to toggle collapse
        5. Update header text based on collapse state
- **Resources Required**:
    - **Materials**: Lucide React chevron icons, duration calculation logic
    - **Personnel**: Frontend developer (2 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/AIMessageBubble.tsx` lines 81-102
        - Reference image: `temp/qa_module_example.jpg`
        - Date/time utilities for duration calculation
- **Deliverables**:
    - [ ] Thinking duration calculation and display
    - [ ] Clickable header with chevron icon
    - [ ] Header text changes based on collapse state
    - [ ] Accessible button implementation
- **Dependencies**: Task 3.2 (collapse functionality fix)
- **Constraints**: Duration must be accurate and formatted properly
- **Completion Status**: ⏳ Pending
- **Notes**: Format duration as "X 秒" for Chinese localization

---

## Phase 4: Citation System Redesign

### [ ] **Task 4.1**: Replace Citation Numbers with Domain Name Badges
- **Task Name**: Implement Inline Domain-Based Citations
- **Work Description**:
    - **Why**: Current [1], [2] notation is less informative; domain badges (e.g., "wikipedia.org", "zhihu.com") provide immediate source context
    - **How**:
        1. Parse citation URLs to extract domain names
        2. Create domain name extraction utility (remove www., keep readable part)
        3. Replace [1] notation with inline badge components showing domain
        4. Style badges as subtle pills (rounded-full, small text, border)
        5. Implement domain-specific styling (e.g., Wikipedia gets blue, academic gets purple)
- **Resources Required**:
    - **Materials**: URL parsing utilities, Badge component
    - **Personnel**: Frontend developer (4-5 hours)
    - **Reference Codes/docs**:
        - `src/lib/citation-processor.ts` (citation integration utilities)
        - `src/lib/perplexity-client.ts` lines 232-239 (extractDomainFromUrl)
        - `src/components/ui/badge.tsx`
        - Reference images: `temp/citationEg01.jpg`, `temp/citationEg02.jpg`
- **Deliverables**:
    - [ ] Domain extraction utility function
    - [ ] Inline citation badge component
    - [ ] Domain-specific badge styling
    - [ ] Integration with StructuredQAResponse
- **Dependencies**: None
- **Constraints**: Domain names must be readable and recognizable
- **Completion Status**: ⏳ Pending
- **Notes**: Consider truncating very long domains (max 15-20 characters)

### [ ] **Task 4.2**: Implement Citation Hover Tooltip with Source Preview
- **Task Name**: Create Rich Citation Hover Cards
- **Work Description**:
    - **Why**: Users need quick preview of citation source without clicking; hover should show icon, title, and full domain
    - **How**:
        1. Implement Tooltip/HoverCard component wrapping citation badges
        2. Fetch or cache favicon/website icon for each domain
        3. Display tooltip containing: favicon, source title, full URL domain
        4. Add click handler to open source in new tab
        5. Implement proper hover delay (300ms) and positioning
- **Resources Required**:
    - **Materials**: Tooltip/HoverCard component, favicon API or service
    - **Personnel**: Frontend developer (4-5 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/tooltip.tsx`
        - `src/types/perplexity-qa.ts` (PerplexityCitation interface)
        - Reference image: `temp/citationEg02.jpg`
        - Google Favicon API or similar service
- **Deliverables**:
    - [ ] HoverCard component with rich source preview
    - [ ] Favicon integration (with fallback for missing icons)
    - [ ] Source title and domain display
    - [ ] Click-to-open-link functionality
    - [ ] Proper hover timing and positioning
- **Dependencies**: Task 4.1 (domain badge implementation)
- **Constraints**: Must handle missing favicons gracefully, tooltip must not obscure content
- **Completion Status**: ⏳ Pending
- **Notes**: Consider using Google Favicon API: `https://www.google.com/s2/favicons?domain={domain}&sz=32`

### [ ] **Task 4.3**: Remove Bottom Citation Section
- **Task Name**: Eliminate Redundant Citations Section
- **Work Description**:
    - **Why**: With inline domain badges and hover tooltips, bottom citation section becomes redundant
    - **How**:
        1. Remove or hide CitationDisplay component from bottom of responses
        2. Ensure all citation information is accessible via inline badges
        3. Update component logic to skip reference section rendering
        4. Remove related CSS/styling for citation section
        5. Update documentation to reflect new citation UX pattern
- **Resources Required**:
    - **Materials**: Component refactoring
    - **Personnel**: Frontend developer (1-2 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/CitationDisplay.tsx`
        - `src/components/ui/StructuredQAResponse.tsx` (citation rendering logic)
        - `src/components/ui/AIMessageBubble.tsx` (check for citation section usage)
- **Deliverables**:
    - [ ] Removed or hidden bottom citation section
    - [ ] Verified all citation data accessible via inline badges
    - [ ] Cleaned up unused citation section code
    - [ ] Updated component integration
- **Dependencies**: Task 4.1 and 4.2 (inline citations fully functional)
- **Constraints**: Must not lose any citation information
- **Completion Status**: ⏳ Pending
- **Notes**: Keep CitationDisplay component for potential future use; just hide it

---

## Phase 5: Copy & Interaction Features

### [ ] **Task 5.1**: Add Copy Button Below Completed Messages
- **Task Name**: Implement Message Copy Functionality
- **Work Description**:
    - **Why**: Users want to copy AI responses and their own questions for reference, sharing, or note-taking
    - **How**:
        1. Add copy button component below user and AI message bubbles
        2. Show button only when message is completed (not streaming)
        3. Implement clipboard API integration
        4. Show "copied" feedback (checkmark icon or toast notification)
        5. Handle copy errors gracefully (fallback to execCommand if needed)
        6. Position button subtly (small, muted color, appears on hover or always visible)
- **Resources Required**:
    - **Materials**: Clipboard API, Copy/Check icons (Lucide React)
    - **Personnel**: Frontend developer (2-3 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/ConversationFlow.tsx` (MessageBubble component)
        - Clipboard API documentation
        - `src/components/ui/button.tsx`
- **Deliverables**:
    - [ ] Copy button component integrated into message bubbles
    - [ ] Clipboard API implementation with fallback
    - [ ] Visual feedback on successful copy (icon change or toast)
    - [ ] Error handling for copy failures
    - [ ] Hover state for copy button visibility
- **Dependencies**: None
- **Constraints**: Must support all modern browsers; provide fallback for clipboard API
- **Completion Status**: ⏳ Pending
- **Notes**: Consider copying plain text for user messages, formatted markdown for AI responses

---

## Phase 6: Conversation State Management

### [ ] **Task 6.1**: Preserve Conversation History When Panel Reopens
- **Task Name**: Implement Conversation Persistence
- **Work Description**:
    - **Why**: Current implementation clears conversation when QA panel is closed and reopened; users expect conversation history to persist
    - **How**:
        1. Store conversation messages in localStorage or session state
        2. Use unique key based on book/chapter context (e.g., `qa_conversation_chapter_1`)
        3. Load conversation history when panel opens
        4. Implement proper serialization/deserialization of message data
        5. Add "Clear conversation" option for users to manually reset
        6. Handle edge cases (storage quota, invalid data, migration)
- **Resources Required**:
    - **Materials**: localStorage API, JSON serialization, state management
    - **Personnel**: Frontend developer (3-4 hours)
    - **Reference Codes/docs**:
        - `src/app/(main)/read-book/page.tsx` (conversation state management)
        - `src/components/ui/ConversationFlow.tsx`
        - localStorage best practices documentation
- **Deliverables**:
    - [ ] Conversation persistence implementation using localStorage
    - [ ] Load conversation on panel open
    - [ ] Save conversation on message add
    - [ ] "Clear conversation" functionality
    - [ ] Error handling for storage issues
    - [ ] Data migration strategy for schema changes
- **Dependencies**: None
- **Constraints**: Must handle localStorage quota limits gracefully (typically 5-10MB)
- **Completion Status**: ⏳ Pending
- **Notes**: Consider using IndexedDB for larger conversation histories

### [ ] **Task 6.2**: Implement Dynamic Conversation Title Generation
- **Task Name**: Generate Context-Aware Conversation Titles
- **Work Description**:
    - **Why**: Default "開啟新對話" title doesn't reflect conversation content; title should summarize first user query (e.g., "林黛玉的身分確認")
    - **How**:
        1. Extract key entities/topics from first user question using NLP or keyword extraction
        2. Generate concise title (max 10-15 characters) from extracted keywords
        3. Update panel header title when first AI response is received
        4. Provide fallback titles for unclear questions
        5. Allow manual title editing (optional enhancement)
- **Resources Required**:
    - **Materials**: Text processing utilities, entity extraction logic
    - **Personnel**: Frontend developer (4-5 hours)
    - **Reference Codes/docs**:
        - `src/app/(main)/read-book/page.tsx` (panel title state)
        - Chinese text processing libraries (Jieba.js or similar)
        - AI API for title generation (optional, using Gemini)
- **Deliverables**:
    - [ ] Title generation utility function
    - [ ] Integration with first user query
    - [ ] Panel header title update logic
    - [ ] Fallback title strategy
    - [ ] Optional: Manual title editing UI
- **Dependencies**: Task 6.1 (conversation persistence)
- **Constraints**: Titles must be concise and relevant; handle Chinese text properly
- **Completion Status**: ⏳ Pending
- **Notes**: Consider using simple keyword extraction first (character names, key terms), then AI-based summarization if needed

### [ ] **Task 6.3**: Implement "New Conversation" Button Functionality
- **Task Name**: Add New Conversation Creation with Title Reset
- **Work Description**:
    - **Why**: Users need clear way to start fresh conversation; current "--開啟新對話--" is just separator text
    - **How**:
        1. Convert "--開啟新對話--" text to actionable button
        2. Implement conversation reset functionality (clear messages, reset title)
        3. Optional: Save previous conversation before creating new one
        4. Update panel title back to "開啟新對話"
        5. Scroll to bottom of panel for new input
- **Resources Required**:
    - **Materials**: Button component, state reset logic
    - **Personnel**: Frontend developer (2 hours)
    - **Reference Codes/docs**:
        - `src/components/ui/ConversationFlow.tsx` lines 239-252 (NewConversationSeparator)
        - `src/app/(main)/read-book/page.tsx` (conversation state)
- **Deliverables**:
    - [ ] Clickable "開啟新對話" button
    - [ ] Conversation reset functionality
    - [ ] Title reset to default
    - [ ] Optional: Previous conversation archival
    - [ ] Scroll to bottom on new conversation
- **Dependencies**: Task 6.1, Task 6.2
- **Constraints**: Must not lose unsaved conversation data
- **Completion Status**: ⏳ Pending
- **Notes**: Consider confirmation dialog before clearing long conversations

---

## Phase 7: Performance & Context Integration

### [ ] **Task 7.1**: Investigate and Optimize AI Response Speed
- **Task Name**: AI Response Performance Analysis and Optimization
- **Work Description**:
    - **Why**: Users report slow AI response times; need to verify performance bottlenecks and optimize
    - **How**:
        1. Add performance instrumentation (time tracking) to all API calls
        2. Measure: network latency, API processing time, streaming delay, UI rendering time
        3. Analyze Perplexity API response times across different models
        4. Check for rate limiting or throttling issues
        5. Implement optimizations: request caching, model selection optimization, timeout tuning
        6. Document performance benchmarks and improvement results
- **Resources Required**:
    - **Materials**: Performance monitoring tools, API analytics
    - **Personnel**: Backend/Frontend developer (4-6 hours)
    - **Reference Codes/docs**:
        - `src/lib/perplexity-client.ts` (API client with timing)
        - `src/app/api/perplexity-qa-stream/route.ts` (streaming endpoint)
        - `src/ai/perplexity-config.ts` (timeout and model configuration)
        - Perplexity API documentation on rate limits
- **Deliverables**:
    - [ ] Performance instrumentation added to API calls
    - [ ] Performance benchmark report (baseline metrics)
    - [ ] Identified bottlenecks and root causes
    - [ ] Implemented optimizations (specific to findings)
    - [ ] Post-optimization performance comparison
    - [ ] Documentation of rate limits and best practices
- **Dependencies**: None
- **Constraints**: Must maintain response quality while optimizing speed
- **Completion Status**: ⏳ Pending
- **Notes**: Consider A/B testing different models for speed/quality tradeoff

### [ ] **Task 7.2**: Verify Rate Limiting Configuration
- **Task Name**: Rate Limit Analysis and Configuration
- **Work Description**:
    - **Why**: Slow responses might be caused by rate limiting; need to verify current limits and optimize request patterns
    - **How**:
        1. Check Perplexity API rate limits for current subscription tier
        2. Review API key configuration and quota usage
        3. Implement rate limit detection and handling
        4. Add user-facing feedback when rate limited (show remaining quota, retry timer)
        5. Optimize request patterns (debouncing, request queuing)
        6. Consider upgrading API tier if consistently hitting limits
- **Resources Required**:
    - **Materials**: API dashboard access, rate limit headers
    - **Personnel**: Backend developer (3-4 hours)
    - **Reference Codes/docs**:
        - `src/lib/perplexity-client.ts` (interceptors lines 115-130)
        - `src/lib/perplexity-error-handler.ts` (rate limit error handling)
        - Perplexity API rate limit documentation
        - PERPLEXITYAI_API_KEY environment variable
- **Deliverables**:
    - [ ] Rate limit configuration documented
    - [ ] Current usage analysis report
    - [ ] Rate limit detection implementation
    - [ ] User-facing rate limit feedback UI
    - [ ] Request optimization (debouncing/queuing)
    - [ ] Recommendation for API tier upgrade if needed
- **Dependencies**: Task 7.1 (performance analysis)
- **Constraints**: Must stay within budget constraints for API usage
- **Completion Status**: ⏳ Pending
- **Notes**: Monitor rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)

### [ ] **Task 7.3**: Fix Selected Text Context Integration
- **Task Name**: Implement Text Selection Context in QA Queries
- **Work Description**:
    - **Why**: When users select text in reading content and ask AI, the selected text should be included as context, but currently it's not working
    - **How**:
        1. Debug text selection capture mechanism in reading interface
        2. Verify selected text is passed to QA panel state
        3. Ensure selected text is included in Perplexity API prompt
        4. Add visual indication when query includes selected text (highlight or badge)
        5. Implement "clear selection" functionality
        6. Test integration across different text selection scenarios
- **Resources Required**:
    - **Materials**: Selection API, state management
    - **Personnel**: Frontend developer (3-4 hours)
    - **Reference Codes/docs**:
        - `src/app/(main)/read-book/page.tsx` (text selection handling, search for "selectedText")
        - `src/lib/perplexity-client.ts` lines 326-328 (selectedText in prompt)
        - Selection API documentation
- **Deliverables**:
    - [ ] Fixed text selection capture
    - [ ] Selected text passed to QA panel correctly
    - [ ] Selected text included in API prompt
    - [ ] Visual indicator for queries with context
    - [ ] "Clear selection" functionality
    - [ ] Comprehensive testing of selection scenarios
- **Dependencies**: None
- **Constraints**: Must handle various text selection types (single word, paragraph, multiple paragraphs)
- **Completion Status**: ⏳ Pending
- **Notes**: Consider showing selected text preview in input area before submitting

---

## Testing & Quality Assurance

### [ ] **Task QA.1**: Comprehensive UI/UX Testing
- **Task Name**: End-to-End QA Testing for All Improvements
- **Work Description**:
    - **Why**: Ensure all 13 improvements work correctly individually and together without regression
    - **How**:
        1. Create test cases for each of the 13 issues
        2. Perform manual testing across different browsers (Chrome, Firefox, Safari, Edge)
        3. Test responsive behavior (mobile, tablet, desktop)
        4. Verify accessibility compliance (keyboard navigation, screen readers)
        5. Performance testing (load time, streaming smoothness)
        6. Cross-theme testing (light/dark mode)
        7. Edge case testing (long messages, many citations, network failures)
- **Resources Required**:
    - **Materials**: Testing checklist, browser testing tools, accessibility audit tools
    - **Personnel**: QA engineer + Frontend developer (6-8 hours)
    - **Reference Codes/docs**:
        - All improved components
        - Reference images for visual comparison
        - WCAG 2.1 AA guidelines
- **Deliverables**:
    - [ ] Test case documentation for all 13 improvements
    - [ ] Test execution report with screenshots
    - [ ] Bug reports for any issues found
    - [ ] Accessibility audit report
    - [ ] Performance benchmark results
    - [ ] Final sign-off approval
- **Dependencies**: All Phase 1-7 tasks completed
- **Constraints**: Must achieve >95% test coverage for modified components
- **Completion Status**: ⏳ Pending
- **Notes**: Use browser DevTools and Lighthouse for performance/accessibility audits

### [ ] **Task QA.2**: User Acceptance Testing
- **Task Name**: Validate Improvements with User Feedback
- **Work Description**:
    - **Why**: Ensure improvements actually solve user pain points and enhance UX
    - **How**:
        1. Recruit 5-10 test users (target audience: Red Mansion literature learners)
        2. Prepare UAT scenarios covering all 13 improvements
        3. Conduct moderated testing sessions (30-45 minutes each)
        4. Collect quantitative metrics (task completion time, error rate)
        5. Gather qualitative feedback (user satisfaction, pain points)
        6. Analyze results and identify remaining issues
        7. Implement critical fixes based on feedback
- **Resources Required**:
    - **Materials**: UAT script, feedback forms, screen recording tools
    - **Personnel**: UX researcher, Product manager, 5-10 test users
    - **Reference Codes/docs**:
        - UAT scenario templates
        - User feedback analysis frameworks
- **Deliverables**:
    - [ ] UAT plan and scenarios
    - [ ] Recruited test users
    - [ ] Conducted testing sessions (recorded)
    - [ ] Quantitative metrics report
    - [ ] Qualitative feedback synthesis
    - [ ] Prioritized list of additional improvements
    - [ ] Critical fixes implemented
- **Dependencies**: Task QA.1 (comprehensive testing completed)
- **Constraints**: Must complete within 1-2 weeks of QA.1 completion
- **Completion Status**: ⏳ Pending
- **Notes**: Consider incentivizing participants with course credits or small rewards

---

## Implementation Timeline

### Week 1: Foundation & Critical Fixes
- **Days 1-2**: Phase 1 (Message Bubble & Layout Refinements)
- **Days 3-4**: Phase 2 (AI Response Flow Enhancement)
- **Day 5**: Phase 3 (Thinking Process Optimization) - Start

### Week 2: Core Features & Polish
- **Days 1-2**: Phase 3 (Thinking Process Optimization) - Complete
- **Days 3-5**: Phase 4 (Citation System Redesign)

### Week 3: Advanced Features & State Management
- **Days 1-2**: Phase 5 (Copy & Interaction Features)
- **Days 3-5**: Phase 6 (Conversation State Management)

### Week 4: Performance & Integration
- **Days 1-3**: Phase 7 (Performance & Context Integration)
- **Days 4-5**: Testing & QA (Task QA.1)

### Week 5: Validation & Refinement
- **Days 1-3**: User Acceptance Testing (Task QA.2)
- **Days 4-5**: Final fixes and deployment preparation

**Total Estimated Duration**: 5 weeks (25 working days)

---

## Success Metrics

### Quantitative Metrics
- [ ] User message bubble width reduced to ≤80% of container
- [ ] AI avatar appears within 100ms of query submission
- [ ] Thinking text size reduced to 12-14px (from 16px)
- [ ] Citation click-through rate increases by 30%+
- [ ] Conversation retention rate (panel reopen) increases by 50%+
- [ ] AI response time reduced by 20%+ (or documented as optimal)
- [ ] Zero regressions in existing functionality

### Qualitative Metrics
- [ ] User satisfaction score improves (>4.0/5.0 rating)
- [ ] Positive feedback on citation hover UX
- [ ] Users successfully use copy functionality
- [ ] Users appreciate dynamic conversation titles
- [ ] Selected text context integration works intuitively

### Technical Metrics
- [ ] All TypeScript type errors resolved
- [ ] Test coverage maintained at >70% for modified components
- [ ] Accessibility audit passes WCAG 2.1 AA
- [ ] Performance budget met (Time to Interactive <3s, First Contentful Paint <1.5s)
- [ ] No console errors or warnings in production

---

## Risk Mitigation

### High-Risk Items
1. **Citation System Redesign (Phase 4)** - Major architectural change
   - **Mitigation**: Implement feature flag to toggle between old/new citation systems
   - **Rollback Plan**: Keep old CitationDisplay component as fallback

2. **Conversation Persistence (Task 6.1)** - localStorage reliability issues
   - **Mitigation**: Implement try-catch with fallback to in-memory storage
   - **Rollback Plan**: Graceful degradation to non-persistent mode

3. **Performance Optimization (Task 7.1)** - May not find significant improvements
   - **Mitigation**: Set realistic performance targets based on Perplexity API limits
   - **Rollback Plan**: Document performance as "API-constrained" if no improvements found

### Medium-Risk Items
1. **Dynamic Title Generation (Task 6.2)** - NLP/AI complexity
   - **Mitigation**: Start with simple keyword extraction; enhance with AI if time permits
   - **Rollback Plan**: Use first 15 characters of user query as title

2. **Text Selection Context (Task 7.3)** - Complex debugging
   - **Mitigation**: Allocate extra debugging time; implement comprehensive logging
   - **Rollback Plan**: Add manual "paste selection" button as alternative

---

## Dependencies & Prerequisites

### External Dependencies
- [ ] Perplexity API access and quota confirmed
- [ ] Environment variables properly configured (PERPLEXITYAI_API_KEY)
- [ ] Favicon API or service selected for citation tooltips
- [ ] Chinese text processing library (Jieba.js) evaluated and installed if needed

### Internal Dependencies
- [ ] Design system components available (Badge, Tooltip, Button)
- [ ] Existing QA module codebase accessible and documented
- [ ] Development environment set up with all dependencies
- [ ] Staging environment available for testing

### Team Prerequisites
- [ ] Frontend developer assigned (full-time, 4-5 weeks)
- [ ] UX/UI designer available for consultation
- [ ] QA engineer allocated for testing phase
- [ ] Product manager for UAT coordination

---

## Rollout Strategy

### Phase 1: Internal Testing (Week 4)
- Deploy to development environment
- Internal team testing and feedback
- Bug fixes and refinements

### Phase 2: Beta Testing (Week 5)
- Deploy to staging environment with feature flag
- Limited user group testing (5-10 users)
- Collect feedback and iterate

### Phase 3: Gradual Rollout (Week 6)
- Enable for 25% of users (feature flag)
- Monitor metrics and errors
- Increase to 50% if stable

### Phase 4: Full Deployment (Week 7)
- Enable for 100% of users
- Monitor for 48 hours
- Final documentation update

---

## Post-Implementation Review

### Review Checklist
- [ ] All 13 issues resolved and verified
- [ ] Performance metrics documented
- [ ] User feedback incorporated
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Knowledge transfer completed

### Continuous Improvement
- [ ] Monitor user feedback channels for new issues
- [ ] Track analytics for feature adoption
- [ ] Plan follow-up improvements based on data
- [ ] Schedule quarterly UX review

---

## Appendix

### Reference Materials
- **Screenshots**:
  - `temp/qa_module_problem04.jpg` - User bubble width issue
  - `temp/qa_module_example.jpg` - Thinking process design reference
  - `temp/citationEg01.jpg` - Citation inline design
  - `temp/citationEg02.jpg` - Citation hover tooltip design
  - `temp/btn_reference.jpg` - Circular button design

### Related Documentation
- `docs/improvement_report/QA_Module/The QA Module of the Reading Book.md` - Original improvement analysis
- `src/components/ui/README.md` - Component library documentation
- `src/ai/README.md` - AI integration architecture

### Key Files Modified (Estimated)
- `src/components/ui/ConversationFlow.tsx` - Message bubble layout, copy button
- `src/components/ui/AIMessageBubble.tsx` - Avatar timing, thinking process
- `src/components/ui/ThinkingProcessIndicator.tsx` - Thinking text styling, collapse
- `src/components/ui/CitationDisplay.tsx` - Domain badge, hover tooltip
- `src/components/ui/StructuredQAResponse.tsx` - Citation integration
- `src/components/ui/badge.tsx` - Citation badge variants
- `src/app/(main)/read-book/page.tsx` - State management, text selection, streaming control
- `src/lib/perplexity-client.ts` - Performance instrumentation
- `src/lib/citation-processor.ts` - Domain extraction utilities
- `src/ai/perplexity-config.ts` - Rate limit configuration

---

**Document End**

*This improvement task plan is a living document and will be updated as tasks progress. Please refer to the project management system for real-time task status.*
