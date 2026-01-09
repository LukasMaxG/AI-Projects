# Sommelier AI - MVP & Roadmap

## Project Vision
**Sommelier AI** is a Progressive Web App (PWA) designed to be a "pocket wine expert." It empowers users to scan any wine bottle label and instantly receive a comprehensive report containing vintage details, tasting notes, market pricing, and winery history.

## Current Status: Refinement & Analytics (Phase 3.0) - ✅ COMPLETED
The application has moved beyond a simple data tool into a polished lifestyle companion with social features and deep cellar insights.

### Key Features Implemented

#### 1. Social Sharing: Digital Tasting Cards (Phase 3.0 New)
*   **Shareable Aesthetics**: A high-fidelity "Digital Tasting Card" that summarizes the wine's essence in a beautiful, screenshot-ready format.
*   **Native Sharing**: Integration with the Web Share API for instant delivery to Instagram, WhatsApp, or iMessage.
*   **Visual Snapshot**: Combines the winery image with key stats (Rating, Body, ABV) and aromatic notes in a branded overlay.

#### 2. Luxury UX & Feedback (Phase 3.0 New)
*   **Luxury Toast System**: Replaced intrusive browser alerts with custom-designed, non-blocking "Toasts" that match the velvet/champagne aesthetic.
*   **Animated Transitions**: Smooth slide-down and fade effects for all UI feedback loops.

#### 3. Advanced Cellar Analytics (Phase 3.0 New)
*   **Portfolio Valuation**: Real-time estimation of total cellar value based on acquisition prices and market data.
*   **Readiness Tracker**: Automatically identifies bottles currently in their "Peak Maturity" window.
*   **Diversity Metrics**: Analyzes cellar composition to show region dominance and style diversity (e.g., "7 Styles Across 3 Regions").

#### 4. Education & Context (Phase 2.7)
*   **Winography-Style Primer**: Dedicated sections for climate, geography, and native pronunciations.
*   **Label Decoder**: Definitions for technical jargon (e.g., *Riserva*, *Sur Lie*).

#### 5. High-Performance Analysis
*   **Gemini 3 Integration**: Analysis times under 15s using the latest Flash models.
*   **Google Search Grounding**: Live data verification for market prices and winery history.

## Roadmap

### Phase 4: Audio & Interaction (Refinement)
*   [ ] **Audio TTS**: Implement "Listen" feature to hear native pronunciations of complex wine names.
*   [ ] **Voice-to-Note**: Allow dictation for the "Personal Notes" section.

### Phase 5: Offline & Performance
*   [ ] **Service Workers**: Implement full offline shell caching for store use-cases.
*   [ ] **IndexedDB**: Transition from `localStorage` to a more robust local database for high-volume cellars.

### Phase 6: Commercial Integration
*   [ ] **Buy Now Links**: Connect identified bottles to nearby merchants or online retailers.
*   [ ] **Inventory Alerts**: Notify users when a bottle in their cellar enters its peak drinking window.