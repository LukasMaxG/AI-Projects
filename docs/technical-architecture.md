# Technical Architecture

## Tech Stack

*   **Framework**: React 19
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI Provider**: Google Gemini API (`@google/genai` SDK)
*   **Icons**: Lucide React

## Architectural Decisions

### 1. Client-Side AI Orchestration
**Decision**: Direct Gemini API calls from the client for minimal latency.
**Model**: `gemini-3-flash-preview` chosen for the optimal balance of speed (under 15s) and grounding accuracy.

### 2. Decoupled UI Feedback (Toast System)
**Decision**: A standalone `Toast.tsx` component managed by a centralized hook-like pattern in `App.tsx`.
**Reasoning**:
*   **User Flow**: Standard browser `alerts` break the "luxury" immersion. Toasts allow users to continue interacting while receiving feedback.
*   **Consistency**: Centralized state ensures multiple notifications queue correctly without overlapping.

### 3. High-Fidelity Social Assets (Tasting Cards)
**Decision**: Implementing a dedicated "Digital Tasting Card" as a modal component.
**Reasoning**:
*   **Social Proof**: Encourages app virality by providing users with a beautiful asset they *want* to share.
*   **Web Share API**: Uses native OS sharing features where available, falling back to clipboard copy for broad compatibility.

### 4. Advanced Analytics Memoization
**Decision**: Use React `useMemo` for all cellar statistics (valuation, readiness, diversity).
**Reasoning**:
*   **Performance**: Prevents expensive calculation loops on every render, especially as user cellars grow to 100+ items.
*   **Data Integrity**: Statistics stay perfectly in sync with the `localStorage` state.

### 5. Structured Output Strategy (JSON)
**Decision**: Instruction-driven JSON output with heuristic cleaning.
**Model Config**: `responseMimeType: "application/json"` with `googleSearch` tools enabled.

### 6. Domain-Specific Visualization (SVG)
**Decision**: Custom SVG charts for "Vintage Comparison" (Line) and "Grape Blend" (Donut).
**Reasoning**: 
*   Matches the premium "editorial" brand without the weight of 3rd-party charting libraries.

### 7. Hybrid Persistence Model
**Decision**: `WineData` acts as a unified container for AI-fetched facts and User-mutated data (`userRating`, `userNotes`).
**Benefit**: Personal data travels with the wine record during exports and shared tasting cards.

### 8. Mobile-First Luxury UI
**Decision**: Usage of champagne/wine color palettes, Playfair Display serif typography, and tactile feedback (scale-95 active states).
**Reasoning**: Simulates the feeling of a premium physical cellar book or high-end lifestyle magazine.