# Technical Architecture

## Tech Stack

*   **Framework**: React 19
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI Provider**: Google Gemini API (`@google/genai` SDK)
*   **Backend & Auth**: Firebase (Firestore & Authentication)
*   **Icons**: Lucide React

## Architectural Decisions

### 1. Client-Side AI Orchestration & Global Caching
**Decision**: Direct Gemini API calls from the client, heavily supplemented by a global Firestore cache.
**Model**: `gemini-3-flash-preview` chosen for the optimal balance of speed and grounding accuracy.
**Caching Strategy**: Before calling the AI, the app queries a global `wines` Firestore collection. If a wine was previously analyzed by *any* user, the cached JSON is returned instantly, bypassing the 10-15s AI generation time.

### 2. Real-Time Cloud Sync
**Decision**: Use Firebase Authentication and Firestore `onSnapshot` listeners.
**Reasoning**: 
*   Allows users to access their cellar inventory across multiple devices seamlessly.
*   Provides automatic local-to-cloud data migration for users upgrading from the unauthenticated `localStorage` fallback.

### 3. Decoupled UI Feedback (Toast System)
**Decision**: A standalone `Toast.tsx` component managed by a centralized hook-like pattern in `App.tsx`.
**Reasoning**:
*   **User Flow**: Standard browser `alerts` break the "luxury" immersion. Toasts allow users to continue interacting while receiving feedback.
*   **Consistency**: Centralized state ensures multiple notifications queue correctly without overlapping.

### 4. High-Fidelity Social Assets (Tasting Cards)
**Decision**: Implementing a dedicated "Digital Tasting Card" as a modal component.
**Reasoning**:
*   **Social Proof**: Encourages app virality by providing users with a beautiful asset they *want* to share.
*   **Web Share API**: Uses native OS sharing features where available, falling back to clipboard copy for broad compatibility.

### 5. Advanced Analytics Memoization
**Decision**: Use React `useMemo` for all cellar statistics (valuation, readiness, diversity).
**Reasoning**:
*   **Performance**: Prevents expensive calculation loops on every render, especially as user cellars grow to 100+ items.
*   **Data Integrity**: Statistics stay perfectly in sync with the Firestore state.

### 6. Structured Output Strategy (JSON)
**Decision**: Instruction-driven JSON output with heuristic cleaning.
**Model Config**: `responseMimeType: "application/json"` with `googleSearch` tools enabled, and `thinkingBudget: 0` to minimize latency.

### 7. Domain-Specific Visualization (SVG)
**Decision**: Custom SVG charts for "Vintage Comparison" (Line) and "Grape Blend" (Donut).
**Reasoning**: 
*   Matches the premium "editorial" brand without the weight of 3rd-party charting libraries.

### 8. Hybrid Persistence Model
**Decision**: `WineData` acts as a unified container for AI-fetched facts and User-mutated data (`userRating`, `userNotes`). Unauthenticated users fall back to `localStorage`, while authenticated users sync to Firestore.
**Benefit**: Personal data travels with the wine record during exports, shared tasting cards, and cross-device syncing.

### 9. Mobile-First Luxury UI
**Decision**: Usage of champagne/wine color palettes, Playfair Display serif typography, and tactile feedback (scale-95 active states).
**Reasoning**: Simulates the feeling of a premium physical cellar book or high-end lifestyle magazine.