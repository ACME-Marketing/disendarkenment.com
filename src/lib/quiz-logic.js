// Quiz questions and scoring logic for the psychedelic therapy readiness assessment

export const quizQuestions = [
  {
    id: 'mental_health',
    category: 'Mental Health',
    question: 'How would you rate your current mental health stability?',
    options: [
      { text: 'Excellent - I feel mentally stable and resilient', value: 5 },
      { text: 'Good - Generally stable with occasional challenges', value: 4 },
      { text: 'Fair - Some ongoing mental health concerns', value: 3 },
      { text: 'Poor - Significant mental health challenges', value: 2 },
      { text: 'Very poor - Currently in crisis or severe distress', value: 1 }
    ]
  },
  {
    id: 'support_system',
    category: 'Support System',
    question: 'Do you have a reliable support system (friends, family, therapist)?',
    options: [
      { text: 'Strong support system with multiple people I trust', value: 5 },
      { text: 'Good support from family and/or close friends', value: 4 },
      { text: 'Some support but limited', value: 3 },
      { text: 'Minimal support available', value: 2 },
      { text: 'Little to no support system', value: 1 }
    ]
  },
  {
    id: 'intention',
    category: 'Intention & Motivation',
    question: 'How clear are you about your intentions for psychedelic therapy?',
    options: [
      { text: 'Very clear - I have specific, well-defined goals', value: 5 },
      { text: 'Mostly clear - I know what I want to work on', value: 4 },
      { text: 'Somewhat clear - I have general ideas', value: 3 },
      { text: 'Unclear - I need help defining my goals', value: 2 },
      { text: 'No clear intention or goals', value: 1 }
    ]
  },
  {
    id: 'preparation',
    category: 'Preparation',
    question: 'How much preparation work have you done for this journey?',
    options: [
      { text: 'Extensive - Research, therapy, meditation practice', value: 5 },
      { text: 'Significant - Some research and self-reflection', value: 4 },
      { text: 'Moderate - Basic research and understanding', value: 3 },
      { text: 'Minimal - Just starting to learn', value: 2 },
      { text: 'None - No preparation yet', value: 1 }
    ]
  },
  {
    id: 'medical_clearance',
    category: 'Medical Health',
    question: 'Have you been medically cleared for psychedelic therapy?',
    options: [
      { text: 'Yes - Cleared by my physician', value: 5 },
      { text: 'Mostly - No major contraindications known', value: 4 },
      { text: 'Partial - Some minor concerns to discuss', value: 3 },
      { text: 'Uncertain - Need medical evaluation', value: 2 },
      { text: 'No - Have contraindications or unsure', value: 1 }
    ]
  },
  {
    id: 'integration_readiness',
    category: 'Integration Readiness',
    question: 'How ready are you to commit to integration work after the experience?',
    options: [
      { text: 'Fully committed - I understand integration is crucial', value: 5 },
      { text: 'Very ready - I plan to prioritize integration', value: 4 },
      { text: 'Moderately ready - I\'ll make time for it', value: 3 },
      { text: 'Somewhat ready - I\'ll try but may struggle', value: 2 },
      { text: 'Not ready - I don\'t see the importance', value: 1 }
    ]
  },
  {
    id: 'substance_use',
    category: 'Substance Use',
    question: 'How is your relationship with substances (alcohol, cannabis, etc.)?',
    options: [
      { text: 'Healthy - No problematic use patterns', value: 5 },
      { text: 'Generally healthy - Occasional recreational use', value: 4 },
      { text: 'Some concerns - Moderate use patterns', value: 3 },
      { text: 'Problematic - Regular problematic use', value: 2 },
      { text: 'Addictive - Struggling with substance use', value: 1 }
    ]
  },
  {
    id: 'trauma_history',
    category: 'Trauma History',
    question: 'How well have you processed past traumas or difficult experiences?',
    options: [
      { text: 'Well processed - Extensive therapy and healing work', value: 5 },
      { text: 'Mostly processed - Significant healing has occurred', value: 4 },
      { text: 'Partially processed - Some work done', value: 3 },
      { text: 'Minimally processed - Little therapeutic work', value: 2 },
      { text: 'Unprocessed - Significant unresolved trauma', value: 1 }
    ]
  },
  {
    id: 'expectations',
    category: 'Expectations',
    question: 'How realistic are your expectations about psychedelic therapy?',
    options: [
      { text: 'Very realistic - I understand it\'s not a magic cure', value: 5 },
      { text: 'Mostly realistic - I have reasonable expectations', value: 4 },
      { text: 'Somewhat realistic - I have some misconceptions', value: 3 },
      { text: 'Unrealistic - I expect it to fix everything', value: 2 },
      { text: 'Very unrealistic - I have dangerous expectations', value: 1 }
    ]
  },
  {
    id: 'commitment',
    category: 'Commitment',
    question: 'How committed are you to the full therapeutic process?',
    options: [
      { text: 'Fully committed - Time, money, and emotional investment', value: 5 },
      { text: 'Very committed - Ready to invest significantly', value: 4 },
      { text: 'Moderately committed - Willing to invest some resources', value: 3 },
      { text: 'Somewhat committed - Limited resources to invest', value: 2 },
      { text: 'Minimally committed - Not ready to invest much', value: 1 }
    ]
  }
];

