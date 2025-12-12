# Scientific Methodology

This document outlines the frameworks used to calculate the "Transferability Index" and classify workforce tasks.

## 1. Task Exposure Framework (E-Score)

We classify every specific responsibility in a job description into one of four categories based on the capability of Large Language Models (LLMs) and Multimodal AI.

| Level | Label | Definition | Exposure Factor |
|-------|-------|------------|-----------------|
| **E0** | No Exposure | Tasks requiring physical manipulation, deep empathy, or sensory judgment. | 0.0 |
| **E1** | Direct LLM | Tasks that can be >50% automated/accelerated by text-based LLMs (e.g., writing, coding, summarizing). | 1.0 |
| **E2** | App-Based | Tasks requiring specialized software where AI acts as a "Copilot" (e.g., spreadsheet analysis, CAD design). | 0.5 |
| **E3** | Multimodal | Tasks requiring vision or audio processing capabilities (e.g., reviewing security footage, inspecting visual designs). | 0.3 |

## 2. Skill Classification Framework (S-Score)

Skills are analyzed based on their future utility in an AI-native workflow.

- **S0 (Irrelevant)**: Skills that AI neither helps nor hurts (e.g., "Walking", "Lifting").
- **S1 (AI-Relevant)**: Skills needed to build/maintain AI (e.g., "Python", "Prompt Engineering").
- **S2 (Complemented)**: Skills that become *more* valuable when paired with AI (e.g., "Strategic Planning", "Complex Negotiation").
- **S3 (Substitutable)**: Skills that are directly replaced by AI capabilities (e.g., "Basic Translation", "Copy Editing").

## 3. Metric Calculations

### Automation Score
Measures the pure potential for labor-saving automation.

```typescript
AutomationScore = Sum(Task_Weight * Exposure_Factor)
```
*Where Task_Weight is 1/Total_Tasks (assuming equal distribution).*

### Augmentation Score
Measures the potential for Human+AI synergy. High augmentation means a role has a mix of AI-exposed tasks and human-centric tasks, allowing the human to act as a "manager of bots."

We use a variation of the **Herfindahl-Hirschman Index (HHI)** to measure the "diversity" of the role's exposure. 

```typescript
AugmentationScore = Normalized(1 - (Share_Exposed² + Share_NonExposed²))
```

### AI Readiness Score
Measures the workforce's preparedness for adopting AI based on existing skill profiles.

```typescript
AIReadinessScore = ((Count(S1) * 1.0 + Count(S2) * 0.5) / TotalSkills) * 100
```
- **S1 Skills (AI-Relevant)** contribute 1.0 point.
- **S2 Skills (Complemented)** contribute 0.5 points.
- Normalized to 0-100.

### Transferability Index
A composite score indicating the overall urgency for transformation.

```typescript
TransferabilityIndex = (AutomationScore * 0.6) + (AugmentationScore * 0.4)
```

## 4. Quadrant Analysis

Roles are plotted on a 2D plane:
- **X-Axis**: Automation Potential
- **Y-Axis**: Augmentation Potential

**Quadrants:**
1. **Stable Role** (Low Auto, Low Aug): Physical or highly human-centric roles.
2. **Displacement Risk** (High Auto, Low Aug): Roles consisting mostly of E1 tasks.
3. **Augmentation Opportunity** (Low Auto, High Aug): Roles where AI helps specific parts but doesn't dominate.
4. **Hybrid Transformation** (High Auto, High Aug): The "Centaur" role. High potential for both.