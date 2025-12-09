# Sommelier AI - MVP & Roadmap

## Project Vision
**Sommelier AI** is a Progressive Web App (PWA) designed to be a "pocket wine expert." It empowers users to scan any wine bottle label and instantly receive a comprehensive report containing vintage details, tasting notes, market pricing, and winery history.

## Current Status: MVP (Phase 2.1) - ✅ Deep Sommelier Analytics
The application has achieved "Master Sommelier" level depth, offering technical insights alongside consumer data.

### Key Features Implemented
1.  **Image & Text Search**:
    *   **Dual Input**: Users can scan labels (Vision) or type names (Text).
    *   **Smart Vintage Prompt**: Interactive UI tip encouraging users to specify years.
2.  **Premium Experience**:
    *   **Branding**: "Wine & Gold" aesthetic with *Playfair Display* typography.
    *   **Animations**: Smooth transitions and loading states.
3.  **Advanced Intelligence (The "Sommelier" Upgrade)**:
    *   **Critic Scores**: Aggregates specific ratings (RP, WS, JS) with visual badges.
    *   **Terroir Analysis**: Dedicated cards for Soil composition, Oak regimen, and Farming methods.
    *   **Vintage Comparison**: Custom SVG Area Chart visualizing quality trends over time.
    *   **Investment Data**: Drinking windows, peak maturity years, and value projections.
    *   **Service**: Specific glassware recommendations (e.g., Bordeaux vs. Burgundy glass), decanting times, and temperature.
    *   **Winery History & Origins**: Deep dive into the estate's background and "Legendary Years" (Best Vintages).
    *   **Trivia**: "Did you know?" facts about the wine.
4.  **Real-time Research**: Uses `googleSearch` tool for live market prices.
5.  **Data Export**: Download textual reports.

## Roadmap

### Phase 2b: Education & Accessibility (Next Priority)
*   [ ] **Audio Pronunciation**: Text-to-Speech feature to teach users how to pronounce complex French/Italian wine names.
*   [ ] **Glossary Tooltips**: Tap on technical terms (e.g., "Malolactic Fermentation", "Tannins") to see simple definitions.

### Phase 3: Persistence & Experience
*   [ ] **Local History**: Save scanned wines to `localStorage` or `IndexedDB` so users can revisit previous scans without internet.
*   [ ] **Offline Mode**: Cache the app shell (Service Workers) to allow the UI to load without a connection.
*   [ ] **Edit Capability**: Allow users to manually correct AI-detected fields if they are slightly off.

### Phase 4: "Cellar" Features
*   [ ] **My Cellar**: A digital inventory management system.
*   [ ] **Favorites/Ratings**: Allow users to rate the wines they scan.
*   [ ] **Social Sharing**: Generate a shareable image card of the wine profile for Instagram/WhatsApp.

### Phase 5: Commercial Integration
*   [ ] **Buy Now Links**: Integrate with wine merchants to provide direct purchase links based on the identified bottle.