export function calculateScore(answers) {
  const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
  const maxScore = quizQuestions.length * 5;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let level, description, action, color, bgColor;

  if (percentage >= 80) {
    level = 'High';
    description = 'You appear to be well-prepared for psychedelic therapy with strong foundations in place.';
    action = 'You\'re ready to schedule a consultation to discuss your journey in detail.';
    color = 'text-green-700';
    bgColor = 'bg-green-100';
  } else if (percentage >= 60) {
    level = 'Moderate';
    description = 'You have some good foundations but may benefit from additional preparation.';
    action = 'Consider scheduling a consultation to discuss areas that need strengthening.';
    color = 'text-yellow-700';
    bgColor = 'bg-yellow-100';
  } else if (percentage >= 40) {
    level = 'Low-Moderate';
    description = 'You may need significant preparation before pursuing psychedelic therapy.';
    action = 'We recommend additional preparation work and consultation before proceeding.';
    color = 'text-orange-700';
    bgColor = 'bg-orange-100';
  } else {
    level = 'Low';
    description = 'You may not be ready for psychedelic therapy at this time.';
    action = 'Focus on building foundations through therapy, support systems, and education first.';
    color = 'text-red-700';
    bgColor = 'bg-red-100';
  }

  return {
    totalScore,
    maxScore,
    percentage,
    level: { level, description, action, color, bgColor }
  };
}

export function generateRecommendations(answers) {
  const recommendations = [];

  // Mental health recommendations
  if (answers.mental_health <= 2) {
    recommendations.push({
      category: 'Mental Health',
      priority: 'high',
      suggestion: 'Consider working with a mental health professional to stabilize your mental health before pursuing psychedelic therapy.'
    });
  } else if (answers.mental_health === 3) {
    recommendations.push({
      category: 'Mental Health',
      priority: 'medium',
      suggestion: 'Continue mental health support and discuss psychedelic therapy readiness with your therapist.'
    });
  }

  // Support system recommendations
  if (answers.support_system <= 2) {
    recommendations.push({
      category: 'Support System',
      priority: 'high',
      suggestion: 'Focus on building a reliable support network before beginning psychedelic therapy.'
    });
  } else if (answers.support_system === 3) {
    recommendations.push({
      category: 'Support System',
      priority: 'medium',
      suggestion: 'Strengthen your existing support system and consider joining support groups.'
    });
  }

  // Preparation recommendations
  if (answers.preparation <= 2) {
    recommendations.push({
      category: 'Preparation',
      priority: 'high',
      suggestion: 'Invest significant time in research, reading, and learning about psychedelic therapy.'
    });
  } else if (answers.preparation === 3) {
    recommendations.push({
      category: 'Preparation',
      priority: 'medium',
      suggestion: 'Deepen your understanding through books, podcasts, and educational resources.'
    });
  }

  // Medical clearance recommendations
  if (answers.medical_clearance <= 2) {
    recommendations.push({
      category: 'Medical Health',
      priority: 'high',
      suggestion: 'Schedule a comprehensive medical evaluation with your physician before proceeding.'
    });
  }

  // Integration readiness recommendations
  if (answers.integration_readiness <= 2) {
    recommendations.push({
      category: 'Integration',
      priority: 'high',
      suggestion: 'Learn about integration practices and commit to post-journey support.'
    });
  }

  // Substance use recommendations
  if (answers.substance_use <= 2) {
    recommendations.push({
      category: 'Substance Use',
      priority: 'high',
      suggestion: 'Address any problematic substance use patterns before psychedelic therapy.'
    });
  } else if (answers.substance_use === 3) {
    recommendations.push({
      category: 'Substance Use',
      priority: 'medium',
      suggestion: 'Evaluate your relationship with substances and consider moderation.'
    });
  }

  // Trauma history recommendations
  if (answers.trauma_history <= 2) {
    recommendations.push({
      category: 'Trauma Healing',
      priority: 'high',
      suggestion: 'Consider trauma-focused therapy to process past experiences before psychedelic work.'
    });
  } else if (answers.trauma_history === 3) {
    recommendations.push({
      category: 'Trauma Healing',
      priority: 'medium',
      suggestion: 'Continue trauma healing work alongside psychedelic preparation.'
    });
  }

  // Expectations recommendations
  if (answers.expectations <= 2) {
    recommendations.push({
      category: 'Expectations',
      priority: 'medium',
      suggestion: 'Learn about realistic outcomes and the nature of psychedelic healing.'
    });
  }

  return recommendations;
}

export function formatScore(score) {
  const result = calculateScore(score);
  const recommendations = generateRecommendations(score);
  
  return {
    ...result,
    recommendations
  };
}

// Export for use in components
export default {
  quizQuestions,
  calculateScore,
  generateRecommendations,
  formatScore
};