// Talk-it-through helper — voice-back conversation prompts.
// Note: Mode 2 (live back-and-forth) is not the V1 hero loop. This file
// powers an older flow still reachable from the home screen; rewritten
// to match the v3 voice (light, dry, steady — never coach-y).

import { chatCompletion } from '@/lib/apiClient';

interface CoachMessage {
  role: 'coach' | 'user';
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  messages: CoachMessage[];
  totalDuration: number; // Total recording time in seconds
}

// Opening questions based on time of day
function getOpeningQuestion(): string {
  const hour = new Date().getHours();

  const morningQuestions = [
    "Good morning. How are you feeling as you start your day?",
    "Hey there. What's on your mind this morning?",
    "Morning. How did you sleep, and what's the first thing you're thinking about today?",
    "Hi. Before the day gets going, what's something you're looking forward to or thinking about?",
  ];

  const afternoonQuestions = [
    "Hey. How's your day going so far?",
    "Hi there. What's been on your mind today?",
    "Afternoon. Anything from today that you'd like to talk through?",
    "Hey. How are you feeling right now, in this moment?",
  ];

  const eveningQuestions = [
    "Hey. How was your day?",
    "Evening. What's something from today that stuck with you?",
    "Hi. As your day winds down, what's on your mind?",
    "Hey there. Anything you want to reflect on from today?",
  ];

  const nightQuestions = [
    "Hey. How are you feeling tonight?",
    "Hi. What's keeping you up or on your mind right now?",
    "Late night thoughts? I'm here to listen.",
    "Hey. Before you rest, is there anything you want to get off your chest?",
  ];

  let questions: string[];
  if (hour >= 5 && hour < 12) {
    questions = morningQuestions;
  } else if (hour >= 12 && hour < 17) {
    questions = afternoonQuestions;
  } else if (hour >= 17 && hour < 21) {
    questions = eveningQuestions;
  } else {
    questions = nightQuestions;
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

// Generate a follow-up question based on what the user said
export async function generateCoachResponse(
  userMessage: string,
  context: ConversationContext,
  wantsToContinue: boolean
): Promise<string> {
  // If user wants to wrap up, give a closing response
  if (!wantsToContinue) {
    return generateClosingResponse(userMessage, context);
  }

  // Generate a thoughtful follow-up question
  try {
    const result = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: `Help the user keep talking so they can get it out. Reply with ONE short, plain follow-up — 1–2 sentences max. Brief acknowledgment first, then the follow-up. Your reply will be spoken aloud, so keep it conversational.

Tone: light, dry, steady. Warm not tender, calm not somber, blunt without cold. Meet their intensity, then lift — never heavier than what they brought in.

Never pathologize, flatter identity ("you're the strong one"), moralize, add tasks, give advice unless asked, or sound like a therapist. Skip "That's wonderful," "Great job," "I'm so sorry to hear that" — don't perform empathy, just talk.

Good shapes:
- "And then what?"
- "What part of that is sitting with you most?"
- "How long has it been like this?"
- "Anything else stuck on it?"`,
        },
        ...context.messages.map((m) => ({
          role: m.role === 'coach' ? 'assistant' : ('user' as const),
          content: m.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return result.content || "Tell me more about that.";
  } catch (error) {
    console.error('Coach response generation failed:', error);
    // Fallback follow-up questions
    const fallbacks = [
      "Tell me more about that.",
      "How does that make you feel?",
      "What else comes to mind when you think about that?",
      "And what do you think that means for you?",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Generate a closing response when user is done
function generateClosingResponse(userMessage: string, context: ConversationContext): string {
  const closings = [
    "Thanks for sharing with me today. Take care of yourself.",
    "I appreciate you opening up. Hope the rest of your day goes well.",
    "Thanks for talking through that. See you next time.",
    "Glad we could chat. Take it easy.",
    "Thanks for sharing. Remember, you can always come back when you need to talk.",
  ];

  return closings[Math.floor(Math.random() * closings.length)];
}

// Generate the "continue or done" prompt
export function getContinuePrompt(): string {
  const prompts = [
    "Would you like to explore that more, or are you good for today?",
    "We can keep going if you'd like, or wrap up here. What feels right?",
    "Want to dig into that a bit more, or is this a good stopping point?",
    "Should we continue, or does that feel complete for now?",
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

export { getOpeningQuestion, type CoachMessage, type ConversationContext };
