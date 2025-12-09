# Technical Architecture

## Tech Stack

*   **Framework**: React 19 (via `create-react-app` style entry)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (CDN-based for simplicity in this environment)
*   **AI Provider**: Google Gemini API (`@google/genai` SDK)
*   **Icons**: Lucide React

## Architectural Decisions

### 1. Client-Side AI Orchestration
**Decision**: We call the Gemini API directly from the frontend client.
**Reasoning**:
*   Reduces latency by removing a middle-layer server.
*   Simplifies the MVP infrastructure (no backend required).
*   **Security Note**: In a production environment, this would be moved to a serverless function (e.g., Firebase Functions or Cloudflare Workers) to protect the API Key. For this MVP, we assume the environment injects `process.env.API_KEY`.

### 2. Model Selection: `gemini-3-pro-preview`
**Decision**: We specifically utilize the **Pro** variant of the Gemini 3 model.
**Reasoning**:
*   **Complex Reasoning**: Identifying obscure wine labels requires high-level reasoning capabilities that "Flash" models sometimes miss.
*   **Tool Use**: The **Pro** model has superior support for the `googleSearch` tool, which is critical for finding accurate *current* market prices and validating the vintage.
*   **Multimodality**: Excellent OCR and image understanding to read cursive or stylized fonts often found on wine labels.

### 3. Structured Output Strategy (JSON)
**Decision**: We instruct the model via `systemInstruction` to output raw JSON, and we perform a "soft cleaning" of the response string before parsing.
**Reasoning**:
*   Ensures the UI renders consistently.
*   We enable `googleSearch` as a tool, but we do not use `responseSchema` validation strictly in the config because it sometimes conflicts with search tool outputs in the current API version. Instead, we rely on prompt engineering ("strict JSON") and a `try-catch` block in `geminiService.ts`.

### 4. Zero-Backend Data Export
**Decision**: The "Download" feature generates a Blob URL in the browser.
**Reasoning**:
*   Keeps the app offline-capable for this specific feature.
*   No server storage costs for generated reports.

### 5. Mobile-First UI
**Decision**: The layout uses safe-area padding and large touch targets (Floating Action Button).
**Reasoning**:
*   The primary use case is scanning a bottle while standing in a store or at a dinner table.
