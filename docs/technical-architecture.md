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

### 2. Model Selection: `gemini-3-pro-preview`
**Decision**: We specifically utilize the **Pro** variant of the Gemini 3 model for both Text and Image tasks.
**Reasoning**:
*   **Complex Reasoning**: Identifying obscure wine labels requires high-level reasoning capabilities.
*   **Tool Use**: The **Pro** model has superior support for the `googleSearch` tool, which is critical for finding accurate *current* market prices.
*   **Multimodality**: Excellent OCR and image understanding to read cursive or stylized fonts.

### 3. Structured Output Strategy (JSON)
**Decision**: We instruct the model via `systemInstruction` to output raw JSON, and we perform a "soft cleaning" of the response string before parsing.
**Reasoning**:
*   Ensures the UI renders consistently.
*   We rely on prompt engineering ("strict JSON") and a `try-catch` block in `geminiService.ts` rather than strict schema validation, as schema validation can sometimes conflict with Search Tool outputs in the current API version.

### 4. Zero-Backend Data Export
**Decision**: The "Download" feature generates a Blob URL in the browser.
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
**Decision**: The `WineData` type uses nested objects (e.g., `TerroirData`, `CriticScore[]`) rather than long text description strings.
**Reasoning**:
*   **UI Flexibility**: Allows us to render specific data points as "badges" (e.g., "Organic" tag) or icons (Soil types) rather than just dumping a paragraph of text.
*   **AI Instruction**: Forcing the AI to fill these specific buckets ensures it actually performs the research for each specific aspect (Soil, Oak, Critics).