# Sommelier AI - MVP & Roadmap

## Project Vision
**Sommelier AI** is a Progressive Web App (PWA) designed to be a "pocket wine expert." It empowers users to scan any wine bottle label and instantly receive a comprehensive report containing vintage details, tasting notes, market pricing, and winery history.

## Current Status: MVP (Phase 2.4) - ✅ Personalization & Refinement
The application has moved beyond simple analysis to become a personalized tool with the addition of "Favorites" and smarter market context.

### Key Features Implemented
1.  **Image & Text Search**:
    *   **Dual Input**: Users can scan labels (Vision) or type names (Text).
    *   **Smart Vintage Prompt**: Interactive UI tip encouraging users to specify years.
2.  **Premium User Experience**:
    *   **4-Zone Layout**: Structured content into "Snapshot", "Sensory", "Analysis", and "Explorer" zones for better cognitive load management.
    *   **Editorial Typography**: "Magazine-quality" reading experience using *Inter* and *Playfair Display*.
    *   **Visual Analysis**: Progress bars for wine style (Body/Tannin/Acidity) and color-coded flavor tags.
3.  **Advanced Intelligence**:
    *   **Value Rating**: Converts 100-point critic scores into a relatable **5-Star Value Scale** (Vivino-style) with "Good Value" / "Iconic" badges.
    *   **Legendary Vintages**: Rich cards displaying specific years, tasting context, and award badges.
    *   **Vintage Chart**: Custom SVG Area Chart visualizing quality trends and drinking windows.
    *   **Investment Data**: ROI projections and peak maturity timelines.
4.  **Robust Connectivity**:
    *   **Multi-Source Image Search**: AI now scans 8-10 specific databases (WineLibrary, Total Wine, Wiki, etc.) to generate a list of candidate images, dramatically reducing broken links.
    *   **Direct Access**: Deep links to official winery websites and Google Maps for region visualization.
    *   **Smart Fallback**: Auto-cycles through image candidates before showing a placeholder.
5.  **Persistence & Export**:
    *   **Favorites (My Cellar)**: Users can save wines to a dedicated "Favorites" list that persists locally.
    *   **Export to Docs**: Generates formatted, rich HTML reports ready for pasting into Google Docs/Word.
    *   **Local History**: "Recent Discoveries" are auto-saved to the device.

## Roadmap

### Phase 3: Education & Accessibility (Next Priority)
*   [ ] **Audio Pronunciation**: Text-to-Speech feature to teach users how to pronounce complex French/Italian wine names.
*   [ ] **Glossary Tooltips**: Tap on technical terms (e.g., "Malolactic Fermentation", "Tannins") to see simple definitions.

### Phase 4: Offline & Performance
*   [ ] **Service Workers**: Cache the app shell for instant loading.
*   [ ] **Offline Database**: Upgrade from `localStorage` to `IndexedDB` for larger image caching.

### Phase 5: Social & Commercial
*   [ ] **Social Sharing**: Generate a shareable image card of the wine profile for Instagram/WhatsApp.
*   [ ] **Buy Now Links**: Integrate with wine merchants to provide direct purchase links based on the identified bottle.