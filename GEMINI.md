# React Native Best Practices for Gemini Integration

When integrating Gemini with React Native, combine general React Native performance practices with specific considerations for AI/ML models. This document reflects the current **Google Gen AI SDK (`@google/genai`)**, which reached GA in May 2025 and supersedes the deprecated `@google/generative-ai` legacy SDK.

> **Migration note:** `@google/generative-ai` is deprecated as of November 30, 2025 and no longer actively maintained. Migrate to `@google/genai`.

## React Native Performance Best Practices

### Component Optimization
*   **Memoization:** Utilize `React.memo` for functional components to prevent unnecessary re-renders when props haven't changed. Use it judiciously, as it can introduce overhead if not truly beneficial.
*   **Avoid Inline Functions:** Define functions outside the render method or use `useCallback` to memoize them, preventing new instances from being created on every re-render.
*   **Minimize Bridge Communication:** Reduce frequent JS-to-native thread communication, as this is a common performance bottleneck.

### List Optimization
*   For large datasets, always use `FlatList` (or `FlashList` for better performance) instead of `ScrollView`.

### Image Optimization
*   Use `expo-image` for built-in caching, blurhash placeholders, and better memory management.
*   Optimize resolution and format before passing images to multimodal Gemini requests.

### Code and Bundle Size Optimization
*   **Bundle Reduction:** Minimize the JS bundle size through lazy loading and removing unused dependencies.
*   **Hermes Engine:** Enable Hermes for improved startup time, reduced memory usage, and smaller app size.
*   **Remove Console Statements:** Strip all `console.log` statements from production builds.

### State Management
*   Choose an efficient solution (e.g., Zustand) and avoid storing large AI response objects directly in global state. Prefer derived/computed values.

## Gemini Integration Best Practices

### SDK Installation

Install the current GA SDK:

```bash
npm install @google/genai
```

Initialize a single centralized client (do not reinstantiate per request):

```typescript
import { GoogleGenAI } from '@google/genai';

// Initialize once, outside components/handlers
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

All features are accessed through the client's submodules:
- `ai.models` — generate content, stream, embeddings
- `ai.chats` — stateful multi-turn conversations
- `ai.files` — upload files for multimodal prompts
- `ai.caches` — context caching for cost reduction
- `ai.live` — real-time audio/video/text sessions

### Recommended Models (2025–2026)
*   **`gemini-2.5-flash`** — best balance of speed, cost, and capability; recommended default.
*   **`gemini-2.5-pro`** — highest capability with 1M token context; use for complex reasoning tasks.
*   **`gemini-2.0-flash`** — fast and efficient for simpler tasks.

### API Key Management and Security
*   **Never expose API keys in client-side or React Native code.** The app bundle can be reverse-engineered.
*   **Server-Side Proxy:** Route all Gemini calls through a secure backend (e.g., Firebase Functions, a REST API). The React Native app calls your backend, which calls the Gemini API.
*   **Firebase AI Logic** is the recommended approach for mobile apps — it handles auth, key management, and server-side calls securely.
*   **Data Privacy:** Anonymize sensitive user data before including it in prompts.

### Generating Content

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Your prompt here',
});
console.log(response.text);
```

### Streaming Responses

Use streaming for long-form content to show results progressively:

```typescript
const stream = await ai.models.generateContentStream({
  model: 'gemini-2.5-flash',
  contents: 'Write a detailed summary...',
});

for await (const chunk of stream) {
  console.log(chunk.text); // update UI incrementally
}
```

### Multi-turn Chat

```typescript
const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
const response = await chat.sendMessage({ message: 'Hello!' });
console.log(response.text);
```

### Multimodal Inputs (Image + Text)

For React Native, convert images to base64 before sending:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [
    { text: 'Describe this image:' },
    { inlineData: { mimeType: 'image/jpeg', data: base64ImageString } },
  ],
});
```

### Thinking / Reasoning

For complex tasks, enable Gemini's built-in reasoning:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Solve this step by step...',
  config: { thinkingConfig: { thinkingBudget: 1024 } },
});
```

### Function Calling

Allow Gemini to call your app functions:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Get the current user location.',
  config: {
    tools: [{ functionDeclarations: [myFunctionDeclaration] }],
  },
});
// Inspect response.functionCalls and dispatch accordingly
```

### Context Caching

Reduce costs when reusing a large prompt prefix across multiple requests:

```typescript
const cache = await ai.caches.create({
  model: 'gemini-2.5-flash',
  contents: [{ role: 'user', parts: [{ text: largeSystemContext }] }],
  ttl: '3600s',
});
// Reference cache.name in subsequent requests
```

### Error Handling and Reliability

The `@google/genai` SDK includes built-in **exponential backoff with jitter** for `429` (rate limit) and `5xx` errors. Configure retry attempts at client init:

```typescript
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    retryOptions: { attempts: 5 },
    timeout: 120_000,
  },
});
```

Only retry transient errors (`408`, `429`, `500`, `503`). Do **not** retry `400` (bad request) or `403` (permission denied).

*   **Graceful Degradation:** Show a user-friendly message when AI features are unavailable.
*   **Rate Limit Management:** Monitor usage to avoid hitting quota limits in production.

### Prompt Engineering
*   **Clarity:** Write explicit, well-structured prompts with clear instructions.
*   **Structured Outputs:** Request JSON or Markdown in the prompt to simplify parsing.
*   **Iteration:** Test and refine prompts; small wording changes can significantly affect output quality.

### Live API (Real-Time)

For real-time audio/video/text interactions, use `ai.live`:

```typescript
const session = await ai.live.connect({
  model: 'gemini-2.5-flash',
  config: { responseModalities: ['TEXT'] },
  callbacks: {
    onopen: () => console.log('Live session opened'),
    onmessage: (msg) => console.log(msg),
    onclose: (e) => console.log('Closed:', e.code),
  },
});
```

> **Note:** Avoid preview/dated Live API model versions in production (e.g., `native-audio-preview-12-2025` has known instability). Prefer stable releases or the `-09-2025` variant until a stable GA model is available.

### Performance for AI/ML
*   **Timeouts:** Set `timeout` in `httpOptions` — Gemini responses can be slower than typical API calls.
*   **On-Device AI:** Suitable for strict privacy or offline needs, but cloud API is preferred for access to the latest models.
*   **Lazy Loading:** Only initialize the Gemini client when AI features are first needed to reduce startup time.

### Testing and Monitoring
*   Test AI features for accuracy, edge cases, and performance across devices and network conditions.
*   Monitor latency and error rates; update model versions or prompts as Google releases improvements.
*   For React Native, test AI-dependent flows on both Android and iOS since network behavior may differ.
