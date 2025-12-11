# Sommelier AI - MVP & Roadmap

## Project Vision
**Sommelier AI** is a Progressive Web App (PWA) designed to be a "pocket wine expert." It empowers users to scan any wine bottle label and instantly receive a comprehensive report containing vintage details, tasting notes, market pricing, and winery history.

## Current Status: MVP (Phase 2.7) - ✅ Education & Context
The application has evolved into a "Wine Educator," moving beyond raw data to provide cultural context, pronunciation guides, and label decoding.

### Key Features Implemented

#### 1. Education & Context (Phase 2.7 New)
*   **Winography-Style Primer**: A dedicated "Education" section inspired by modern wine learning platforms.
*   **The "Vibe" Analogy**: AI generates a relatable 1-sentence analogy (e.g., "Think of this region like the 'Texas of Italy'").
*   **Label Decoder**: Automatically identifies and defines technical jargon on the label (e.g., *Riserva*, *Sur Lie*) in plain English.
*   **Pronunciation Guide**: Displays the native spelling alongside a phonetic breakdown (e.g., *Chianti -> Key-AHN-tee*).
*   **Terroir Snapshot**: Visualizes climate and geography using icons (Sun/Mountain) to explain *why* the wine tastes that way.

#### 2. Performance & Latency
*   **Gemini 2.5 Flash Migration**: Switched from Pro to Flash model, reducing analysis time from ~60s to **under 15s**.
*   **Token Optimization**: Streamlined system instructions and reduced candidate generation counts to minimize processing overhead.

#### 3. Premium User Experience
*   **4-Zone Layout**: Structured content into "Snapshot", "Sensory", "Analysis", and "Explorer" zones.
*   **Visual Analysis**: Progress bars for wine style (Body/Tannin/Acidity) and color-coded flavor tags.
*   **Smart Blend Visualization**: Dynamic SVG Donut Chart showing grape varietal composition percentages.
*   **Vivino-Style Ratings**: Converts 100-point critic scores into a relatable **5-Star Value Scale**.

#### 4. Personalization
*   **My Palate**: Users can rate wines (1-5 stars) and add personal tasting notes.
*   **Data Persistence**: Ratings and notes are saved locally to the device, updating the History and Favorites lists in real-time.

#### 5. Advanced Intelligence
*   **The Sommelier's Pivot**: AI-powered recommendations suggesting 2 similar wines (Similar Style & Hidden Gem).
*   **Legendary Vintages**: Rich cards displaying specific years, tasting context, and award badges.
*   **Vintage Chart**: Custom SVG Line Graph with trend lines and average benchmarks for quality analysis.
*   **Detailed Value Projection**: AI-generated investment analysis based on market trends with specific "Investment Grade" assessment.

#### 6. Robust Connectivity
*   **Targeted Image Search**: Optimized heuristic searches 4-6 specific high-probability databases (WineLibrary, etc.).
*   **Direct Access**: Deep links to official winery websites and Google Maps.
*   **Smart Fallback**: Auto-cycles through image candidates before showing a placeholder.

## Roadmap

### Phase 3: Audio & Interaction (Refinement)
*   [ ] **Audio TTS**: Add a "Play" button to the Pronunciation section to hear the name spoken (using SpeechSynthesis API).
*   [ ] **Voice Input**: Allow users to dictate their "Tasting Notes" instead of typing.

### Phase 4: Offline & Performance
*   [ ] **Service Workers**: Cache the app shell for instant loading.
*   [ ] **Offline Database**: Upgrade from `localStorage` to `IndexedDB` for larger image caching.

### Phase 5: Social & Commercial
*   [ ] **Social Sharing**: Generate a shareable image card of the wine profile for Instagram/WhatsApp.
*   [ ] **Buy Now Links**: Integrate with wine merchants to provide direct purchase links based on the identified bottle.
