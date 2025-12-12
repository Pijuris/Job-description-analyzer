# Gemini API Integration Strategy

The core intelligence of this application relies on **Google Gemini 3.0 Pro** via the `@google/genai` SDK.

## Model Selection: `gemini-3-pro-preview`

We selected the 3.0 Pro model specifically for its **Reasoning (Thinking) Capabilities**.

Analyzing a job description requires nuance. For example, "Customer Service" could be E0 (in-person sympathy) or E1 (chatbot automation) depending on context. Standard LLMs often hallucinate or generalize this. 

Gemini 3.0 Pro's thinking process allows the model to "debate" the classification internally before outputting the final JSON.

## Configuration

### Thinking Budget
We utilize the `thinkingConfig` parameter to force deep consideration.

```typescript
thinkingConfig: {
  thinkingBudget: 32768, // Maximum budget for Gemini 3 Pro
}
```

This high budget ensures the model allocates sufficient tokens to break down complex tasks found in PDF job descriptions.

### Structured Outputs (JSON Schema)

We enforce a strict schema using the `responseSchema` configuration. This guarantees that the frontend never receives malformed data.

**Schema Highlights:**
- **Enums**: We strictly define `E0-E3` and `S0-S3` as enums in the schema. This prevents the model from inventing new categories.
- **Rationale Fields**: Every classification requires a `rationale` string. Forcing the model to explain *why* it chose a category improves the accuracy of the category selection itself (Chain of Thought).

### System Instructions

The system prompt acts as the "Subject Matter Expert" definition:

```plaintext
"You are a workforce transformation analyst expert... 
Analyze... tasks and skills based on GenAI exposure frameworks..."
```

## PDF Handling

The application supports PDF uploads by converting the file to a Base64 string client-side and passing it to Gemini's multimodal input.

```typescript
parts: [
  {
    inlineData: {
      mimeType: "application/pdf",
      data: base64Content,
    },
  },
  { text: "Analyze this job description PDF." }
]
```

This utilizes Gemini's native document understanding capabilities, which are superior to simple text extraction, as it preserves layout context (e.g., distinguishing between "Required Skills" and "Nice to Have").
