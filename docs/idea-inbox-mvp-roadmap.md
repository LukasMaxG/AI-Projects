# Sommelier AI - MVP & Roadmap

## Project Vision
**Sommelier AI** is a Progressive Web App (PWA) designed to be a "pocket wine expert." It empowers users to scan any wine bottle label and instantly receive a comprehensive report containing vintage details, tasting notes, market pricing, and winery history.

## Current Status: MVP (Phase 2.6) - ✅ Personalization & Depth
The application has transitioned from a passive reference tool to an active tasting companion. Users can now rate wines, add notes, and explore intelligent recommendations.

### Key Features Implemented

#### 1. Performance & Latency
*   **Gemini 2.5 Flash Migration**: Switched from Pro to Flash model, reducing analysis time from ~60s to **under 15s**.
*   **Token Optimization**: Streamlined system instructions and reduced candidate generation counts to minimize processing overhead.

#### 2. Premium User Experience
*   **4-Zone Layout**: Structured content into "Snapshot", "Sensory", "Analysis", and "Explorer" zones.
*   **Visual Analysis**: Progress bars for wine style (Body/Tannin/Acidity) and color-coded flavor tags.
*   **Smart Blend Visualization (New)**: Dynamic SVG Donut Chart showing grape varietal composition percentages.
*   **Vivino-Style Ratings**: Converts 100-point critic scores into a relatable **5-Star Value Scale**.

#### 3. Personalization (New)
*   **My Palate**: Users can rate wines (1-5 stars) and add personal tasting notes.
*   **Data Persistence**: Ratings and notes are saved locally to the device, updating the History and Favorites lists in real-time.

#### 4. Advanced Intelligence
*   **The Sommelier's Pivot (New)**: AI-powered recommendations suggesting 2 similar wines (Similar Style & Hidden Gem).
*   **Legendary Vintages**: Rich cards displaying specific years, tasting context, and award badges.
*   **Vintage Chart**: Custom SVG Bar Chart visualizing discrete vintage quality scores for clearer comparison.
*   **Detailed Value Projection**: AI-generated investment analysis based on market trends (Vivino/WineSearcher) with specific "Investment Grade" assessment.

#### 5. Robust Connectivity
*   **Targeted Image Search**: Optimized heuristic searches 4-6 specific high-probability databases.
*   **Direct Access**: Deep links to official winery websites and Google Maps.
*   **Smart Fallback**: Auto-cycles through image candidates before showing a placeholder.

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
