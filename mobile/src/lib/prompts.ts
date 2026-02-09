export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompts: string[];
}

export const promptCategories: PromptCategory[] = [
  {
    id: 'work',
    name: 'Work & Career',
    description: 'Navigate professional challenges',
    icon: 'briefcase',
    prompts: [
      "What is weighing on you most at work right now?",
      "If you could change one thing about your work situation, what would it be?",
      "What accomplishment, big or small, have you overlooked recently?",
      "What is a conversation you have been avoiding? What would you say?",
      "Describe the gap between where you are and where you want to be professionally.",
      "What would your ideal workday look like?",
    ],
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Process connection and conflict',
    icon: 'users',
    prompts: [
      "Who have you been thinking about lately? Why do you think they are on your mind?",
      "Is there something left unsaid with someone? What is it?",
      "What do you need from the people in your life right now?",
      "Describe a recent interaction that affected you more than expected.",
      "Who do you wish understood you better? What would you want them to know?",
      "What pattern do you notice in how you relate to others?",
    ],
  },
  {
    id: 'self',
    name: 'Self & Identity',
    description: 'Explore who you are',
    icon: 'user',
    prompts: [
      "What are you most proud of about yourself that others might not know?",
      "What fear has been holding you back?",
      "What would you do if you knew you could not fail?",
      "Describe a belief about yourself you are starting to question.",
      "What does your inner critic say most often? What would you say back?",
      "What part of yourself have you been neglecting?",
    ],
  },
  {
    id: 'stress',
    name: 'Stress & Anxiety',
    description: 'Unload what is heavy',
    icon: 'cloud',
    prompts: [
      "What is the thing you keep replaying in your head?",
      "If you could put your anxiety into words, what would it say?",
      "What is one thing you can control about this situation?",
      "What would good enough look like right now?",
      "What is the worst case you are imagining? How likely is it really?",
      "What do you need to let go of to move forward?",
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude & Joy',
    description: 'Notice what is good',
    icon: 'sun',
    prompts: [
      "What small moment made today better?",
      "Who or what are you grateful for that you have not acknowledged?",
      "What is something ordinary that you would miss if it were gone?",
      "Describe a recent moment when you felt at peace.",
      "What is something you are looking forward to, even slightly?",
      "What made you smile or laugh recently?",
    ],
  },
  {
    id: 'change',
    name: 'Change & Decisions',
    description: 'Navigate transitions',
    icon: 'compass',
    prompts: [
      "What decision have you been putting off? What is really stopping you?",
      "What season of life are you in right now? What does it need from you?",
      "If you made the change you are considering, what would tomorrow look like?",
      "What is ending? What might be beginning?",
      "What would you tell yourself a year ago? What do you hope to tell yourself in a year?",
      "What are you outgrowing?",
    ],
  },
];

export function getRandomPrompt(): { prompt: string; category: PromptCategory } {
  const category = promptCategories[Math.floor(Math.random() * promptCategories.length)];
  const prompt = category.prompts[Math.floor(Math.random() * category.prompts.length)];
  return { prompt, category };
}

export function getPromptsForCategory(categoryId: string): string[] {
  const category = promptCategories.find((c) => c.id === categoryId);
  return category?.prompts || [];
}
