import { RawAnalysisResponse, ComputedMetrics, ExposureLevel, AugmentationPotential, ProcessedTask, FullReport, SkillClass } from "../types";

export const calculateMetrics = (data: RawAnalysisResponse): FullReport => {
  const tasks = data.tasks || [];
  const totalTasks = tasks.length;

  // Exposure Factors for Aggregate Calculation
  const exposureFactors: Record<ExposureLevel, number> = {
    [ExposureLevel.E0]: 0,
    [ExposureLevel.E1]: 1.0,
    [ExposureLevel.E2]: 0.5,
    [ExposureLevel.E3]: 0.3,
  };

  // 1. Process Tasks to get Coordinates (X, Y)
  const processedTasks: ProcessedTask[] = tasks.map(task => {
    // Base X (Automation) based on Exposure Level
    let baseX = 0;
    switch (task.exposureLevel) {
      case ExposureLevel.E1: baseX = 1.0; break;
      case ExposureLevel.E2: baseX = 0.5; break;
      case ExposureLevel.E3: baseX = 0.3; break;
      case ExposureLevel.E0: baseX = 0.05; break;
    }

    // Base Y (Augmentation) based on Potential
    let baseY = 0;
    switch (task.augmentationPotential) {
      case AugmentationPotential.High: baseY = 0.85; break; // 0.7 - 1.0
      case AugmentationPotential.Medium: baseY = 0.5; break; // 0.4 - 0.6
      case AugmentationPotential.Low: baseY = 0.15; break; // 0.0 - 0.3
    }
    
    // Add Jitter (+/- 0.08) to prevent exact overlap
    // Use a pseudo-random seed based on description length to be deterministic-ish or just random
    const jitterX = (Math.random() - 0.5) * 0.16;
    const jitterY = (Math.random() - 0.5) * 0.16;

    let x = (baseX + jitterX) * 100;
    let y = (baseY + jitterY) * 100;

    // Clamp values
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    return {
      ...task,
      x,
      y
    };
  });


  // 2. Aggregate Automation Score Calculation
  if (totalTasks === 0) {
     return {
       ...data,
       tasks: [],
       automationScore: 0,
       augmentationScore: 0,
       transferabilityIndex: 0,
       aiReadinessScore: 0,
       quadrant: { x: 0, y: 0, label: "Unknown" },
       analysisDate: new Date().toISOString()
     };
  }

  const taskWeight = 1 / totalTasks;
  let weightedSum = 0;
  let exposedCount = 0;
  
  tasks.forEach((task) => {
    const factor = exposureFactors[task.exposureLevel];
    weightedSum += taskWeight * factor;

    if (task.exposureLevel !== ExposureLevel.E0) {
      exposedCount++;
    }
  });

  const automationScore = Math.min(100, Math.max(0, weightedSum * 100));

  // 3. Augmentation Score (Diversity Metric)
  const shareExposed = exposedCount / totalTasks;
  const shareNonExposed = 1 - shareExposed;
  let augmentationRaw = 1 - (Math.pow(shareExposed, 2) + Math.pow(shareNonExposed, 2));
  const augmentationScore = augmentationRaw * 2 * 100; 

  // 4. Transferability Index
  const transferabilityIndex = (automationScore * 0.6) + (augmentationScore * 0.4);

  // 5. Quadrant Classification
  let label = "Stable Role";
  const finalX = automationScore;
  const finalY = augmentationScore; 

  if (finalX > 50 && finalY > 50) label = "Hybrid Transformation";
  else if (finalX > 50 && finalY <= 50) label = "Displacement Risk";
  else if (finalX <= 50 && finalY > 50) label = "Augmentation Opportunity";
  else label = "Stable Role";

  // 6. AI Readiness Score
  // Weighted sum of skills: S1 (AI-Relevant) = 1.0, S2 (Complemented) = 0.5
  const totalSkills = data.skills ? data.skills.length : 0;
  let readinessWeightedSum = 0;

  if (data.skills) {
    data.skills.forEach(skill => {
      if (skill.classification === SkillClass.S1) {
        readinessWeightedSum += 1.0;
      } else if (skill.classification === SkillClass.S2) {
        readinessWeightedSum += 0.5;
      }
    });
  }

  const aiReadinessScore = totalSkills > 0 
    ? Math.round((readinessWeightedSum / totalSkills) * 100) 
    : 0;

  return {
    ...data,
    tasks: processedTasks,
    automationScore: Math.round(automationScore),
    augmentationScore: Math.round(augmentationScore),
    transferabilityIndex: Math.round(transferabilityIndex),
    aiReadinessScore,
    quadrant: { x: finalX, y: finalY, label },
    analysisDate: new Date().toISOString()
  };
};