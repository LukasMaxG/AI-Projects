# Technical Architecture

## Tech Stack

*   **Framework**: React 19 (via `create-react-app` style entry)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (CDN-based for simplicity)
*   **Typography**: 
    *   Serif: *Playfair Display* (Headings)
    *   Sans: *Plus Jakarta Sans* (Body/UI)
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