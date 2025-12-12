# GenAI Transferability Analyzer

## Overview

The **GenAI Transferability Analyzer** is a specialized workforce intelligence tool designed to analyze job postings (Job Descriptions) and determine their susceptibility to Generative AI technologies. 

Unlike simple "will AI replace me" tools, this application uses a nuanced framework to distinguish between **Automation** (replacing tasks) and **Augmentation** (enhancing human capability).

It utilizes **Google's Gemini 3.0 Pro** with **Thinking Mode** to deeply reason about the nuances of specific job tasks and skills before classifying them.

## Features

- **Multi-Format Input**: Accepts raw text or PDF uploads of job descriptions.
- **Deep Reasoning Analysis**: Uses `gemini-3-pro-preview` with a high thinking budget to classify complex tasks accurately.
- **Structured Scoring Framework**:
  - **Task Exposure (E-Score)**: Measures how easily a task can be performed by LLMs.
  - **Skill Impact (S-Score)**: Classifies skills from "Irrelevant" to "Substitutable".
- **Visual Dashboard**: 
  - Automation vs. Augmentation Quadrant.
  - Exposure Distribution charts.
  - Interactive Task/Skill breakdown tables.
- **Strategic Recommendations**: Automatically generates actionable advice for Role Redesign, Reskilling, and Tech Integration.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **AI Model**: Google Gemini 3.0 Pro (`gemini-3-pro-preview`) via `@google/genai` SDK
- **Build/Runtime**: ES Modules (Browser-native imports)

## Quick Start

1. Ensure you have a valid Google GenAI API Key available in your environment (`process.env.API_KEY`).
2. The application runs entirely in the browser.
3. Upload a PDF or paste a Job Description.
4. Wait for the "Thinking" process to complete (this may take 10-20 seconds due to the depth of reasoning required).
5. Explore the generated report.

## Documentation

Detailed documentation can be found in the `docs/` folder:

- [Architecture](./docs/architecture.md)
- [Methodology & Scoring](./docs/methodology.md)
- [Gemini Integration Strategy](./docs/gemini_integration.md)
