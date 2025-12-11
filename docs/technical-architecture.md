# Technical Architecture

## Tech Stack

*   **Framework**: React 19 (via `create-react-app` style entry)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (CDN-based for simplicity)
*   **Typography**: 
    *   Serif: *Playfair Display* (Headings)
    *   Sans: *Inter* (Body/UI - Replaces Plus Jakarta Sans for improved readability)
*   **AI Provider**: Google Gemini API (`@google/genai` SDK)
*   **Icons**: Lucide React

## Architectural Decisions

### 1. Client-Side AI Orchestration
**Decision**: We call the Gemini API directly from the frontend client.
**Reasoning**:
*   Reduces latency by removing a middle-layer server.
*   Simplifies the MVP infrastructure (no backend required).
*   **Security Note**: In a production environment, this would be moved to a serverless function to protect the API Key.

### 2. Model Selection: `gemini-2.5-flash`
**Decision**: We utilize **Gemini 2.5 Flash** for both Text and Image tasks.
**Reasoning**:
*   **Performance**: Flash provides significantly lower latency (5-15s) compared to Pro models (30-60s), which is critical for a consumer-facing "instant scan" app.
*   **Efficiency**: Capable of handling the Google Search tool and complex JSON formatting without the computational overhead of the larger model.
*   **Multimodality**: Native support for image understanding allows for seamless label scanning.

### 3. Structured Output Strategy (JSON)
**Decision**: We instruct the model via `systemInstruction` to output raw JSON, and we perform a "soft cleaning" of the response string before parsing.
**Reasoning**:
*   Ensures the UI renders consistently.
*   We rely on prompt engineering ("strict JSON") and a `try-catch` block in `geminiService.ts` rather than strict schema validation, as schema validation can sometimes conflict with Search Tool outputs in the current API version.

### 4. Zero-Backend Data Export
**Decision**: The "Export to Docs" feature generates a Blob URL (HTML/Text) entirely in the browser.
**Reasoning**:
*   Keeps the app offline-capable for this specific feature.
*   No server storage costs for generated reports.

### 5. Mobile-First UI
**Decision**: The layout uses safe-area padding, large touch targets (Floating Action Button), and mobile-optimized fonts.
**Reasoning**:
*   The primary use case is scanning a bottle while standing in a store or at a dinner table.

### 6. Unified Data Pipeline
**Decision**: Both `analyzeWineLabel` (Image) and `searchWineByName` (Text) map to the exact same `WineData` interface and use the same `parseResponse` utility.
**Reasoning**:
*   Reduces code duplication.
*   Ensures the UI component (`WineDisplay`) works identically regardless of how the user initiated the search.

### 7. Zero-Dependency Visualization
**Decision**: We implemented the `VintageChart` using raw **SVG** and React state, rather than installing a charting library (like Recharts or Chart.js).
**Reasoning**:
*   **Performance**: Keeps the bundle size extremely small (saving ~30-100kb).
*   **Control**: Allows for pixel-perfect custom styling (gradients, glowing lines) that matches the app's premium aesthetic exactly.
*   **Simplicity**: We only need one specific type of chart (Area/Line), making a full library overkill.

### 8. Deep-Dive Data Modeling
**Decision**: The `WineData` type uses nested objects (e.g., `TerroirData`, `CriticScore[]`, `LegendaryVintage[]`) rather than long text description strings.
**Reasoning**:
*   **UI Flexibility**: Allows us to render specific data points as "badges" (e.g., "Organic" tag), icons (Soil types), or Cards (Vintage Awards) rather than just dumping a paragraph of text.
*   **AI Instruction**: Forcing the AI to fill these specific buckets ensures it actually performs the research for each specific aspect (Soil, Oak, Critics).
*   **Backward Compatibility**: The code includes checks (e.g., `typeof v === 'string'`) to gracefully handle older history items stored before the data model was upgraded.

### 9. Multi-Source Heuristic Image Search
**Decision**: Instead of asking for a single image URL, we instruct the AI to generate a list of 4-6 "Candidate URLs" from specific high-probability sources.
**Reasoning**:
*   **Reliability**: Hotlinking protection and 404s are common with web images. A single source has a high failure rate.
*   **Optimization**: We reduced this from 10 to ~5 to improve generation speed while maintaining enough redundancy for the retry logic.

### 10. Client-Side Persistence (Favorites & History)
**Decision**: We utilize browser `localStorage` to manage the "Favorites" and "Recent History" collections.
**Reasoning**:
*   **Immediate Availability**: Data is available instantly on app load without network requests.
*   **Privacy**: User data remains entirely on their device.
*   **Simplicity**: Avoids the complexity of user authentication and database schemas for the MVP phase.