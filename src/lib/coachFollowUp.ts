/**
 * Coach Follow-Up Question Generator
 * Simple rule-based system to generate empathetic follow-up questions
 */

interface FollowUpQuestion {
  question: string;
  keywords: string[];
  sentiment?: 'negative' | 'positive' | 'neutral';
}

const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  // Stress & Work
  {
    question: "You mentioned feeling stressed about work. Want to talk more about what triggered that?",
    keywords: ['stress', 'work', 'stressed', 'job', 'busy'],
    sentiment: 'negative',
  },
  {
    question: "How long has this work situation been weighing on you?",
    keywords: ['work', 'overwhelmed', 'pressure', 'deadline'],
    sentiment: 'negative',
  },
  {
    question: "What would help you feel less stressed about this?",
    keywords: ['stress', 'anxious', 'worried', 'nervous'],
    sentiment: 'negative',
  },

  // Emotions & Feelings
  {
    question: "What's making you feel frustrated right now?",
    keywords: ['frustrated', 'annoyed', 'angry', 'mad'],
    sentiment: 'negative',
  },
  {
    question: "That sounds difficult. How are you taking care of yourself through this?",
    keywords: ['hard', 'difficult', 'tough', 'struggling'],
    sentiment: 'negative',
  },
  {
    question: "I hear you're feeling tired. What do you think your body is trying to tell you?",
    keywords: ['tired', 'exhausted', 'drained', 'fatigued', 'sleepy'],
    sentiment: 'negative',
  },

  // Relationships & Family
  {
    question: "Tell me more about what's going on with your family.",
    keywords: ['family', 'parents', 'mom', 'dad', 'siblings'],
  },
  {
    question: "How did that conversation with them make you feel?",
    keywords: ['talk', 'conversation', 'said', 'told'],
  },
  {
    question: "What would you like to say to them if you could?",
    keywords: ['relationship', 'partner', 'friend', 'boyfriend', 'girlfriend'],
  },

  // Positive moments
  {
    question: "That's wonderful! What made that moment so special?",
    keywords: ['happy', 'excited', 'great', 'amazing', 'wonderful'],
    sentiment: 'positive',
  },
  {
    question: "I'm glad you're feeling better. What helped shift things for you?",
    keywords: ['better', 'good', 'improved', 'relief'],
    sentiment: 'positive',
  },

  // Self-reflection
  {
    question: "What do you think you need most right now?",
    keywords: ['need', 'want', 'wish', 'hope'],
  },
  {
    question: "How are you really feeling about all of this?",
    keywords: ['feel', 'feeling', 'emotion'],
  },
  {
    question: "What's one small thing you could do for yourself today?",
    keywords: ['overwhelm', 'too much', 'can\'t', 'unable'],
    sentiment: 'negative',
  },
];

/**
 * Generate a follow-up question based on transcription content
 */
export function generateFollowUpQuestion(transcription: string): string | null {
  if (!transcription || transcription.trim().length < 20) {
    return null; // Too short, skip follow-up
  }

  const lowerText = transcription.toLowerCase();

  // Detect sentiment
  const negativeWords = ['bad', 'sad', 'angry', 'frustrated', 'stressed', 'worried', 'anxious', 'tired', 'exhausted', 'difficult', 'hard', 'struggle'];
  const positiveWords = ['good', 'happy', 'great', 'excited', 'wonderful', 'amazing', 'better', 'relief', 'joy'];

  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;

  const detectedSentiment: 'negative' | 'positive' | 'neutral' =
    negativeCount > positiveCount ? 'negative' :
    positiveCount > negativeCount ? 'positive' :
    'neutral';

  // Find matching questions
  const matches: { question: FollowUpQuestion; score: number }[] = [];

  for (const q of FOLLOW_UP_QUESTIONS) {
    let score = 0;

    // Count keyword matches
    const keywordMatches = q.keywords.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    ).length;

    score += keywordMatches * 10;

    // Sentiment bonus
    if (q.sentiment && q.sentiment === detectedSentiment) {
      score += 5;
    }

    if (score > 0) {
      matches.push({ question: q, score });
    }
  }

  // Sort by score and pick the best match
  if (matches.length > 0) {
    matches.sort((a, b) => b.score - a.score);
    return matches[0].question.question;
  }

  // Default fallback questions based on sentiment
  if (detectedSentiment === 'negative') {
    return "That sounds challenging. Would you like to tell me more about how you're feeling?";
  } else if (detectedSentiment === 'positive') {
    return "That's great to hear. What else is going well for you?";
  }

  // Generic follow-up
  return "Is there anything else on your mind you'd like to explore?";
}

/**
 * Check if we should show follow-up (rate limiting, user preferences)
 */
export function shouldShowFollowUp(entryCount: number): boolean {
  // Don't show on first entry (user is just getting started)
  if (entryCount === 0) {
    return false;
  }

  // Show follow-up on ~70% of entries (not too pushy)
  return Math.random() < 0.7;
}
