# Sommelier AI - MVP & Roadmap

## Project Vision
**Sommelier AI** is a Progressive Web App (PWA) designed to be a "pocket wine expert." It empowers users to scan any wine bottle label and instantly receive a comprehensive report containing vintage details, tasting notes, market pricing, and winery history.

## Current Status: MVP (Phase 1.6) - ✅ Polished
The current application successfully implements the core "Scan-to-Insight" loop, manual search fallback, and a premium visual identity.

### Key Features Implemented
1.  **Image Capture**: Users can upload a photo or use their device camera to capture a wine label.
2.  **Manual Search with Guidance**: 
    *   Users can manually type a wine name.
    *   **Smart Vintage Prompt**: A "Pro Tip" UI element encourages users to include the vintage year to ensure pricing accuracy.
3.  **Branding & Identity**:
    *   **Typography**: Implemented *Playfair Display* for headers (evoking luxury/wine labels) and *Plus Jakarta Sans* for UI readability.
    *   **Logo**: New composite logo combining a wine glass with sparkles to symbolize AI analysis.
4.  **AI Analysis (Multimodal)**: We utilize Google's **Gemini 3 Pro** models to process visual data (labels) or text queries.
5.  **Real-time Research**: The AI uses the `googleSearch` tool to fetch live data regarding:
    *   Current market prices.
    *   Recent awards and accolades.
    *   Winery history.
6.  **Structured Data Display**: The raw AI output is formatted into a clean, mobile-friendly UI.
7.  **Data Export**: Users can download a text file report ("All About Wine") to their local device.

## Roadmap

### Phase 2: Persistence & Experience (Next Up)
*   [ ] **Local History**: Save scanned wines to `localStorage` or `IndexedDB` so users can revisit previous scans without internet.
*   [ ] **Offline Mode**: Cache the app shell (Service Workers) to allow the UI to load without a connection.
*   [ ] **Edit Capability**: Allow users to manually correct AI-detected fields if they are slightly off.

### Phase 3: "Cellar" Features
*   [ ] **My Cellar**: A digital inventory management system.
*   [ ] **Favorites/Ratings**: Allow users to rate the wines they scan.
*   [ ] **Social Sharing**: Generate a shareable image card of the wine profile for Instagram/WhatsApp.

### Phase 4: Commercial Integration
*   [ ] **Buy Now Links**: Integrate with wine merchants to provide direct purchase links based on the identified bottle.