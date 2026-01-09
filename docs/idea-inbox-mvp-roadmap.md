# Sommelier AI - MVP & Roadmap

## Project Vision
**Sommelier AI** is a Progressive Web App (PWA) designed to be a "pocket wine expert." It empowers users to scan any wine bottle label and instantly receive a comprehensive report containing vintage details, tasting notes, market pricing, and winery history.

## Current Status: UX & Navigation Polish (Phase 3.1) - ✅ COMPLETED
The application has moved beyond a simple data tool into a polished lifestyle companion with social features and deep cellar insights.

### Key Features Implemented

#### 1. Social Sharing: Digital Tasting Cards
*   **Shareable Aesthetics**: A high-fidelity "Digital Tasting Card" that summarizes the wine's essence in a beautiful, screenshot-ready format.
*   **Native Sharing**: Integration with the Web Share API for instant delivery to Instagram, WhatsApp, or iMessage.

#### 2. Visual Aesthetic & Consistency (Phase 3.1)
*   **Burgundy Theming**: Updated all section headers and sensory labels to use the signature dark burgundy (`wine-900`).
*   **Modern Placeholders**: Replaced stock fallback images with sleek, custom SVG bottle placeholders for wines without available online photos.
*   **Enhanced Navigation**: Added quick-access buttons to analysis results ("Back to Search", "View My Cellar") to improve the user flow.

#### 3. Luxury UX & Feedback
*   **Luxury Toast System**: Custom-designed, non-blocking "Toasts" that match the velvet/champagne aesthetic.
*   **Animated Transitions**: Smooth slide-down and scale effects for all UI components.

#### 4. Advanced Cellar Analytics
*   **Portfolio Valuation**: Real-time estimation of total cellar value.
*   **Readiness Tracker**: Identifies bottles currently in their "Peak Maturity" window.
*   **Diversity Metrics**: Analyzes cellar composition across regions and styles.

## Roadmap

### Phase 4: Audio & Interaction (Refinement)
*   [ ] **Audio TTS**: Implement "Listen" feature to hear native pronunciations of complex wine names using Gemini TTS.
*   [ ] **Voice-to-Note**: Allow dictation for the "Personal Notes" section using native speech-to-text.
*   [ ] **Interactive Sommelier**: AI chat to ask follow-up questions about a specific bottle (e.g., "Is this too dry for salmon?").

### Phase 5: Offline & Performance
*   [ ] **Service Workers**: Implement full offline shell caching for use in underground cellars.
*   [ ] **IndexedDB**: Transition from `localStorage` to a more robust local database for high-volume collection management.

### Phase 6: Commercial & Community
*   [ ] **Merchant Integration**: Connect identified bottles to nearby merchants or Drizly/Wine.com.
*   [ ] **Community Scores**: View ratings from other Sommelier AI users.

*Copyright www.MagmaTek.com*
